import React, { useState } from "react";
import Select from "react-select";
import { useLogger } from "../services/logger/useLogger";
const tagsOptions = [
  { value: "cafe", label: "cafe" },
  { value: "matcha", label: "matcha" },
  { value: "drink", label: "drink" },
  { value: "black_coffee", label: "black coffee" },
];

export default function Search() {
  const logger = useLogger("SearchPage");
  const [selectedTags, setSelectedTags] = useState([]);
  const [suggestions, setSuggestions] = useState(null);

  const handleGetSuggestions = () => {
    logger.info("handleGetSuggestions -> ");
    const foodList = [
      "Matcha Đá Xay (matcha, trà xanh, cafe, đá xay)",
      "Cà phê đá (vietnamese coffee, iced coffee)",
      "Cà phê đen (black coffee, strong flavor)",
    ];
    const restaurantList = [
      "Gong Cha - Vinhomes Central Park (7.264★)",
      "Phúc Long - Lê Văn Thọ (7★)",
      "Quán 567 - Sinh Tố, Giải Khát (5.182★)",
    ];
    setSuggestions({ foodList, restaurantList });
  };

  return (
    <div className="min-h-screen border-gray-200 font-vintage px-6 py-10">
      <div className="max-w-2xl mx-auto bg-vintageSoft border border-gray-200 rounded-2xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center caret-pink-500">
          🥄 Food Recommender
        </h1>

        <label className="block mb-2 text-lg">Select your favorite tags:</label>
        <div className="mb-4">
          <Select
            isMulti
            options={tagsOptions}
            value={selectedTags}
            onChange={setSelectedTags}
            className="text-black"
          />
        </div>

        <div className="text-center">
          <button
            onClick={handleGetSuggestions}
            className="text-gray-200 bg-sky-500 hover:bg-sky-700 px-5 py-2 rounded-full shadow-sm transition"
          >
            🍽️ Get Suggestions
          </button>
        </div>

        {suggestions && (
          <>
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-2">📌 Suggested Foods</h2>
              <ul className="list-disc ml-6 space-y-1">
                {suggestions.foodList.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">
                🏠 Suggested Restaurants
              </h2>
              <ul className="list-disc ml-6 space-y-1">
                {suggestions.restaurantList.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
