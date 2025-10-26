import React, { useEffect } from "react";
import Select from "react-select";
import { useLogger } from "../services/logger/useLogger";
import { foodService } from "../services/food.service";
import { StorageService } from "../services/storage.service";
import { displayKmLabel } from "../utils/helpers";
import { DEFAULT_LOCATION, STORAGE_KEYS } from "../utils/constants";
import { Geolocation } from "@capacitor/geolocation";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setTags,
  setSelectedTags,
  setSuggestions,
  appendSuggestions,
  setPage,
  setHasMore,
  setLoading,
  resetSearch,
} from "../store/searchSlice";

export default function Search() {
  const logger = useLogger("SearchPage");
  const storageService = new StorageService();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedTags, tags, suggestions, page, hasMore, loading } =
    useSelector((state) => state.search);

  // ✅ Load tags
  useEffect(() => {
    (async () => {
      const cached = null; // bạn có thể bật cache lại nếu muốn
      if (cached) {
        dispatch(setTags(JSON.parse(cached)));
        logger.info("✅ Loaded tags from cache");
      } else {
        const data = await foodService.getTags();
        const mapped = data.map((t) => ({ value: t.id, label: t.name }));
        dispatch(setTags(mapped));
        storageService.set(STORAGE_KEYS.TAGS, JSON.stringify(mapped));
        logger.info("🌐 Loaded tags from API");
      }
    })();
  }, [dispatch]);

  // ✅ Fetch suggestions (API call)
  const handleGetSuggestions = async (loadMore = false) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    dispatch(setLoading(true));

    const tagIds = selectedTags.map((t) => t.value);
    let locationToUse = { ...DEFAULT_LOCATION };

    try {
      const perm = await Geolocation.requestPermissions();
      if (perm.location === "granted") {
        const pos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });
        locationToUse = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
      }
    } catch (err) {
      logger.warn("📍 Geolocation error", err);
    }

    try {
      if (!loadMore) {
        dispatch(setSuggestions([]));
        dispatch(setPage(1));
        dispatch(setHasMore(false));
      }

      const request = {
        lat: locationToUse.latitude,
        lng: locationToUse.longitude,
        cuisineIds: tagIds,
        pageSize: 10,
        page: loadMore ? page + 1 : 1,
      };

      const result = await foodService.getRestaurants(request);
      logger.info("🌐 Fetched suggestions", { request, result });

      if (result?.items) {
        if (loadMore) {
          dispatch(appendSuggestions(result.items));
        } else {
          dispatch(setSuggestions(result.items));
        }
        dispatch(setPage(result.pageNumber));
        dispatch(setHasMore(result.hasNextPage));
      }
    } catch (err) {
      logger.error("API error", err);
      dispatch(resetSearch());
    } finally {
      dispatch(setLoading(false));
    }
  };

  // ✅ Infinite Scroll
  useEffect(() => {
    const handleScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;
      if (nearBottom && !loading && hasMore) {
        logger.info("⬇️ Reached bottom → load more");
        handleGetSuggestions(true);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  const handleRestaurantClick = (restaurant) => {
    navigate(`/restaurant-detail/${restaurant.id}`, { state: { restaurant } });
  };

  // ✅ UI
  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">
          🥄 Food Recommender
        </h1>

        <Select
          isMulti
          options={tags}
          value={selectedTags}
          onChange={(selected) => dispatch(setSelectedTags(selected || []))}
        />

        <div className="text-center mt-3 mb-3">
          <button
            onClick={() => handleGetSuggestions(false)}
            disabled={loading}
            className={`px-5 py-2 rounded-full ${"bg-primary text-white hover:bg-primary"}`}
          >
            {loading ? "⏳ Loading..." : "🍽️ Get Suggestions"}
          </button>
        </div>

        {/* ✅ Suggest Result */}
        <div
          className="overflow-y-auto"
          style={{ maxHeight: "60vh" }}
          onScroll={(e) => {
            const target = e.target;
            const nearBottom =
              target.scrollTop + target.clientHeight >=
              target.scrollHeight - 200;

            if (nearBottom && !loading && hasMore) {
              logger.info("⬇️ Reached bottom → load more");
              handleGetSuggestions(true);
            }
          }}
        >
          {suggestions.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">
                🏠 Suggested Restaurants
              </h2>
              <ul className="list-disc ml-6 space-y-3">
                {suggestions.map((item) => (
                  <li key={item.id} onClick={() => handleRestaurantClick(item)}>
                    <div className="font-bold">{item.name}</div>
                    <div className="text-sm text-gray-600">
                      {item.address}&nbsp;
                      <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full">
                        {parseInt(item.rating, 10) || 0}/10★
                      </span>
                    </div>
                    {item.distance != null && (
                      <div className="text-sm text-gray-600">
                        {displayKmLabel(item.distance)}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              {loading && (
                <p className="text-center mt-4 text-gray-500">
                  ⏳ Loading more results...
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
