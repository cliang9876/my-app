# 大文件上传实现说明（分片 + 断点续传 + 合并）

## 1. 目标

当文件较大时（例如超过 `200MB` 或你定义的阈值），不走一次性上传，而是改成：

1. 前端切片
2. 前端计算文件哈希（MD5）
3. 调用 `init` 获取已上传分片信息
4. 上传缺失分片
5. 调用 `merge` 让后端合并

这样可以支持：

- 断点续传
- 秒传（文件已存在时跳过上传）
- 降低单次请求失败成本

---

## 2. 整体流程

```text
前端选择文件
  -> createChunk(file)
  -> hash(chunks) 得到 fileHash
  -> POST /files/init
      <- { skipUpload, uploadChunks }
  -> 如果 skipUpload=true: 结束（秒传）
  -> 上传 pendingChunks 到 /files/chunk
  -> POST /files/merge
      <- 合并结果
```

---

## 3. 前端实现思路

文件：`frontend/src/service/fileApi.ts`

### 3.1 切片

```ts
const createChunk = (file: File, chunkSize = 5 * 1024 * 1024): FileChunk[] => {
  const chunks: FileChunk[] = [];
  for (
    let start = 0, index = 0;
    start < file.size;
    start += chunkSize, index++
  ) {
    const total = Math.ceil(file.size / chunkSize);
    const chunk = file.slice(start, start + chunkSize);
    chunks.push({ fileHash: "", chunk, index, total });
  }
  return chunks;
};
```

说明：

- `chunkSize` 建议先用 `5MB`
- `index` 从 `0` 开始
- `total` 是总分片数，不是已上传数

### 3.2 计算哈希（按分片顺序读）

```ts
const hash = (chunks: FileChunk[]): Promise<string> => {
  return new Promise((resolve, reject) => {
    const spark = new SparkMD5();

    const read = (i: number) => {
      if (i >= chunks.length) {
        resolve(spark.end());
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const bytes = e.target?.result;
        if (bytes instanceof ArrayBuffer || typeof bytes === "string") {
          spark.append(bytes);
          read(i + 1);
        } else {
          reject(new Error("Invalid chunk bytes"));
        }
      };
      reader.onerror = () => reject(new Error("Read chunk failed"));
      reader.onabort = () => reject(new Error("Read chunk aborted"));
      reader.readAsArrayBuffer(chunks[i].chunk);
    };

    read(0);
  });
};
```

说明：

- `item` 是 `FileChunk`，真正的二进制片段是 `item.chunk`
- 必须有 `reject` 分支，避免上传流程卡住

### 3.3 初始化上传（`/init`）

```ts
const initUpload = async (file: File, fileHash: string, chunkSize: number) => {
  const { data } = await httpClient.post(`${API_URL}/init`, {
    fileName: file.name,
    fileHash,
    fileSize: file.size,
    chunkSize
  });
  return data; // { skipUpload, uploadChunks, totalChunks }
};
```

说明：

- `skipUpload=true` 表示可秒传
- `uploadChunks` 用于断点续传（已上传片段索引）

### 3.4 上传单个分片（`/chunk`）

```ts
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

  const { data } = await httpClient.post(`${API_URL}/chunk`, formData);
  return data;
};
```

说明：

- `append(name, value, filename)` 中第 3 个参数只对 `Blob/File` 有意义
- 后端 `uploadChunk.single("chunk")` 后，这个分片会出现在 `req.file`

### 3.5 合并（`/merge`）

```ts
const mergeUpload = async (
  fileHash: string,
  fileName: string,
  total: number
) => {
  const { data } = await httpClient.post(`${API_URL}/merge`, {
    fileHash,
    fileName,
    total
  });
  return data;
};
```

### 3.6 大文件主流程

