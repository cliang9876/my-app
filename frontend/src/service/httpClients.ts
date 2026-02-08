import axios from "axios";
import { getAccessToken, setAccessToken } from "./tokenStore";

const httpClient = axios.create({
  // baseURL: "http://localhost:4000",
  baseURL: "",
  withCredentials: true
});

httpClient.interceptors.request.use((config) => {
  // if localstorage => const token = localStorage.getItem("authToken");
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const status = error.response?.status;
    const original = error.config;
    const isRefresh = original?.url?.includes("/auth/refresh");
    if ((status === 401 || status === 403) && !original._retry && !isRefresh) {
      // Handle unauthorized access, e.g., redirect to login
      //if localstorage => localStorage.removeItem("authToken");
      original._retry = true;
      try {
        const { data } = await httpClient.post("/auth/refresh");
        setAccessToken(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return httpClient(original);
      } catch (e) {
        setAccessToken(null);
        // window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default httpClient;
