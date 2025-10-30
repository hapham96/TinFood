import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StorageService } from "../services/storage.service";
import { STORAGE_KEYS } from "../utils/constants";
import { CiStar } from "react-icons/ci";
import { RiMapPin2Line } from "react-icons/ri";

export default function FavoritePage() {
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();
  const storageService = new StorageService();

  useEffect(() => {
    (async () => {
      const favRaw = await storageService.get(STORAGE_KEYS.FAVORITES);
      const favList = favRaw ? JSON.parse(favRaw) : [];
      setFavorites(favList);
    })();
  }, []);

  const handleClickItem = (restaurant) => {
    navigate(`/restaurant-detail/${restaurant.id}`, { state: { restaurant } });
  };

  return (
    <div className="min-h-screen bg-[#faf2e4] px-4 pt-6 pb-10">
      <h2 className="text-xl font-bold color-primary mb-3">Favorite</h2>

      {favorites.length === 0 && (
        <p className="text-gray-500 text-center mt-10">
          No favorite restaurants yet.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {favorites.map((item) => (
          <div
            key={item.id}
            className="flex items-center bg-white rounded-3xl shadow p-3 cursor-pointer hover:shadow-md transition"
            onClick={() => handleClickItem(item)}
          >
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-20 h-20 rounded-2xl object-cover mr-3 flex-shrink-0"
            />

            <div className="flex-1 overflow-hidden">
              <h2 className="font-semibold text-gray-900 text-base truncate">
                {item.name}
              </h2>

              <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                <RiMapPin2Line className="w-4 h-4 text-green-500" />
                <span className="truncate">{item.address}</span>
              </div>
            </div>

            <div className="flex items-center gap-1 ml-2">
              <CiStar className="text-yellow-500 w-5 h-5" />
              <span className="font-semibold text-gray-700">
                {(item.rating / 2).toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
