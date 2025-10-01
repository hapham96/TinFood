// src/services/auth.service.ts
import { BehaviorSubject } from 'rxjs';
import { StorageService } from './storage.service';

const TOKEN_KEY = 'auth_token';

export class AuthService {
  #storage: StorageService;
  #_token: string | null = null;
  authState = new BehaviorSubject<boolean>(false);

  constructor(storage: StorageService) {
    this.#storage = storage;
    this.init();
  }

  private async init() {
    const savedToken = await this.#storage.get(TOKEN_KEY);
    if (savedToken) {
      this.#_token = savedToken;
      this.authState.next(true);
    } else {
      this.authState.next(false);
    }
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      // TODO: call real API !!
      if (email && password) {
        const fakeToken = `token_${Date.now()}`;
        this.#_token = fakeToken;
        console.log('Fake login successful - token: ', fakeToken);
        await this.#storage.set(TOKEN_KEY, fakeToken);
        this.authState.next(true);

        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error', err);
      return false;
    }
  }

  async logout(): Promise<void> {
    this.#_token = null;
    await this.#storage.remove(TOKEN_KEY);
    this.authState.next(false);
  }

  async getToken(): Promise<string | null> {
    if (!this.#_token) {
      this.#_token = await this.#storage.get(TOKEN_KEY);
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