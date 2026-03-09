import { Router } from "express";
import { uploadFile, uploadFiles } from "../controllers/fileProcessController";
import authenticate from "../middleware/authMiddleware";

const router = Router();
router.use(authenticate);

router.post("/upload", uploadFile);
router.post("/uploads", uploadFiles);

export default router;
