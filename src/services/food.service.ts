import { apiService } from "./baseApi/api.service";

interface Restaurant {
    id: number;
    name: string;
    address: string;
    image_url?: string;
    rating: string;
    latitude: string;
    longitude: string;
    distance: string;
}
export type RestaurantResponse = {
    items: Restaurant[];
    pageNumber: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
};
interface GetRestaurantParams {
    Lat?: number;
    Lng?: number;
    tagIds?: string[];
    pageSize?: number;
}

class FoodService {
    async getRestaurants(params?: GetRestaurantParams): Promise<RestaurantResponse[]> {
        const query = new URLSearchParams();

        if (params?.Lat) query.append("Lat", params.Lat.toString());
        if (params?.Lng) query.append("Lng", params.Lng.toString());
        if (params?.pageSize) query.append("pageSize", params.pageSize.toString());

        if (params?.tagIds) {
            params.tagIds.forEach((id) => query.append("tagIds", id));
        }

        const url = query.toString() ? `/restaurant?${query}` : "/restaurant";

        return apiService.get<RestaurantResponse[]>(url, false);
    }

    async getTags(): Promise<string[]> {
        return apiService.get<string[]>("/food/tag-list", false);
    }
}

export const foodService = new FoodService();
