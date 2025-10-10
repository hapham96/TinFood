import { apiService } from "./baseApi/api.service";
const PAGE_SIZE = 10;
interface Restaurant {
    id: number;
    name: string;
    address: string;
    imageUrl: string;
    rating: string;
    latitude: string;
    longitude: string;
    distance: string;
    phone?: string;
    externalId?: string;
    source?: string;
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
    page?: number;
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
        if (params?.page) query.append("pageNumber", params.page.toString());
        if (params?.cuisineIds) {
            params.cuisineIds.forEach((id) => query.append("cuisineIds", id));
        }

        const url = query.toString() ? `/restaurant?${query}` : "/restaurant";

        return apiService.get<RestaurantResponse[]>(url, false);
    }

    async getTags(): Promise<string[]> {
        return apiService.get<string[]>("/restaurant/cuisines", false);
    }


    async getRestaurantSuggest(params: {
        lat: string;
        lng: string;
        page: number;
    }): Promise<RestaurantResponse> {
        const query = new URLSearchParams();
        query.append("Lat", params.lat.toString());
        query.append("Lng", params.lng.toString());
        query.append("PageNumber", params.page.toString());
        query.append("pageSize", PAGE_SIZE.toString());

        const url = `/restaurant/suggest?${query}`;

        return apiService.get<RestaurantResponse>(url, false);
    }
}

export const foodService = new FoodService();
