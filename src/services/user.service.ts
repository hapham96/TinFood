import { apiService } from "./baseApi/api.service";

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
}
class UserService {

  async login(params: { userName: string; password: string }): Promise<LoginResponse> {
    return apiService.post<LoginResponse>("/user/login", params, false);
  }

 async register(params: { name: string, userName: string; password: string; email: string }): Promise<LoginResponse> {
    return apiService.post<LoginResponse>("/user/register", params, false);
  }

}

export const userService = new UserService();
