import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { authService } from "../auth.service";

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 10000, // default 10s
    });

    // Add interceptor
    this.axiosInstance.interceptors.request.use(async (config: any) => {
      // default check token
      const token = await authService.getToken();
      if (!token) {
        throw new Error("Unauthorized: Missing token");
      }
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
      return config;
    });

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.code === "ECONNABORTED") {
          return Promise.reject(new Error("Request timeout"));
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig, checkToken = true): Promise<T> {
    return this.request<T>({ ...config, url, method: "GET" }, checkToken);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig, checkToken = true): Promise<T> {
    return this.request<T>({ ...config, url, method: "POST", data }, checkToken);
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig, checkToken = true): Promise<T> {
    return this.request<T>({ ...config, url, method: "PUT", data }, checkToken);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig, checkToken = true): Promise<T> {
    return this.request<T>({ ...config, url, method: "DELETE" }, checkToken);
  }

  private async request<T>(config: AxiosRequestConfig, checkToken: boolean): Promise<T> {
    if (!checkToken) {
      config.headers = {
        ...config.headers,
        Authorization: undefined,
      };
    }
    const response: AxiosResponse<T> = await this.axiosInstance.request<T>(config);
    return response.data;
  }
}

export const apiService = new ApiService("https://api.example.com");
