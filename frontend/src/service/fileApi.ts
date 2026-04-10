import httpClient from "./httpClients";
import SparkMD5 from "spark-md5";

const API_URL = "/files";

type FileChunk = {
  fileHash: string;
  chunk: Blob;
  index: number;
  total: number;
};

type InitUploadRes = {
  skipUpload: boolean;
  fileHash: string;
  totalChunks: number;
  uploadChunks: number[];
};

type ChunkUploadRes = {
  ok: boolean;
  alreadyUploaded: boolean;
  fileHash: string;
  index: number;
  total: number;
};

type MergeRes = {
  ok: boolean;
  alreadyMerged: boolean;
  fileHash: string;
  fileName: string;
  size: number;
  path: string;
};

const MAX_SIZE = 2000 * 1024 * 1024;
const CHUNK_SIZE = 5 * 1024 * 1024;

export const uploadSingleFile = async (file: File) => {
  if (file.size > 200 * 1024 * 1024) {
    return await handleBigFile(file);
  }
  const formData = new FormData();
  formData.append("file", file);
  const res = await httpClient.post(`${API_URL}/upload`, formData);
  return res.data;
};

export const uploadMultipleFiles = async (files: File[]) => {
  const smallFiles: File[] = [];
  const bigFiles: File[] = [];

  files.forEach((file) => {
    if (file.size > 200 * 1024 * 1024) {
      bigFiles.push(file);
    } else {
      smallFiles.push(file);
    }
  });
  const result: { small?: unknown; big: unknown[] } = { big: [] };

  if (smallFiles.length > 0) {
    const formData = new FormData();
    smallFiles.forEach((f) => {
      formData.append("files", f);
    });
    const res = await httpClient.post(`${API_URL}/uploads`, formData);
    result.small = res.data;
  }

  for (const f of bigFiles) {
    result.big.push(await handleBigFile(f));
  }
  return result;
};

const initUpload = async (file: File, fileHash: string, chunkSize: number) => {
  const { data } = await httpClient.post<InitUploadRes>(`${API_URL}/init`, {
    fileName: file.name,
    fileHash,
    fileSize: file.size,
    chunkSize
  });
  return data;
};

const uploadOneChunk = async (
  fileHash: string,
  index: number,
  total: number,
  chunk: Blob
) => {
  const formData = new FormData();
  formData.append("fileHash", fileHash);
  formData.append("index", String(index));
  formData.append("total", String(total));
  formData.append("chunk", chunk, `chunk-${index}`);

  const { data } = await httpClient.post<ChunkUploadRes>(
    `${API_URL}/chunk`,
    formData
  );
  return data;
};

const mergeUpload = async (
  fileHash: string,
  fileName: string,
  total: number
) => {
  const { data } = await httpClient.post<MergeRes>(`${API_URL}/merge`, {
    fileHash,
    fileName,
    total
  });
  return data;
};

const handleBigFile = async (file: File) => {
  const chunks = createChunk(file);
  const fileHash = await hash(chunks);

  const initData = await initUpload(file, fileHash, CHUNK_SIZE);

  if (initData.skipUpload) {
    return { skipped: true, fileHash };
  }
  const uploadedSet = new Set(initData.uploadChunks ?? []);
  const pendingChunks = chunks
    .map((c) => ({ ...c, fileHash }))
    .filter((c) => !uploadedSet.has(c.index));

  ///chunks
  for (const c of pendingChunks) {
    await uploadOneChunk(fileHash, c.index, c.total, c.chunk);
  }
  //merges
  const mergeData = await mergeUpload(fileHash, file.name, chunks.length);
  console.log(fileHash);
  return { skipped: false, fileHash, mergeData };
};

const hash = (chunks: FileChunk[]): Promise<string> => {
  return new Promise((resolve) => {
    const spark = new SparkMD5();
    function _read(i: number) {
      if (i >= chunks.length) {
        resolve(spark.end());
        return;
      }

      const item = chunks[i];
      const reader = new FileReader();
      reader.onload = (e) => {
        const bytes = e.target?.result;
        if (bytes instanceof ArrayBuffer || typeof bytes === "string") {
          spark.append(bytes);
        }

        _read(i + 1);
      };
      reader.readAsArrayBuffer(item.chunk);
    }
    _read(0);
  });
};

const createChunk = (
  file: File,
  chunkSize: number = 5 * 1024 * 1024
): FileChunk[] => {
  const chunks: FileChunk[] = [];
  for (
    let start = 0, index = 0;
    start < file.size;
    start += chunkSize, index++
  ) {
    const total = Math.ceil(file.size / chunkSize);
    const end = start + chunkSize;
    const chunkValue = file.slice(start, end);
    const chunkIndex = index;
    const fileHash = "";

    const chunk = { fileHash, chunk: chunkValue, index: chunkIndex, total };
    chunks.push(chunk);
  }
  console.log(chunks);
  return chunks;
};
