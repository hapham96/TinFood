import { useState, useEffect } from "react";
import TinderCard from "react-tinder-card";
import { useApiEffect } from "../services/baseApi/useApi";
import { foodService } from "../services/food.service";
import { useLogger } from "../services/logger/useLogger";
import { displayKmLabel } from "../utils/helpers";

const Explore = () => {
  const logger = useLogger("ExplorePage");
  const [restaurants, setRestaurants] = useState([]);
  const [lastDirection, setLastDirection] = useState();

  const { data, error, loading } = useApiEffect(() =>
    foodService.getRestaurants()
  );

  useEffect(() => {
    if (data) {
      setRestaurants(data.items ?? []);
      logger.info("getRestaurants - loaded: ", data);
    }
  }, [data, logger]);

  const swiped = (direction, name, location) => {
    logger.info("You swiped " + direction + " on " + name);
    setLastDirection(direction);

    if (direction === "right") {
      const confirmGo = window.confirm(
        `Would you like to direct to ${name} right now?`
      );
      if (confirmGo) {
        window.open(
          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            location
          )}`,
          "_blank"
        );
      }
    }
  };

  const outOfFrame = (name) => {
    logger.info(name + " left the screen");
  };

  return (
    <div className="h-screen bg-[#faf2e4] flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-6 text-[#6b4f4f]">
        Explore Restaurants
      </h1>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">Error loading restaurants</p>}

      <div className="relative w-full max-w-md h-[500px]">
        {restaurants.map((res) => (
          <TinderCard
            className="absolute w-full h-full"
            key={res.id}
            onSwipe={(dir) => swiped(dir, res.name, res.address)}
            onCardLeftScreen={() => outOfFrame(res.name)}
            preventSwipe={["up", "down"]}
          >
            <div
              className="bg-white rounded-2xl shadow-xl p-4 flex flex-col items-center justify-between h-full"
              style={{
                backgroundImage: `url(${res.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-black/5 rounded-2xl"></div>
              <div className="bg-sky-500 bg-opacity-60 text-white p-4 rounded-lg mt-auto w-full">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{res.name}</h2>
                  <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full">
                    {parseInt(res.rating) ?? 0}/10★
                  </span>
                </div>
                <p className="text-sm">{res.location}</p>
                <div className="flex gap-2 flex-wrap mt-2">
                  {res.distance && (
                    <span className="bg-white text-black px-2 py-1 rounded-full text-xs">
                      {displayKmLabel(res.distance)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </TinderCard>
        ))}
      </div>

      {lastDirection && (
        <p className="mt-4 text-[#6b4f4f]">You swiped {lastDirection}</p>
      )}
    </div>
  );
};

export default Explore;
