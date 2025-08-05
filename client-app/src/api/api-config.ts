// src/api/api.ts
import axios, { AxiosRequestConfig } from "axios";
import { getAccessToken } from "../utils/cognitoService"; // your token getter


let baseURL = ""; // will be set at runtime

export function configureApiClient(url: string) {
  baseURL = url;
}

const apiClient = axios.create({});

// Add Authorization token to every request
apiClient.interceptors.request.use((config) => {
  config.baseURL = baseURL;
  const token = getAccessToken();
  if (token) {
    if (config.headers && typeof (config.headers as any).set === "function") {
      (config.headers as any).set("Authorization", `Bearer ${token}`);
    } else {
      config.headers = Object.assign(config.headers || {}, {
        Authorization: `Bearer ${token}`,
      });
    }
  }
  return config;
});

export const api = {
  get: async (path: string, config?: AxiosRequestConfig) => {
    const response = await apiClient.get(path, config);
    return response.data;
  },
  post: async (path: string, body?: any, config?: AxiosRequestConfig) => {
    const response = await apiClient.post(path, body, config);
    return response.data;
  },
  put: async (path: string, body?: any, config?: AxiosRequestConfig) => {
    const response = await apiClient.put(path, body, config);
    return response.data;
  },
  delete: async (path: string, config?: AxiosRequestConfig) => {
    const response = await apiClient.delete(path, config);
    return response.data;
  },
};
