import React, { useState } from 'react';
import TinderCard from 'react-tinder-card';

const restaurants = [
  {
    name: "Pho 24",
    image: "https://source.unsplash.com/400x300/?pho",
    location: "District 1, HCMC",
    tags: ["Vietnamese", "Noodle", "Affordable"],
  },
  {
    name: "Pizza 4P's",
    image: "https://source.unsplash.com/400x300/?pizza",
    location: "District 3, HCMC",
    tags: ["Italian", "Pizza", "Cozy"],
  },
  {
    name: "Lẩu Wang",
    image: "https://down-vn.img.susercontent.com/vn-11134259-7r98o-lwadano70esbe6@resize_ss576x330",
    location: "Bình Thạnh, HCMC",
    tags: ["Korean", "Hotpot", "Buffet"],
  },
];

const Explore = () => {
  const [lastDirection, setLastDirection] = useState();

  const swiped = (direction, name) => {
    console.log("You swiped " + direction + " on " + name);
    setLastDirection(direction);
  };

  const outOfFrame = (name) => {
    console.log(name + " left the screen");
  };

  return (
    <div className="h-screen bg-[#faf2e4] flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-6 text-[#6b4f4f]">Explore Restaurants</h1>
      <div className="relative w-full max-w-md h-[500px]">
        {restaurants.map((res, index) => (
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
              <div className="bg-sky-500 bg-opacity-60 text-white p-4 rounded-lg mt-auto w-full">
                <h2 className="text-xl font-semibold">{res.name}</h2>
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
