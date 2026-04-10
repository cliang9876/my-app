import { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs/promises";
import fsSync from "fs";
import { finished } from "stream/promises";

const CHUNK_DIR = path.join(process.cwd(), "files", "chunks");
const MERGED_DIR = path.join(process.cwd(), "files", "uploads");
const ALLOWED_EXT = new Set([".xlsx", ".xls", ".csv", ".mp4"]);

type initBody = {
  fileName: string;
  fileHash: string;
  fileSize: number;
  chunkSize: number;
};

type chunkBody = {
  fileHash: string;
  index: string | number;
  total: string | number;
};

type mergeBody = {
  fileHash: string;
  fileName: string;
  total: string | number;
};

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

export async function initUpload(req: Request, res: Response) {
  try {
    const { fileName, fileHash, fileSize, chunkSize } = req.body as initBody;
    if (!fileName || !fileSize || !fileHash || !chunkSize) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (!/^[a-f0-9]{32}$/i.test(fileHash)) {
      return res.status(400).json({ error: "Invalid fileHash" });
    }

    const ext = path.extname(fileName).toLowerCase();
    const base = path.basename(fileName, ext);
    const safeBase = base.replace(/[^\w.-]+/g, "_");
    if (!ALLOWED_EXT.has(ext)) {
      return res.status(400).json({ error: "File type not allowed" });
    }

    const totalChunks = Math.ceil(Number(fileSize) / Number(chunkSize));
    const mergedFileName = `${safeBase}-${fileHash}${ext}`;
    const mergedPath = path.join(MERGED_DIR, mergedFileName);

    //秒传，检查文件是否存在
    if (fsSync.existsSync(mergedPath)) {
      return res.status(200).json({
        skipUpload: true,
        fileHash,
        totalChunks,
        uploadChunks: Array.from({ length: totalChunks }, (_, i) => i)
      });
    }

    //断点续传,检查已上传分片
    const fileChunkDir = path.join(CHUNK_DIR, fileHash);
    await fs.mkdir(fileChunkDir, { recursive: true });
    const names = await fs.readdir(fileChunkDir);

    const uploadChunks = names
      .map((name) => {
        const m = name.match(/^chunk-(\d+)$/);
        return m ? Number(m[1]) : null;
      })
      .filter((n): n is number => n !== null)
      .sort((a, b) => a - b);

    return res.status(200).json({
      skipUpload: false,
      fileHash,
      totalChunks,
      uploadChunks
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function storeChunks(req: Request, res: Response) {
  try {
    const { fileHash, index, total } = req.body as chunkBody;
    const file = req.file as Express.Multer.File | undefined;

    if (!file || !fileHash || index == null || total == null) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!/^[a-f0-9]{32}$/i.test(fileHash)) {
      return res.status(400).json({ error: "Invalid fileHash" });
    }

    const chunkIndex = Number(index);
    const totalChunks = Number(total);

    if (
      !Number.isInteger(chunkIndex) ||
      !Number.isInteger(totalChunks) ||
      chunkIndex < 0 ||
      totalChunks <= 0 ||
      chunkIndex >= totalChunks
    ) {
      return res.status(400).json({ error: "Invalid chunk index/total" });
    }

    const chunkDir = path.join(CHUNK_DIR, fileHash);
    await fs.mkdir(chunkDir, { recursive: true });

    const chunkPath = path.join(chunkDir, `chunk-${chunkIndex}`);

    if (fsSync.existsSync(chunkPath)) {
      return res.status(200).json({
        ok: true,
        alreadyUploaded: true,
        fileHash,
        index: chunkIndex,
        total: totalChunks
      });
    }

    await fs.writeFile(chunkPath, file.buffer);

    return res.status(200).json({
      ok: true,
      alreadyUploaded: false,
      fileHash,
      index: chunkIndex,
      total: totalChunks
    });
  } catch (e) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function mergeChunks(req: Request, res: Response) {
  try {
    const { fileHash, fileName, total } = req.body as mergeBody;

    if (!fileHash || !fileName || !total) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!/^[a-f0-9]{32}$/i.test(fileHash)) {
      return res.status(400).json({ error: "invalid file hash" });
    }

    const totalChunks = Number(total);
    if (!Number.isInteger(totalChunks) || totalChunks <= 0) {
      return res.status(400).json({ error: "Invalid total" });
    }

    const ext = path.extname(fileName).toLowerCase();
    const base = path.basename(fileName, ext);
    const safeBase = base.replace(/[^\w.-]+/g, "_");
    if (!ALLOWED_EXT.has(ext)) {
      return res.status(400).json({ error: "File type not allowed" });
    }

    const chunkDir = path.join(CHUNK_DIR, fileHash);
    let names: string[];
    try {
      names = await fs.readdir(chunkDir);
    } catch (e) {
      const err = e as NodeJS.ErrnoException;
      if (err.code === "ENOENT") {
        return res.status(400).json({ error: "No chunks found" });
      }
      throw e;
    }
    const chunkNames = names
      .filter((n) => /^chunk-\d+$/.test(n))
      .sort((a, b) => {
        const ai = Number(a.replace("chunk-", ""));
        const bi = Number(b.replace("chunk-", ""));
        return ai - bi;
      });

    if (chunkNames.length !== totalChunks) {
      return res.status(400).json({ error: "Chunks are not complete" });
    }

    for (let i = 0; i < totalChunks; i++) {
      if (chunkNames[i] !== `chunk-${i}`) {
        return res.status(400).json({ error: "Chunk index missing" });
      }
    }

    await fs.mkdir(MERGED_DIR, { recursive: true });
    const mergedFileName = `${safeBase}-${fileHash}${ext}`;
    const mergedPath = path.join(MERGED_DIR, mergedFileName);
    const tempMergedPath = `${mergedPath}.part`;

    if (fsSync.existsSync(mergedPath)) {
      const stat = await fs.stat(mergedPath);
      return res.status(200).json({
        ok: true,
        alreadyMerged: true,
        fileHash,
        fileName: mergedFileName,
        size: stat.size,
        path: mergedPath
      });
    }
    // 如果有就清空旧的临时文件
    await fs.rm(tempMergedPath, { force: true });
    let writer: fsSync.WriteStream | null = null;

    try {
      // 重新写入，写入模式
      writer = fsSync.createWriteStream(tempMergedPath, { flags: "w" });
      for (const name of chunkNames) {
        const chunkPath = path.join(chunkDir, name);
        await new Promise<void>((resolve, reject) => {
          const reader = fsSync.createReadStream(chunkPath);
          reader.on("error", reject);
          writer!.on("error", reject);
          reader.on("end", resolve);
          reader.pipe(writer!, { end: false });
        });
      }

      writer.end();
      await finished(writer);
      await fs.rename(tempMergedPath, mergedPath);
    } catch (e) {
      if (writer && !writer.destroyed) {
        writer.destroy();
      }
      await fs.rm(tempMergedPath, { force: true });
      throw e;
    }

    await fs.rm(chunkDir, { recursive: true, force: true });

    const stat = await fs.stat(mergedPath);
    return res.status(200).json({
      ok: true,
      alreadyMerged: false,
      fileHash,
      fileName: mergedFileName,
      size: stat.size,
      path: mergedPath
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Internal server error" });
  }
}
