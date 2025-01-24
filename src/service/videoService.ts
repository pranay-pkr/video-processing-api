import path from "path";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import Video from "../models/video";

interface VideoMetadata {
  id: number;
  filename: string;
  path: string;
  size: number;
  duration: number;
}

class VideoService {
  // Helper function to get video duration
  private static getVideoDuration(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
        }
        let duration = metadata?.format?.duration || 0;
        if (!duration) {
          reject(new Error("Invalid video file"));
          return;
        }
        resolve(duration);
      });
    });
  }

  // Video upload service
  static async uploadVideo(file: Express.Multer.File): Promise<VideoMetadata> {
    try {
      if (!file) throw new Error("No video file uploaded");

      // Check file size (max: 25MB)
      if (file.size > 25 * 1024 * 1024) {
        throw new Error("File size exceeds the maximum limit of 25MB");
      }

      const duration = await VideoService.getVideoDuration(file.path);
      // Check video duration (min: 5 seconds, max: 25 seconds)
      if (duration < 5 || duration > 25) {
        throw new Error("Video duration must be between 5 and 25 seconds");
      }

      const video = await Video.create({
        filename: file.filename,
        path: file.path,
        size: file.size,
        duration,
      });

      return {
        id: video.id,
        filename: video.filename,
        path: video.path,
        size: video.size,
        duration: video.duration,
      };
    } catch (error: any) {
      console.log(error.message);
      throw new Error(error.message);
    }
  }
}

export default VideoService;
