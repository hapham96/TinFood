// src/services/auth.service.ts
import { BehaviorSubject } from "rxjs";
import { StorageService } from "./storage.service";
import { STORAGE_KEYS } from "../utils/constants";
import { userService } from "./user.service";
export class AuthService {
  #storage: StorageService;
  #_token: string | null = null;
  authState = new BehaviorSubject<boolean>(false);

  constructor(storage: StorageService) {
    this.#storage = storage;
    this.init();
  }

  private async init() {
    const savedToken = await this.#storage.get(STORAGE_KEYS.TOKEN_KEY);
    if (savedToken) {
      this.#_token = savedToken;
      this.authState.next(true);
    } else {
      this.authState.next(false);
    }
  }

  async login(userName: string, password: string): Promise<boolean> {
    try {
      if (userName && password) {
        const tokenResponse = await userService.login({ userName, password });
        console.log("Login res - token: ", tokenResponse);
        if (tokenResponse.accessToken) {
          this.#_token = tokenResponse.accessToken;
          await this.#storage.set(
            STORAGE_KEYS.TOKEN_KEY,
            tokenResponse.accessToken
          );
          this.authState.next(true);
          return true;
        } else {
          await this.#storage.set(STORAGE_KEYS.TOKEN_KEY, "");
          this.authState.next(false);
        }
      }

      return false;
    } catch (err) {
      console.error("Login error", err);
      return false;
    }
  }

  async logout(): Promise<void> {
    this.#_token = null;
    await this.#storage.remove(STORAGE_KEYS.TOKEN_KEY);
    this.authState.next(false);
  }

  async getToken(): Promise<string | null> {
    if (!this.#_token) {
      this.#_token = await this.#storage.get(STORAGE_KEYS.TOKEN_KEY);
    }
    return this.#_token;
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }
}

const storageService = new StorageService();
export const authService = new AuthService(storageService);
