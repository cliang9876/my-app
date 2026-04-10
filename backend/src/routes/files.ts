import { Router } from "express";
import {
  uploadFile,
  uploadFiles,
  initUpload,
  storeChunks,
  mergeChunks
} from "../controllers/fileProcessController";
import authenticate from "../middleware/authMiddleware";
import {
  uploadFile as uploadSingle,
  uploadFiles as uploadMultiple,
  uploadChunkFile
} from "../middleware/uploadMiddleware";

const router = Router();
router.use(authenticate);

router.post("/upload", uploadSingle, uploadFile);
router.post("/uploads", uploadMultiple, uploadFiles);
router.post("/init", initUpload);
router.post("/chunk", uploadChunkFile, storeChunks);
router.post("/merge", mergeChunks);

export default router;
