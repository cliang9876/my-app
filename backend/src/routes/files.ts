import { Router } from "express";
import { uploadFile, uploadFiles } from "../controllers/fileProcessController";
import authenticate from "../middleware/authMiddleware";
import {
  uploadFile as uploadSingle,
  uploadFiles as uploadMultiple
} from "../middleware/uploadMiddleware";

const router = Router();
router.use(authenticate);

router.post("/upload", uploadSingle, uploadFile);
router.post("/uploads", uploadMultiple, uploadFiles);

export default router;
