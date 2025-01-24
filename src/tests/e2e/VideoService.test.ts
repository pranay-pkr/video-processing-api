import request from "supertest";
import app, { server } from "../../index";
import { Video } from "../../models/Video";

describe("E2E tests for VideoService", () => {
  process.env.NODE_ENV = "test";
  afterAll(async () => {
    // Close the server after all tests
    server.close();
    await Video.destroy({ where: {} });
    process.env.NODE_ENV = "";
  });

  let id1: string;
  let id2: string;
  let signedUrl: string;
  it("should upload a video file successfully", async () => {
    const videoFile = "uploads/3bf3a240-f3a2-4a0d-b6ad-2a93d5e37253.mp4";
    const response = await request(app)
      .post("/api/upload")
      .attach("video", videoFile);
    id1 = response.body.id;
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
  });
  it("should upload a video file successfully", async () => {
    const videoFile = "uploads/3bf3a240-f3a2-4a0d-b6ad-2a93d5e37253.mp4";
    const response = await request(app)
      .post("/api/upload")
      .attach("video", videoFile);
    id2 = response.body.id;
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
  });

  it("should throw an error if file size exceeds 25MB", async () => {
    const largeVideoFile = "uploads/06ff8a6e-0e79-4b0b-94ea-1e3a0a7f32e1.mp4";
    const response = await request(app)
      .post("/api/upload")
      .attach("video", largeVideoFile);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "File size exceeds the maximum limit of 25MB",
    });
  });

  it("should throw an error if video duration is less than 5 seconds", async () => {
    const shortVideoFile =
      "uploads/trimmed_e08fb1ce-4bb3-4227-819d-8b4b1cbb6ce2.mp4";
    const response = await request(app)
      .post("/api/upload")
      .attach("video", shortVideoFile);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Video duration must be between 5 and 25 seconds",
    });
  });

  it("should throw an error if video duration is greater than 25 seconds", async () => {
    const longVideoFile =
      "uploads/merged_video_8a1d6e10-3e4f-4087-93c5-3e5980cd1665.mp4";
    const response = await request(app)
      .post("/api/upload")
      .attach("video", longVideoFile);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Video duration must be between 5 and 25 seconds",
    });
  });

  it("should trim a video file successfully", async () => {
    // const videoId = 1;
    const start = 10;
    const end = 15;
    const response = await request(app)
      .post(`/api/trim`)
      .send({ id: id1, start, end });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  });

  it("should throw an error if the video file is not found", async () => {
    const nonExistentVideoId = 999;
    const start = 10;
    const end = 15;
    const response = await request(app)
      .post(`/api/trim`)
      .send({ id: nonExistentVideoId, start, end });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Video not found" });
  });

  it("should merge videos successfully", async () => {
    const videoIds = [id1, id2];
    const response = await request(app)
      .post("/api/merge")
      .send({ ids: videoIds });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  });

  it("should throw an error if one or more videos are not found", async () => {
    const videoIds = [1, 999];
    const response = await request(app)
      .post("/api/merge")
      .send({ ids: videoIds });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "One or more videos not found" });
  });

  it("should get a signed URL for the video file", async () => {
    const response = await request(app).get(`/api/videos/${id1}/signed-url`);
    signedUrl = response.body.signedUrl;
    console.log(signedUrl);
    expect(response.status).toBe(200);
  });

  it("should throw an error if the video file is not found", async () => {
    const nonExistentVideoId = 999;
    const response = await request(app)
      .get(`/api/videos/${nonExistentVideoId}/signed-url`)
      .expect(404);
    expect(response.body).toEqual({ error: "Video not found" });
  });

  it("should download the video file successfully", async () => {
    const url = new URL(signedUrl);

    const response = await request(app).get(`${url.pathname}${url.search}`);
    expect(response.status).toBe(200);
  });
});
