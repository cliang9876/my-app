import httpClient from "./httpClients";

const API_URL = "/auth/login";

export interface LoginResponse {
  status: number;
  message: string;
  accessToken: string;
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
