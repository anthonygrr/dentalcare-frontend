import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";

export function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}

export function setupAuthInterceptor(api: AxiosInstance) {
  api.interceptors.request.use(authRequestInterceptor);

  api.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error?.response?.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    },
  );
}
