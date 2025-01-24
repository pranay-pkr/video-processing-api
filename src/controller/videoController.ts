import { Request, Response } from "express";
import VideoService from "../service/videoService";

class VideoController {
  // Handle video upload
  static async uploadVideo(req: Request, res: Response) {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No video file uploaded" });
    }

    try {
      const videoData = await VideoService.uploadVideo(file);
      res.status(201).json(videoData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  static async mergeVideos(req: Request, res: Response) {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length < 2) {
      return res
        .status(400)
        .json({ error: "Please provide at least two video IDs" });
    }

    try {
      const outputPath = await VideoService.mergeVideos(ids);
      res.status(200).json(outputPath);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async trimVideo(req: Request, res: Response) {
    const { id, start, end } = req.body;

    if (!id || start === undefined || end === undefined) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    try {
      const outputPath = await VideoService.trimVideo(id, start, end);
      res.status(200).json(outputPath);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getSignedUrl(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    try {
      const signedUrl = await VideoService.getSignedUrl(id);
      res.status(200).json({ signedUrl });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getVideo(req: Request, res: Response) {
    const { id } = req.params;
    const { token } = req.query;
    if (!id || !token) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    try {
      const video = await VideoService.getVideo(id, token);
      res.status(200).sendFile(video);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default VideoController;
