import { promises } from "fs";
import { Request, Response, NextFunction } from "express";
import path from "path";

export async function uploadFile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });
    if (file.size > 100 * 1024 * 1024) {
      return res.status(400).json({ error: "File size exceeds 100MB limit" });
    }
    if (
      ![".xlsx", ".xls", ".csv"].includes(
        path.extname(file.originalname).toLowerCase()
      )
    ) {
      return res.status(400).json({ error: "File type not allowed" });
    }
    const data = await promises.readFile(file.path);
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
}
