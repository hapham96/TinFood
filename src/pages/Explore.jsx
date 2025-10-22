/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import TinderCard from "react-tinder-card";
import { foodService } from "../services/food.service";
import { useLogger } from "../services/logger/useLogger";
import { displayKmLabel, isNativePlatform } from "../utils/helpers";
import { Geolocation } from "@capacitor/geolocation";
import { DEFAULT_LOCATION } from "../utils/constants";
import { useNavigate } from "react-router-dom";
import { StorageService } from "../services/storage.service";
import { STORAGE_KEYS } from "../utils/constants";

const Explore = () => {
  const logger = useLogger("ExplorePage");
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [coords, setCoords] = useState(null);

  const [lastDirection, setLastDirection] = useState();
  const [error, setError] = useState(null);
  const storageService = new StorageService();

  useEffect(() => {
    const getCoordinates = async () => {
      try {
        if (!isNativePlatform()) {
          setCoords(DEFAULT_LOCATION);
          return;
        }
        const perm = await Geolocation.checkPermissions();
        if (perm.location !== "granted") {
          const req = await Geolocation.requestPermissions();
          if (req.location !== "granted") {
            setCoords(DEFAULT_LOCATION);
            return;
          }
        }
        const pos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      } catch (err) {
        logger.error("Geolocation error:", err);
        setError("Could not get your location. Showing default results.");
        setCoords(DEFAULT_LOCATION);
      }
    };
    getCoordinates();
  }, [logger]);

  const loadRestaurants = useCallback(
    async (pageNum) => {
      if (!hasMore || !coords) return;

      setLoading(true);
      setError(null);
      try {
        // API call return RestaurantResponse
        const response = await foodService.getRestaurantSuggest({
          lat: coords.latitude,
          lng: coords.longitude,
          page: pageNum,
        });
        // add new items in current list
        setRestaurants((prev) => [...prev, ...response.items]);
        setHasMore(response.hasNextPage);
        setPage(response.pageNumber);
        logger.info(
          `Loaded page ${response.pageNumber}/${response.totalPages}. Has next page: ${response.hasNextPage}`
        );
      } catch (err) {
        logger.error(`Error loading page ${pageNum}:`, err);
        setError("Failed to load restaurants. Please try again later.");
      } finally {
        setLoading(false);
      }
    },
    [coords, hasMore, logger]
  );

  // Effect to load initial restaurants
  useEffect(() => {
    if (coords) {
      setRestaurants([]);
      setPage(1);
      setHasMore(true);
      loadRestaurants(1);
    }
  }, [coords, loadRestaurants]);

  const onCardLeftScreen = (name, index) => {
    logger.info(`${name} left the screen!`);
    if (index === 0 && !loading && hasMore) {
      logger.info("Last card swiped. Loading next page...");
      setPage(page + 1);
      loadRestaurants(page + 1);
    }
  };

  const swiped = async (direction, restaurant) => {
    logger.info(`You swiped ${direction} on ${restaurant.name}`);
    setLastDirection(direction);

    if (direction === "right") {
      const confirm = window.confirm(`Would you like to add Favorite ${name}?`);
      if (confirm) {
        // const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        //   location
        // )}`;
        // window.open(mapsUrl, "_blank");
        const favRaw = await storageService.get(STORAGE_KEYS.FAVORITES);
        let favorites = favRaw ? JSON.parse(favRaw) : [];
        const isAlreadyFav = favorites.some((r) => r.id === restaurant.id);
        if (isAlreadyFav) {
          alert(`${restaurant.name} is already in your favorites!`);
          return;
        } else {
          favorites.push(restaurant);
          logger.info(`❤️ Added ${restaurant.name} to favorites`);
        }
        await storageService.set(
          STORAGE_KEYS.FAVORITES,
          JSON.stringify(favorites)
        );
      }
    }
  };

  const childRefs = useMemo(
    () =>
      Array(restaurants.length)
        .fill(0)
        .map(() => React.createRef()),
    [restaurants.length]
  );

  const handleRestaurantClick = (restaurant) => {
    navigate(`/restaurant-detail/${restaurant.id}`, {
      state: { restaurant },
    });
  };

  return (
    <div className="h-full bg-[#faf2e4] flex flex-col items-center justify-center px-4 overflow-hidden">
      <h1 className="text-3xl font-bold mt-4 text-[#6b4f4f]">
        Explore Restaurants
      </h1>

      <div className="relative w-full max-w-md flex-1 flex items-center justify-center mb-2">
        {restaurants.length > 0 &&
          restaurants.map((res, index) => (
            <TinderCard
              ref={childRefs[index]}
              className="absolute w-[90vw] max-w-sm h-[70vh] max-h-[500px]"
              key={`${res.id}-${index}`} //index
              onSwipe={(dir) => swiped(dir, res)}
              onCardLeftScreen={() => onCardLeftScreen(res.name, index)}
              preventSwipe={["up", "down"]}
              onClick={() => handleRestaurantClick(res)}
            >
              <div
                className="bg-white rounded-2xl shadow-xl p-4 flex flex-col items-center justify-between h-full"
                style={{
                  backgroundImage: `url(${res.imageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>
                <div className="relative mt-auto w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 rounded-b-2xl">
                  <div className="flex items-center justify-between text-white">
                    <h2 className="text-xl font-semibold">{res.name}</h2>
                    <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full">
                      {parseInt(res.rating) ?? 0}/10★
                    </span>
                  </div>
                  <p className="text-sm text-gray-200">{res.address}</p>
                  {res.distance && (
                    <span className="mt-2 inline-block bg-white/30 text-white px-2 py-1 rounded-full text-xs">
                      {displayKmLabel(res.distance)}
                    </span>
                  )}
                </div>
              </div>
            </TinderCard>
          ))}

        {loading && <p className="text-gray-500">⏳ Finding restaurants...</p>}
        {error && <p className="text-red-500">⚠️ {error}</p>}
        {!loading && !error && restaurants.length === 0 && (
          <p className="text-gray-500">
            {hasMore ? "No restaurants found." : "🎉 You've seen them all!"}
          </p>
        )}
      </div>
    </div>
  );
};

export default Explore;
