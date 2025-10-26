import axios from "axios";
import httpClient from "./httpClients";

const API_URL = "http://localhost:4000/auth/login";

export interface LoginResponse {
  token: string;
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await httpClient.post<LoginResponse>(API_URL, {
    email,
    password
  });
  return response.data;
}
