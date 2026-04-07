import { type Request, type Response } from "express";
import multer from "multer";

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
            if(error instanceof Error){
                return res.status(500).json({
                    message: error.message
                })
            }
            return res.status(500).json({
                message: "Something went wrong"
            })
        }
    }
}

export const uploadController = new UploadController();