```ts
const handleBigFile = async (file: File) => {
  const chunks = createChunk(file, CHUNK_SIZE);
  const fileHash = await hash(chunks);

  const initData = await initUpload(file, fileHash, CHUNK_SIZE);
  if (initData.skipUpload) return { skipped: true, fileHash };

  const uploadedSet = new Set(initData.uploadChunks ?? []);
  const pendingChunks = chunks.filter((c) => !uploadedSet.has(c.index));

  for (const c of pendingChunks) {
    await uploadOneChunk(fileHash, c.index, c.total, c.chunk);
  }

  const mergeData = await mergeUpload(fileHash, file.name, chunks.length);
  return { skipped: false, fileHash, mergeData };
};
```

---

## 4. 后端实现思路

文件：`backend/src/controllers/fileProcessController.ts`

### 4.1 `initUpload`

职责：

- 校验 `fileHash/fileName/fileSize/chunkSize`
- 检查最终文件是否存在（秒传）
- 读取 `files/chunks/<fileHash>` 中已上传分片索引（断点续传）

关键点：

- `uploadChunks` 是已上传索引数组
- 匹配 `chunk-<index>` 文件名并排序

### 4.2 `storeChunks`

职责：

- 接收分片：`fileHash/index/total` + `req.file`
- 校验索引范围
- 保存到 `files/chunks/<fileHash>/chunk-<index>`
- 幂等：若分片已存在直接返回成功

### 4.3 `mergeChunks`（流式合并）

职责：

- 检查分片目录是否存在（不存在返回 `No chunks found`）
- 校验分片完整性：数量等于 `total`，且连续为 `chunk-0...chunk-(n-1)`
- 按顺序流式写入临时文件 `.part`
- `rename(.part -> 正式文件)`
- 删除分片目录

代码样例（核心逻辑）：

```ts
const writer = fsSync.createWriteStream(tempMergedPath, { flags: "w" });

for (const name of chunkNames) {
  const chunkPath = path.join(chunkDir, name);
  await new Promise<void>((resolve, reject) => {
    const reader = fsSync.createReadStream(chunkPath);
    reader.on("error", reject);
    writer.on("error", reject);
    reader.on("end", resolve);
    reader.pipe(writer, { end: false });
  });
}

writer.end();
await finished(writer);
await fs.rename(tempMergedPath, mergedPath);
```

说明：

- 使用流而不是 `Buffer.concat`，避免大文件内存峰值过高
- 用 `.part` 临时文件避免合并中断留下“半成品正式文件”

---

## 5. 路由与中间件

### 5.1 路由

文件：`backend/src/routes/files.ts`

```ts
router.post("/init", initUpload);
router.post("/chunk", uploadChunkFile, storeChunks);
router.post("/merge", mergeChunks);
```

### 5.2 上传中间件

文件：`backend/src/middleware/uploadMiddleware.ts`

```ts
const uploadChunk = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

export const uploadChunkFile = uploadChunk.single("chunk");
```

说明：

- `memoryStorage` 适合分片（小块、快速落盘）
- 后端要立即 `writeFile`，不要把分片长期留在内存

---

## 6. 常见坑

1. `totalChunks` 不是已上传分片数，而是总分片数
2. `chunkIndex` 可以是 `0`，但 `totalChunks` 必须 `> 0`
3. `FormData.append` 第 3 个参数只用于 `Blob/File`
4. `item` 是 `FileChunk`，读文件时要用 `item.chunk`
5. `init` 用 JSON（`req.body`），`chunk` 用 multipart（`req.file`）
6. 前后端阈值要统一（例如都用 `200MB` 或都用 `2000MB`）

---

## 7. 建议的联调顺序

1. 先用小文件走普通上传（确保原有功能不回归）
2. 再用大文件走 `init -> chunk -> merge`
3. 中途断网后重传，验证 `uploadChunks` 是否跳过已上传分片
4. 校验最终合并文件大小、可打开性

---

## 8. 后续优化（可选）

1. 分片并发上传（并发数 3~5）
2. 前端上传进度展示（总进度 + 当前分片）
3. 分片重试策略（指数退避）
4. 合并结果入库（文件元数据）
