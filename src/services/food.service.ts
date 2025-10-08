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
    lat?: number;
    lng?: number;
    tagIds?: string[];
    cuisineIds?: string[];
    pageSize?: number;
}

export type GetTagsResponse = {
    externalId: string;
    id: string;
    name: string;
};

class FoodService {
    async getRestaurants(params?: GetRestaurantParams): Promise<RestaurantResponse[]> {
        const query = new URLSearchParams();

        if (params?.lat) query.append("Lat", params.lat.toString());
        if (params?.lng) query.append("Lng", params.lng.toString());
        if (params?.pageSize) query.append("pageSize", params.pageSize.toString());

        if (params?.cuisineIds) {
            params.cuisineIds.forEach((id) => query.append("cuisineIds", id));
        }

        const url = query.toString() ? `/restaurant?${query}` : "/restaurant";

        return apiService.get<RestaurantResponse[]>(url, false);
    }

    async getTags(): Promise<string[]> {
        return apiService.get<string[]>("/restaurant/cuisines", false);
    }

    async getRestaurantSuggest(params?: {lat: string, lng: string}): Promise<string[]> {
        const query = new URLSearchParams();
        if (params?.lat) query.append("Lat", params.lat.toString());
        if (params?.lng) query.append("Lng", params.lng.toString());
        const url = query.toString() ? `/restaurant/suggest?${query}` : "/restaurant/suggest";
        return apiService.get<string[]>(url, false);
    }
}

export const foodService = new FoodService();
