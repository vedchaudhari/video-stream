import {Router} from "express";
import { uploadController } from "../controllers/upload.controllers.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

router.post("/",upload.single("video-file"), uploadController.uploadVideo);
router.get("/video", uploadController.getVideo);

export default router;