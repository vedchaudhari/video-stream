import express from "express";
import uploadRoutes from "./routes/upload.routes.js";

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.use("/api/health", (req, res) => { res.send("Health check working fine") });

app.use("/api/upload", uploadRoutes)

//serve hls files
app.use("/api/videos", express.static("videos"));

export default app;



