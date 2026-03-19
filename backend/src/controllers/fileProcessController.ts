import { Request, Response, NextFunction } from "express";
import path from "path";

function buildFileResponse(file: Express.Multer.File) {
  const ext = path.extname(file.originalname).toLowerCase();
  return {
    originalName: file.originalname,
    fileName: file.filename,
    size: file.size,
    mimeType: file.mimetype,
    ext,
    path: file.path
  };
}

export async function uploadFile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });
    return res.status(200).json({ file: buildFileResponse(file) });
  } catch (e) {
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    // Clean up uploaded file
  }
}

export async function uploadFiles(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0)
    return res.status(400).json({ error: "No files uploaded" });
  return res.status(200).json({ files: files.map(buildFileResponse) });
}
