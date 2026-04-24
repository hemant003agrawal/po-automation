import apiClient from "./client";

export type LoginPayload = {
  email: string;
  password: string;
};

export async function login(payload: LoginPayload) {
  const { data } = await apiClient.post<{ token: string }>("/auth/login", payload);
  return data;
}
