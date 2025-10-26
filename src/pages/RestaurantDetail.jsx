import { useState, useEffect } from "react";
import { CiStar } from "react-icons/ci";
import { RiMapPin2Line } from "react-icons/ri";
import { CiHashtag } from "react-icons/ci";
import { MdFavoriteBorder, MdFavorite } from "react-icons/md";
import { SlArrowRight } from "react-icons/sl";
import { useLocation, useNavigate } from "react-router-dom";
import { displayKmLabel } from "../utils/helpers";
import { useLogger } from "../services/logger/useLogger";
import { StorageService } from "../services/storage.service";
import { STORAGE_KEYS } from "../utils/constants";

export default function RestaurantDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const restaurant = location.state?.restaurant;
  const logger = useLogger("RestaurantDetailPage");
  const storageService = new StorageService();

  const [isFavorite, setIsFavorite] = useState(false);

  const handleClickToLocation = (address) => {
    logger.info(`Goto ${address}`);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address
    )}`;
    window.open(mapsUrl, "_blank");
  };

  // ✅ Load favorite state khi vào trang
  useEffect(() => {
    (async () => {
      if (!restaurant) return;
      try {
        const favRaw = await storageService.get(STORAGE_KEYS.FAVORITES);
        const favorites = favRaw ? JSON.parse(favRaw) : [];
        const exists = favorites.some((r) => r.id === restaurant.id);
        setIsFavorite(exists);
      } catch (err) {
        logger.error("Error loading favorites", err);
      }
    })();
  }, [restaurant]);

  // ✅ Toggle favorite
  const toggleFavorite = async () => {
    try {
      const favRaw = await storageService.get(STORAGE_KEYS.FAVORITES);
      let favorites = favRaw ? JSON.parse(favRaw) : [];

      if (isFavorite) {
        // remove
        favorites = favorites.filter((r) => r.id !== restaurant.id);
        logger.info(`Removed from favorites: ${restaurant.name}`);
      } else {
        // add
        favorites.push(restaurant);
        logger.info(`❤️ Added to favorites: ${restaurant.name}`);
      }

      await storageService.set(
        STORAGE_KEYS.FAVORITES,
        JSON.stringify(favorites)
      );
      setIsFavorite(!isFavorite);
    } catch (err) {
      logger.error("Error updating favorites", err);
    }
  };

  if (!restaurant) {
    return (
      <div className="p-4">
        <p>No restaurant data found.</p>
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 underline"
        >
          Go back
        </button>
      </div>
    );
  }

  const {
    name,
    imageUrl,
    rating,
    totalReview,
    distance,
    address,
    foods = [
      // {
      //   id: 1,
      //   name: "Sample Food",
      //   price: "20000",
      //   imageUrl:
      //     "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
      //   bestSeller: false,
      // }
    ],
    coupons = [],
  } = restaurant;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header image */}
      <div className="relative w-full h-64">
        <img
          src={imageUrl}
          alt={name}
          className="object-cover w-full h-full rounded-b-3xl shadow-sm"
        />

        {/* Back + Favorite buttons */}
        <div className="absolute top-4 left-4 flex gap-3">
          <button className="bg-[#c14564] text-white px-3 py-2 rounded-full shadow-md hover:bg-[#a83853] transition z-50" onClick={() => navigate(-1)}>
            ←
          </button>
        </div>

        <div className="absolute top-4 right-4">
          <button
            onClick={toggleFavorite}
            className="bg-white/70 backdrop-blur-sm rounded-full p-2 hover:bg-white transition"
          >
            {isFavorite ? (
              <MdFavorite className="text-red-500 w-6 h-6" />
            ) : (
              <MdFavoriteBorder className="text-gray-700 w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h1 className="text-xl font-bold text-gray-900">{name}</h1>

        <div className="flex items-center gap-2 mt-2 text-gray-600 text-sm">
          <CiStar className="w-4 h-4 text-yellow-500" />
          <span className="font-semibold">{(rating / 2).toFixed(1)}</span>
          <span>({(totalReview || 0).toLocaleString()} reviews)</span>
        </div>

        <div
          className="flex items-center justify-between mt-2 text-gray-700 text-sm cursor-pointer"
          onClick={() => handleClickToLocation(address)}
        >
          <div className="flex items-center gap-1">
            <RiMapPin2Line className="w-4 h-4 text-green-600" />
            <span>
              {address} <br /> {displayKmLabel(distance)}
            </span>
          </div>
          <SlArrowRight className="w-4 h-4 text-gray-400" />
        </div>

        {coupons.length > 0 && (
          <div className="flex items-center mt-3 color-primary text-sm">
            <CiHashtag className="w-4 h-4 mr-1" />
            <span className="mr-2">Discounts: </span>
            {coupons.map((coupon) => (
              <span className="mr-2 coupon">{coupon} </span>
            ))}
          </div>
        )}

        {foods.length > 0 && (
          <div className="mt-5">
            <h2 className="text-lg font-semibold mb-3">Foods</h2>

            <div className="grid grid-cols-2 gap-3">
              {foods.map((item) => (
                <div className="relative bg-white rounded-2xl shadow p-2">
                  <img
                    src={item.imageUrl}
                    className="rounded-2xl w-full h-32 object-cover"
                  />
                  {item.bestSeller && (
                    <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                      Best Seller
                    </div>
                  )}
                  <p className="mt-2 text-sm font-medium text-gray-700">
                    {item.name}
                  </p>
                  <span className="mt-2 text-gray-700 text-sm font-medium">
                    {item.price}d
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
