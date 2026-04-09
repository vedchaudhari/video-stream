import { type Request, type Response } from "express";
import multer from "multer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getVideoResolution } from "../services/ffmpeg.service.js";

class UploadController {
    uploadVideo = (req: Request, res: Response) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "No video file uploaded",
                });
            }

            res.status(200).json({
                success: true,
                message: "Video uploaded successfully",
                file: req.file
            })
        } catch (error: unknown) {
            if (error instanceof Error) {
                return res.status(500).json({
                    message: error.message
                })
            }
            return res.status(500).json({
                message: "Something went wrong"
            })
        }
    }

    getVideo = async (req: Request, res: Response) => {
        try {

            console.log("Inside getVideo")
            const filename = "bike.mp4";
            if (!filename) {
                return res.status(400).json({ success: false, message: "Filename is required" });
            }

            const __dirname = path.dirname(fileURLToPath(import.meta.url));
            const uploadPath = path.resolve(__dirname, "../../uploads");
            const filePath = path.join(uploadPath, filename as string);

            console.log("Filepath", filePath);

            const {width, height} = await getVideoResolution(filePath);
            console.log("Width, height", width, height);
            

            // Prevent path traversal
            if (!filePath.startsWith(uploadPath)) {
                return res.status(400).json({ success: false, message: "Invalid filename" });
            }

            res.sendFile(filePath);
        } catch (error) {
            console.log("Error", error)
            return res.status(500).json({ success: false, message: "Something went wrong" });
        }
    }; 



}

export const uploadController = new UploadController();