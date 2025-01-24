import express from "express";
import "dotenv/config";
import multer from "multer";
import VideoService from "./service/videoService";
import VideoController from "./controller/videoController";
import Video from "./models/video";
import path from "path";

const app = express();
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello World!");
});
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../", "uploads")); // Specify the destination folder
  },
  filename: function (req, file, cb) {
    const fileExtension = file.originalname.split(".").pop(); // Get the file extension
    const uniqueFilename = `${crypto.randomUUID()}.${fileExtension}`;
    cb(null, uniqueFilename);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(mp4|avi)$/)) {
      return cb(new Error(`Please upload a video file of format mp4 or avi`));
    }
    console.log("file", file.mimetype);
    cb(null, true);
  },
});
app.post("/api/upload", upload.single("video"), (req, res) => {
  VideoController.uploadVideo(req, res);
});

app.post("/api/merge", (req, res) => {
  VideoController.mergeVideos(req, res);
});

app.post("/api/trim", (req, res) => {
  VideoController.trimVideo(req, res);
});

app.get("/api/videos/:id/signed-url", (req, res) => {
  VideoController.getSignedUrl(req, res);
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
  Video.sync();
});
