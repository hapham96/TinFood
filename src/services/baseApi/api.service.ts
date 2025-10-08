import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { authService } from "../auth.service";
let baseUrl = "https://www.cidikay.info.vn/";
class ApiService {
    private axiosInstance: AxiosInstance;

    constructor(baseURL: string) {
        this.axiosInstance = axios.create({
            baseURL,
            timeout: 20000, // default 20s
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

    private createAxios(baseURL: string): AxiosInstance {
        return axios.create({
            baseURL,
            timeout: 10000,
        });
    }

    setBaseUrl(newBaseUrl: string) {
        baseUrl = newBaseUrl;
        this.axiosInstance = this.createAxios(baseUrl);
    }


    async get<T>(url: string, checkToken = true, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return this.request<T>({ ...config, url, method: "GET", data }, checkToken);
    }

    async post<T>(url: string, data?: any, checkToken = true, config?: AxiosRequestConfig): Promise<T> {
        return this.request<T>({ ...config, url, method: "POST", data }, checkToken);
    }

    async put<T>(url: string, data?: any, checkToken = true, config?: AxiosRequestConfig): Promise<T> {
        return this.request<T>({ ...config, url, method: "PUT", data }, checkToken);
    }

    async delete<T>(url: string, checkToken = true, config?: AxiosRequestConfig): Promise<T> {
        return this.request<T>({ ...config, url, method: "DELETE" }, checkToken);
    }

    private async request<T>(config: AxiosRequestConfig, checkToken: boolean): Promise<T> {
        if (checkToken) {
            const token = await authService.getToken();
            if (!token) throw new Error("Unauthorized: Missing token");
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`,
            };
        }
        const response: AxiosResponse<T> = await this.axiosInstance.request<T>(config);
        return response.data;
    }
}

export const apiService = new ApiService(baseUrl);
