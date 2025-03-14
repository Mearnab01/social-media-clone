import express from "express";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import conncetDb from "./connectDb/connectDb.js";
import { v2 as cloudinary } from "cloudinary";

//adding socket at very last
import { app, server } from "./socketio/socket.js";
// routes importing
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import messageRoutes from "./routes/message.routes.js";
import job from "./cron/cron.js";

dotenv.config();
job.start();
//const app = express(); // listen to socket app at very last
const port = process.env.PORT || 3000;
const __dirname = path.resolve();
app.use(cookieParser());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/messages", messageRoutes);
//app.listen(port, () => {    //change app -> server at very last

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/client/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
  });
}
server.listen(port, () => {
  conncetDb()
    .then(() => {
      console.log(`Server is running on port ${port}`);
    })
    .catch((error) => {
      console.log("Failed to connect to database", error);
    });
});
