import express from "express";
import "dotenv/config";
import multer from "multer";
import VideoService from "./service/videoService";
import VideoController from "./controller/videoController";
import Video from "./models/video";

const app = express();
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello World!");
});
const upload = multer({ dest: "./uploads/" });

app.post("/upload", upload.single("video"), (req, res) => {
  VideoController.uploadVideo(req, res);
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
  Video.sync();
});
