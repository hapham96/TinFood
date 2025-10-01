import { use, useState } from "react";
import TinderCard from "react-tinder-card";
import { useApi } from "../services/baseApi/useApi";
import { foodService } from "../services/food.service";

const restaurants = [
  {
    id: 1,
    name: "Pho 24",
    image:
      "https://media.istockphoto.com/id/910864612/vi/anh/vietnamese-soup-pho-bo.jpg?s=612x612&w=0&k=20&c=mWhHVgX-_ag5SoqPB-I2m-MZLJoZYw25CuEGoSZ25vo=",
    location: "District 1, HCMC",
    tags: ["Vietnamese", "Noodle", "Affordable"],
    rating: 4.5,
    point: 100,
  },
  {
    id: 2,
    name: "Pizza 4P's",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGl6emF8ZW58MHx8MHx8fDA%3D",
    location: "District 3, HCMC",
    tags: ["Italian", "Pizza", "Cozy"],
    rating: 4,
    point: 100,
  },
  {
    id: 3,
    name: "Lẩu Wang",
    image:
      "https://down-vn.img.susercontent.com/vn-11134259-7r98o-lwadano70esbe6@resize_ss576x330",
    location: "Bình Thạnh, HCMC",
    tags: ["Korean", "Hotpot", "Buffet"],
    rating: 2,
    point: 100,
  },
];

const Explore = () => {
  const logger = use("ExplorePage");
  const { data, error } = useApi(
    () => foodService.getRestaurants()
  );
  logger.info("getRestaurants - loaded: ", { data, error });
  const [lastDirection, setLastDirection] = useState();

  const swiped = (direction, name) => {
    logger.info("You swiped " + direction + " on " + name);
    setLastDirection(direction);
    if (direction === "right") {
      const confirmGo = window.confirm(
        `Would you like to direct to ${name} right now?`
      );
      if (confirmGo) {
        // open Google Maps
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
    console.log(name + " left the screen");
  };

  return (
    <div className="h-screen bg-[#faf2e4] flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-6 text-[#6b4f4f]">
        Explore Restaurants
      </h1>
      <div className="relative w-full max-w-md h-[500px]">
        {restaurants.map((res) => (
          <TinderCard
            className="absolute w-full h-full"
            key={res.name}
            onSwipe={(dir) => swiped(dir, res.name)}
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
                    {res.rating ?? 0}/5★
                  </span>
                </div>
                <p className="text-sm">{res.location}</p>
                <div className="flex gap-2 flex-wrap mt-2">
                  {res.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-white text-black px-2 py-1 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
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
