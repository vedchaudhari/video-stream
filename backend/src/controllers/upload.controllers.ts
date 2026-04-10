import { type Request, type Response } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { transcodeToHLS } from "../services/ffmpeg.service.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class UploadController {
    uploadVideo = async (req: Request, res: Response) => {
        try {
            const file = req.file;

            if (!file) {
                return res.status(400).json({ message: "No file uploaded" });
            }

            // input path
            const filePath = path.resolve(__dirname, "../../uploads", file.filename);

            // sanitize original filename to prevent path traversal
            const baseName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9_-]/g, "_");
            const outputDir = path.resolve(__dirname, "../../output", baseName);

            console.log("File:", filePath);
            console.log("Output:", outputDir);

            // transcode
            const result = await transcodeToHLS(filePath, outputDir);

            // return streaming URL (relative path — let the client construct the full URL)
            const videoUrl = `/api/videos/${baseName}/master.m3u8`;

            res.json({
                message: "Video uploaded & processed",
                videoUrl,
                result,
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error processing video" });
        }
    }
}

export const uploadController = new UploadController();