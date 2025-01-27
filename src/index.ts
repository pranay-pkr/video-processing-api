import express from "express";
import "dotenv/config";
import multer from "multer";
import VideoController from "./controller/VideoController";
import Video from "./models/Video";
import path from "path";
import authMiddleware from "./middleware/auth";

const app = express();
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use((req, res, next) => {
  authMiddleware(req, res, next);
});
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname); // Get the file extension
    const uniqueName = `${crypto.randomUUID()}${extension}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [".mp4", ".avi"];
    const fileExtension = path.extname(file.originalname);
    if (!allowedExtensions.includes(fileExtension)) {
      return cb(
        new Error(
          `Please upload a video file of format ${allowedExtensions.join(
            " or "
          )}`
        )
      );
    }
    cb(null, true);
  },
});

app.post("/api/videos/upload", upload.single("video"), (req, res) => {
  VideoController.uploadVideo(req, res);
});

app.post("/api/videos/merge", (req, res) => {
  VideoController.mergeVideos(req, res);
});

app.post("/api/videos/trim", (req, res) => {
  VideoController.trimVideo(req, res);
});

app.get("/api/videos/:id/signed-url", (req, res) => {
  VideoController.getSignedUrl(req, res);
});

app.get("/api/videos/:id", (req, res) => {
  VideoController.getVideo(req, res);
});

export const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
  Video.sync();
});

export default app;
