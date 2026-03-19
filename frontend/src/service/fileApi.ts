import httpClient from "./httpClients";

const API_URL = "/files";

export const uploadSingleFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await httpClient.post(`${API_URL}/upload`, formData);
  return res.data;
};
export const uploadMultipleFiles = async (files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  const res = await httpClient.post(`${API_URL}/uploads`, formData);
  return res.data;
};
