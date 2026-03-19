import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import InputFileUpload from "../../components/Input/InputFileUpload";
import { uploadSingleFile, uploadMultipleFiles } from "../../service/fileApi";
import ClearIcon from "@mui/icons-material/Clear";

export default function Files() {
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadMsg, setUploadMsg] = useState("");

  const handleFileChange = (files: FileList | null) => {
    if (files === null || files.length === 0) {
      setSelectedFiles([]);
      //   setFileNameList([]);
      return;
    }
    const filesArray = Array.from(files);
    setSelectedFiles((prev) => {
      const mergedFiles = [...prev, ...filesArray].filter(
        (file, index, self) =>
          index === self.findIndex((f) => f.name === file.name)
      );
      return mergedFiles;
    });
  };

  const handleUpload = async () => {
    setLoading(true);
    if (selectedFiles.length === 0) {
      setUploadMsg("No Files Uploaded");
      setLoading(false);
      return;
    }
    try {
      if (selectedFiles.length === 1) {
        await uploadSingleFile(selectedFiles[0]);
        setSelectedFiles([]);
        // setFileNameList([]);
      } else {
        await uploadMultipleFiles(selectedFiles);
        setSelectedFiles([]);
        // setFileNameList([]);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  const deleteFile = (indexToDelete: number) => {
    setSelectedFiles((prev) =>
      prev.filter((_, index) => index !== indexToDelete)
    );
  };
  return (
    <div>
      <InputFileUpload onFileChange={handleFileChange} />
      {selectedFiles.length > 0 ? (
        selectedFiles.map((file, index) => (
          <div
            key={file.name + index}
            style={{ marginRight: "10px", marginTop: "10px" }}
          >
            {file.name}
            <Button onClick={() => deleteFile(index)}>
              <ClearIcon />
            </Button>
          </div>
        ))
      ) : (
        <div style={{ marginRight: "10px", marginTop: "10px" }}>
          No File Selected
        </div>
      )}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          width: "500px",
          height: "350px",
          border: isDragging ? "solid #94BCEF 2px" : "dashed #eee 2px",
          borderRadius: "10px",
          font: "bold 30px arial",
          color: "#ddd",
          textAlign: "center",
          lineHeight: "350px"
        }}
      >
        Select File or Drag File Here
      </div>
      <Button
        variant="contained"
        onClick={handleUpload}
        disabled={loading}
        style={{ marginTop: "10px" }}
      >
        Upload
      </Button>
    </div>
  );
}
