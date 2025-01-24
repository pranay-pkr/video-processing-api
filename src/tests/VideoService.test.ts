import { VideoService } from "../service/VideoService";
import { Request, Response } from "express";
import { describe, expect, test } from "@jest/globals";
import Video from "../models/Video";
import ErrorHandler from "../ErrorHandler";
import fs from "fs";
import { constants } from "../constants";
import jwt from "jsonwebtoken";

describe("VideoService", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("uploadVideo", () => {
    it("should upload a video file successfully", async () => {
      const file = {
        originalname: "video.mp4",
        mimetype: "video/mp4",
        path: "uploads/3bf3a240-f3a2-4a0d-b6ad-2a93d5e37253.mp4",
      } as Express.Multer.File;
      const video = {
        filename: "video.mp4",
        path: "uploads/3bf3a240-f3a2-4a0d-b6ad-2a93d5e37253.mp4",
        size: 1024,
        duration: 10,
        id: 1,
      } as Video;
      jest.spyOn(Video, "create").mockResolvedValue(video);
      const result = await VideoService.uploadVideo(file);
      expect(result).toEqual({ id: video.id });
    });

    it("should throw an error if file size exceeds 25MB", async () => {
      const file = {
        originalname: "video.mp4",
        mimetype: "video/mp4",
        path: "uploads/1bc4213c-c199-44bf-92a1-adb8dcbe4b3a.mp4",
        size: 1024 * 1024 * 26,
      } as Express.Multer.File;

      jest.spyOn(fs, "unlinkSync").mockImplementation(() => {});

      await expect(VideoService.uploadVideo(file)).rejects.toEqual({
        message: "File size exceeds the maximum limit of 25MB",
        status: 400,
      });
    });

    it("should throw an error if video duration is less than 5 seconds", async () => {
      const file = {
        originalname: "video.mp4",
        mimetype: "video/mp4",
        path: "uploads/trimmed_32554243-8021-4a56-bd30-3c24cce88255.mp4",
        size: 1024 * 1024 * 25,
      } as Express.Multer.File;
      jest.spyOn(fs, "unlinkSync").mockImplementation(() => {});

      await expect(VideoService.uploadVideo(file)).rejects.toEqual({
        message: "Video duration must be between 5 and 25 seconds",
        status: 400,
      });
    });

    it("should throw an error if video duration is greater than 25 seconds", async () => {
      const file = {
        originalname: "video.mp4",
        mimetype: "video/mp4",
        path: "uploads/merged_video_8a1d6e10-3e4f-4087-93c5-3e5980cd1665.mp4",
        size: 1024 * 1024 * 25,
      } as Express.Multer.File;
      jest.spyOn(fs, "unlinkSync").mockImplementation(() => {});

      await expect(VideoService.uploadVideo(file)).rejects.toEqual({
        message: "Video duration must be between 5 and 25 seconds",
        status: 400,
      });
    });
  });

  describe("trimVideo", () => {
    it("should trim the video file of the provided id, start and end time  and return the trimmed video file id", async () => {
      const id = 1;
      const start = 10;
      const end = 15;
      const video = {
        filename: "video.mp4",
        path: "uploads/3bf3a240-f3a2-4a0d-b6ad-2a93d5e37253.mp4",
        size: 1024,
        duration: 20,
        id: 1,
      } as Video;
      jest.spyOn(Video, "findByPk").mockResolvedValue(video);
      const newVideo = {
        filename: "video.mp4",
        path: "uploads/c9eb981f-5d5b-4413-aaff-b0ca0c01bef8.mp4",
        size: 1024,
        duration: 10,
        id: 2,
      };
      jest.spyOn(Video, "create").mockImplementation(() => {
        return newVideo;
      });
      const result = await VideoService.trimVideo(id, start, end);
      expect(result).toEqual({ id: newVideo.id });
    });

    it("should throw an error if the video file is not found", async () => {
      const id = 1;
      const start = 10;
      const end = 15;
      jest.spyOn(Video, "findByPk").mockResolvedValue(null);
      await expect(VideoService.trimVideo(id, start, end)).rejects.toEqual({
        message: "Video not found",
        status: 404,
      });
    });

    it("should throw an error if the start or end time is invalid", async () => {
      const id = 1;
      const start = 10;
      const end = 5;
      jest.spyOn(Video, "findByPk").mockResolvedValue({
        filename: "video.mp4",
        path: "uploads/3bf3a240-f3a2-4a0d-b6ad-2a93d5e37253.mp4",
        size: 1024,
        duration: 20,
        id: 1,
      } as Video);
      await expect(VideoService.trimVideo(id, start, end)).rejects.toEqual({
        message: "Invalid start or end time",
        status: 400,
      });
    });
  });

  describe("mergeVideos", () => {
    it("should merge the videos of the provided ids and return the merged video file id", async () => {
      const ids = [1, 2];
      const videos = [
        {
          filename: "video1.mp4",
          path: "uploads/3bf3a240-f3a2-4a0d-b6ad-2a93d5e37253.mp4",
          size: 1024,
          duration: 20,
          id: 1,
        },
        {
          filename: "video2.mp4",
          path: "uploads/trimmed_2830a472-16e2-4203-a90a-cf88fe45d137.mp4",
          size: 1024,
          duration: 20,
          id: 2,
        },
      ];
      const mergedVideo = {
        filename: "video.mp4",
        path: "uploads/merged_video_8a1d6e10-3e4f-4087-93c5-3e5980cd16655.mp4",
        size: 1024,
        duration: 20,
        id: 4,
      } as Video;

      jest.spyOn(Video, "findAll").mockResolvedValue(videos as Video[]);
      jest.spyOn(Video, "create").mockImplementation(() => {
        return mergedVideo;
      });

      const result = await VideoService.mergeVideos(ids);
      expect(result).toEqual({ id: mergedVideo.id });
    }, 10000);

    it("should throw an error if the videos are not found", async () => {
      const ids = [1, 2];
      jest.spyOn(Video, "findAll").mockResolvedValue([]);
      await expect(VideoService.mergeVideos(ids)).rejects.toEqual({
        message: "One or more videos not found",
        status: 400,
      });
    });
  });

  describe("getSignedUrl", () => {
    it("should return a signed URL for the video file", async () => {
      const id = "1";
      const video = {
        filename: "video.mp4",
        path: "uploads/3bf3a240-f3a2-4a0d-b6ad-2a93d5e37253.mp4",
        size: 1024,
        duration: 20,
        id: 1,
      } as Video;
      let token = 1234;
      let signedUrl = `${constants.HOST}:${constants.PORT}/api/videos/${id}?token=${token}`;
      jest.spyOn(Video, "findByPk").mockResolvedValue(video);
      jest.spyOn(jwt, "sign").mockImplementation(() => {
        return token;
      });

      const result = await VideoService.getSignedUrl(id);
      expect(result).toEqual(signedUrl);
    });

    it("should throw an error if the video file is not found", async () => {
      const id = "1";
      jest.spyOn(Video, "findByPk").mockResolvedValue(null);
      await expect(VideoService.getSignedUrl(id)).rejects.toEqual({
        message: "Video not found",
        status: 404,
      });
    });
  });

  describe("getVideo", () => {
    it("should return the video file", async () => {
      const id = "1";
      const video = {
        filename: "video.mp4",
        path: "uploads/3bf3a240-f3a2-4a0d-b6ad-2a93d5e37253.mp4",
        size: 1024,
        duration: 20,
        id: 1,
      } as Video;
      let token = "1234";
      jest.spyOn(jwt, "verify").mockImplementation(() => {});
      jest.spyOn(jwt, "decode").mockImplementation(() => {
        return { id };
      });
      jest.spyOn(Video, "findByPk").mockResolvedValue(video);
      const result = await VideoService.getVideo(id, token);
      expect(result).toEqual(video.path);
    });

    it("should throw an error if the video file is not found", async () => {
      const id = "1";
      jest.spyOn(Video, "findByPk").mockResolvedValue(null);
      await expect(VideoService.getVideo(id, "")).rejects.toEqual({
        message: "Video not found",
        status: 404,
      });
    });
  });
});
