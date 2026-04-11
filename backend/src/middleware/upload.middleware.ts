import multer from "multer";
import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import { type Request } from "express";
import { type FileFilterCallback } from "multer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const uploadPath = path.resolve(__dirname, "../../uploads")

if(!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, {recursive: true});
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => cb(null, crypto.randomUUID() + path.extname(file.originalname))
})

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedExtensions = [".mp4"];
    const extname = path.extname(file.originalname).toLowerCase();
    if(allowedExtensions.includes(extname)){
       cb(null,true) 
    }else{
        cb(new Error("Only video files allowed"))
    }
};

export const upload = multer({
    storage,
    fileFilter, 
    limits: { fileSize: 500 * 1024 * 1024 },
});