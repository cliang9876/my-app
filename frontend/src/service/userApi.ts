// import axios from "axios";
import httpClient from "./httpClients";
import { User } from "../types";

const API_URL = "http://localhost:4000/users/listUsers";

export async function fetchUsers(): Promise<User[]> {
  const response = await httpClient.get<User[]>(API_URL);
  return response.data;
}
