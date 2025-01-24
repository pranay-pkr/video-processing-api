import path from "path";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import Video from "../models/Video";
import jwt from "jsonwebtoken";
import { constants } from "../constants";
import ErrorHandler from "../ErrorHandler";

interface VideoMetadata {
  id: number;
}

export class VideoService {
  // Video upload service
  static async uploadVideo(file: Express.Multer.File): Promise<VideoMetadata> {
    try {
      // Check file size (max: 25MB)
      if (file.size > 25 * 1024 * 1024) {
        throw new ErrorHandler(
          "File size exceeds the maximum limit of 25MB",
          400
        );
      }

      const duration = await VideoService.getVideoDuration(file.path);
      // Check video duration (min: 5 seconds, max: 25 seconds)
      if (duration < 5 || duration > 25) {
        throw new ErrorHandler(
          "Video duration must be between 5 and 25 seconds",
          400
        );
      }

      const video = await Video.create({
        filename: file.filename,
        path: file.path,
        size: file.size,
        duration,
      });

      return {
        id: video.id,
      };
    } catch (error: any) {
      console.log(error.message);
      fs.unlinkSync(file.path);
      if (error instanceof ErrorHandler) {
        throw error;
      }

      throw new ErrorHandler(error.message, 500);
    }
  }

  static async trimVideo(
    id: number,
    start: number,
    end: number
  ): Promise<VideoMetadata> {
    try {
      const video = await Video.findByPk(id);
      if (!video) throw new ErrorHandler("Video not found", 404);

      if (start < 0 || end < 0 || start >= end || end > video.duration) {
        throw new ErrorHandler("Invalid start or end time", 400);
      }
      const fileName = `trimmed_${crypto.randomUUID()}.mp4`;
      const output = path.join(__dirname, "../..", "uploads", fileName);

      await this.trimVideoHelper(video.path, start, end, output);
      const size = this.getFileSize(output);
      const duration = await this.getVideoDuration(output);
      const trimmedVideo = await Video.create({
        filename: fileName,
        path: output,
        size: size,
        duration,
      });
      return {
        id: trimmedVideo.id,
      };
    } catch (error: any) {
      console.log(error.message);
      if (error instanceof ErrorHandler) {
        throw error;
      }
      throw new ErrorHandler(error.message, 500);
    }
  }

  static async mergeVideos(ids: number[]): Promise<VideoMetadata> {
    try {
      const videos = await Video.findAll({
        where: { id: ids },
      });

      if (videos.length < 2) {
        throw new ErrorHandler("One or more videos not found", 400);
      }
      const fileName = `merged_video_${crypto.randomUUID()}.mp4`;
      const output = path.join(__dirname, "../..", "uploads", fileName);
      const inputFiles = videos.map((video) => video.path);
      await this.mergeVideosHelper(inputFiles, output);
      const size = this.getFileSize(output);
      const duration = await VideoService.getVideoDuration(output);
      const video = await Video.create({
        filename: fileName,
        path: output,
        size: size,
        duration,
      });

      return {
        id: video.id,
      };
    } catch (error: any) {
      if (error instanceof ErrorHandler) {
        throw error;
      }
      throw new ErrorHandler(error.message, 500);
    }
  }

  static async getSignedUrl(id: string): Promise<string> {
    try {
      const video = await Video.findByPk(id);
      if (!video) throw new ErrorHandler("Video not found", 404);
      const payload = {
        id: video.id,
      };
      const token = this.generateSignedUrl(payload);

      const signedUrl = `${constants.HOST}:${constants.PORT}/api/video/${id}?token=${token}`;

      return signedUrl;
    } catch (error: any) {
      console.log(error.message);
      if (error instanceof ErrorHandler) {
        throw error;
      }
      throw new ErrorHandler(error.message, 500);
    }
  }

  static async getVideo(id: string, token: any): Promise<string> {
    try {
      jwt.verify(token, constants.JWT_SECRET, (err: any, decoded: any) => {
        if (err) {
          throw new ErrorHandler("Invalid token", 400);
        }
      });
      let decodedToken: any = jwt.decode(token);
      let id = decodedToken?.id as string;
      const video = await Video.findByPk(id);
      if (!video) throw new ErrorHandler("Video not found", 404);

      return video.path;
    } catch (error: any) {
      console.log(error.message);
      if (error instanceof ErrorHandler) {
        throw error;
      }
      throw new ErrorHandler(error.message, 500);
    }
  }

  private static mergeVideosHelper(inputFiles: string[], output: string) {
    return new Promise((resolve, reject) => {
      const command = ffmpeg();
      inputFiles.forEach((file) => command.input(file));

      command
        .on("end", () => resolve(output))
        .on("error", (err) => {
          console.log(err);
          reject(new ErrorHandler("Error merging videos", 500));
        })
        .mergeToFile(output, path.join(__dirname, "..", "uploads"));
    });
  }
  private static trimVideoHelper(
    path: string,
    start: number,
    end: number,
    output: string
  ) {
    return new Promise((resolve, reject) => {
      ffmpeg(path)
        .setStartTime(start)
        .setDuration(end - start)
        .output(output)
        .on("end", () => resolve(output))
        .on("error", (err) =>
          reject(new ErrorHandler("Error trimming video", 500))
        )
        .run();
    });
  }

  private static getFileSize(filePath: string): number {
    const stats = fs.statSync(filePath);
    return stats.size;
  }

  private static generateSignedUrl(payload: any) {
    return jwt.sign(payload, constants.JWT_SECRET, {
      expiresIn: "1hr",
    });
  }
  // Helper function to get video duration
  private static getVideoDuration(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
        }
        let duration = metadata?.format?.duration || 0;
        if (!duration) {
          reject(new ErrorHandler("Invalid video file", 400));
          return;
        }
        resolve(duration);
      });
    });
  }
}

export default VideoService;
