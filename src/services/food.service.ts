import { apiService } from "./baseApi/api.service";

export type Restaurant = {
    id: number;
    name: string;
    address: string;
    image_url?: string;
};

class FoodService {
    async getRestaurants(): Promise<Restaurant[]> {
        return apiService.get<Restaurant[]>("/restaurants");
    }
}

export const foodService = new FoodService();
