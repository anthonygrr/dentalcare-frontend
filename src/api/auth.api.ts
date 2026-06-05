import axios from "axios";
import { setupAuthInterceptor } from "./interceptors";
import type { LoginRequest, LoginResponse, UserInfo, UpdatePasswordRequest } from "@/types/auth.types";

const BASE_URL = import.meta.env.VITE_API_URL;

export const authApi = axios.create({
  baseURL: `${BASE_URL}/api/auth`,
});

setupAuthInterceptor(authApi);

export const userApi = axios.create({
  baseURL: `${BASE_URL}/api/users`,
});

setupAuthInterceptor(userApi);

export async function loginUser(login: string, password: string): Promise<LoginResponse> {
  const payload: LoginRequest = { login, password };
  const { data } = await authApi.post<LoginResponse>("/login", payload);
  return data;
}

export async function getMe(): Promise<UserInfo> {
  const { data } = await userApi.get<UserInfo>("/me");
  return data;
}

export async function updatePassword(currentPassword: string, newPassword: string): Promise<void> {
  const payload: UpdatePasswordRequest = { currentPassword, newPassword };
  await userApi.put("/me", payload);
}
