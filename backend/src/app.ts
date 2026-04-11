import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import uploadRoutes from "./routes/upload.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/api/health", (req, res) => { res.send("Health check working fine") });

// video routes — POST creates a new video, GET serves HLS stream files
app.use("/api/videos", uploadRoutes);
app.use("/api/videos", express.static(path.resolve(__dirname, "../output")));

export default app;



