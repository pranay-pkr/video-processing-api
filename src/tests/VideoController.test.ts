import { VideoController } from "../controller/VideoController";
import { VideoService } from "../service/VideoService";
import { Request, Response } from "express";
import { describe, expect, test } from "@jest/globals";

jest.mock("../service/VideoService");

describe("VideoController", () => {
  //   const VideoController = new VideoService();
  //   const VideoController = new VideoController(VideoController);

  describe("uploadVideo", () => {
    it("should return 201 with video data on successful upload", async () => {
      const req = {
        file: {
          originalname: "video.mp4",
          mimetype: "video/mp4",
        },
      } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      jest.spyOn(VideoService, "uploadVideo").mockResolvedValue({
        id: 1,
      });

      await VideoController.uploadVideo(req, res as unknown as Response);

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({
        id: 1,
      });
    });

    it("should return 400 with error message on invalid file", async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await VideoController.uploadVideo(
        req as Request,
        res as unknown as Response
      );

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({
        error: "No video file uploaded",
      });
    });
  });

  describe("mergeVideos", () => {
    it("should return 200 with output path on successful merge", async () => {
      const req = {
        body: {
          ids: [1, 2, 3],
        },
      } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      jest.spyOn(VideoService, "mergeVideos").mockResolvedValue({ id: 4 });

      await VideoController.mergeVideos(req, res as unknown as Response);

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({ id: 4 });
    });
    it("should return 400 with error message on invalid ids", async () => {
      const req = {
        body: {
          ids: [1],
        },
      } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await VideoController.mergeVideos(req, res as unknown as Response);

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({
        error: "Please provide at least two video IDs",
      });
    });
  });

  describe("trimVideo", () => {
    it("should return 200 with output path on successful trim", async () => {
      const req = {
        body: {
          id: 1,
          start: 10,
          end: 20,
        },
      } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      jest.spyOn(VideoService, "trimVideo").mockResolvedValue({ id: 4 });

      await VideoController.trimVideo(req, res as unknown as Response);

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({ id: 4 });
    });
    it("should return 400 with error message on invalid ids", async () => {
      const req = {
        body: {
          id: 1,
          start: 10,
        },
      } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await VideoController.trimVideo(req, res as unknown as Response);

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({
        error: "Missing required parameters",
      });
    });
  });

  describe("getSignedUrl", () => {
    it("should return 200 with signed url on successful get", async () => {
      const req = {
        params: {
          id: 1,
        },
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      jest
        .spyOn(VideoService, "getSignedUrl")
        .mockResolvedValue("http://localhost:30000/video/1?token=1234");
      await VideoController.getSignedUrl(req, res as unknown as Response);

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({
        signedUrl: "http://localhost:30000/video/1?token=1234",
      });
    });
    it("should return 400 with error message on invalid ids", async () => {
      const req = {
        params: {},
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await VideoController.getSignedUrl(req, res as unknown as Response);

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({
        error: "Missing required parameters",
      });
    });
  });

  describe("getVideo", () => {
    it("should return 200 with signed url on successful get", async () => {
      const req = {
        params: {
          id: 1,
        },
        query: {
          token: "1234",
        },
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        sendFile: jest.fn().mockReturnThis(),
      };

      jest
        .spyOn(VideoService, "getVideo")
        .mockResolvedValue("http://localhost:30000/video/1?token=1234");
      await VideoController.getVideo(req, res as unknown as Response);

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.sendFile).toHaveBeenCalledTimes(1);
      expect(res.sendFile).toHaveBeenCalledWith(
        "http://localhost:30000/video/1?token=1234"
      );
    });
    it("should return 400 with error message on invalid ids", async () => {
      const req = {
        params: {},
        query: {},
      } as unknown as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await VideoController.getVideo(req, res as unknown as Response);

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({
        error: "Missing required parameters",
      });
    });
  });
});
