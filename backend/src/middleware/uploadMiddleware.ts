import multer from "multer";
import path from "path";
import fs from "fs";

const MAX_FILE_SIZE = 1024 * 1024 * 200; // 100MB
const ALLOWED_FILES = 10;
const ALLOWED_EXT = new Set([".xlsx", ".xls", ".csv"]);
const ALLOWED_MIME_TYPES = new Set([
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
  "application/csv",
  "video/mp4"
]);

const uploadDir = path.join(process.cwd(), "files", "uploads");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const isAllowedExt = ALLOWED_EXT.has(ext);
    const isAllowedMime = ALLOWED_MIME_TYPES.has(file.mimetype);
    if (isAllowedExt && isAllowedMime) {
      return cb(null, true);
    }
    cb(new Error("File type not allowed"));
  }
});

export const uploadFile = upload.single("file");
export const uploadFiles = upload.array("files", ALLOWED_FILES);

export default upload;
