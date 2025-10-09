import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useLogger } from "../services/logger/useLogger";
import { foodService } from "../services/food.service";
import { useApiEffect } from "../services/baseApi/useApi";
import { StorageService } from "../services/storage.service";
import { displayKmLabel } from "../utils/helpers";
import { DEFAULT_LOCATION } from "../utils/constants";
import { STORAGE_KEYS } from "../utils/constants";
import { Geolocation } from "@capacitor/geolocation";

export default function Search() {
  const logger = useLogger("SearchPage");
  const storageService = new StorageService();

  const [selectedTags, setSelectedTags] = useState([]);
  const [tags, setTags] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasLoadedFromCache, setHasLoadedFromCache] = useState(false);

  const { data, error, refetch } = useApiEffect(() => foodService.getTags(), {
    auto: false,
  });

  // Load tags from cache or fetch API
  useEffect(() => {
    const loadTags = async () => {
      try {
        const cachedTags = await storageService.get(STORAGE_KEYS.TAGS);
        if (cachedTags) {
          const parsed = JSON.parse(cachedTags);
          setTags(parsed);
          setHasLoadedFromCache(true);
          logger.info("✅ Loaded tags from storage", parsed);
        } else {
          refetch();
        }
      } catch (err) {
        logger.error("loadTags error", err);
        refetch();
      }
    };
    loadTags();
  }, [logger, refetch]); // Added storageService to dependency array

  useEffect(() => {
    if (!hasLoadedFromCache && data) {
      const mappedTags = data.map((tag) => ({
        value: tag.id,
        label: tag.name,
      }));
      setTags(mappedTags);
      logger.info("🌐 Loaded tags from API: ", { mappedTags, error });
      storageService.set(STORAGE_KEYS.TAGS, JSON.stringify(mappedTags));
    }
  }, [data, error, logger, hasLoadedFromCache]); // Added storageService to dependency array

  /**
   * REFACTORED: Fetch suggestions based on selected tags and location.
   * This version ensures lat/lng are determined first, then calls the API once.
   */
  const handleGetSuggestions = async () => {
    setLoading(true);
    setSuggestions([]); // Clear previous suggestions

    const tagIds = selectedTags.map((t) => t.value);

    // Step 1: Determine the location to use (user's or default)
    let locationToUse = { ...DEFAULT_LOCATION };

    try {
      const permStatus = await Geolocation.checkPermissions();
      if (permStatus.location !== "granted") {
        const requestStatus = await Geolocation.requestPermissions();
        if (requestStatus.location !== "granted") {
          throw new Error("Location permission denied.");
        }
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });

      locationToUse = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      logger.info("📍 Got user location (Capacitor):", locationToUse);
    } catch (geoErr) {
      logger.error("Geolocation error (Capacitor), falling back to default.", geoErr);
      // locationToUse already holds the default values, so we just log the error.
    }

    // Step 2: Call the API with the determined location
    try {
      const req = {
        lat: locationToUse.latitude,
        lng: locationToUse.longitude,
        cuisineIds: tagIds,
        pageSize: 10,
      };
      logger.info("📡 Calling getRestaurants with request:", req);
      const result = await foodService.getRestaurants(req);
      if (result) {
        setSuggestions(result);
        logger.info("🍽️ Loaded restaurants successfully", result);
      }
    } catch (apiErr) {
      logger.error("API call to getRestaurants failed", apiErr);
      // Optionally set an error state to show a message to the user
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen border-gray-200 font-vintage px-6 py-10">
      <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center caret-pink-500">
          🥄 Food Recommender
        </h1>

        <label className="block mb-2 text-lg">Select your favorite tags:</label>
        <div className="mb-4">
          <Select
            isMulti
            options={tags}
            value={selectedTags}
            onChange={(selected) => setSelectedTags(selected || [])}
            className="text-black"
          />
        </div>

        <div className="text-center">
          <button
            onClick={handleGetSuggestions}
            disabled={loading || selectedTags.length === 0} // Disable if no tags are selected
            className={`px-5 py-2 rounded-full shadow-sm transition ${
              loading || selectedTags.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "text-gray-200 bg-sky-500 hover:bg-sky-700"
            }`}
          >
            {loading ? "⏳ Loading..." : "🍽️ Get Suggestions"}
          </button>
        </div>

        {/* Display suggestions */}
        {suggestions?.items?.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">
              🏠 Suggested Restaurants
            </h2>
            <ul className="list-disc ml-6 space-y-3">
              {suggestions.items.map((item) => (
                <li key={item.id}> {/* Use a unique ID from the item for the key */}
                  <div className="font-bold">{item.name}</div>
                  <div className="text-sm text-gray-600">
                    {item.address}&nbsp;&nbsp;
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
          </div>
        )}
      </div>
    </div>
  );
}