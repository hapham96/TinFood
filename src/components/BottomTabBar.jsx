import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaChartLine,
  FaShareAlt,
  FaMapMarkerAlt,
  FaCog,
} from "react-icons/fa";
import { FaSearch, FaCompass, FaHeart } from "react-icons/fa";

const tabItems = [
  { label: "Search", icon: FaSearch, to: "/" },
  { label: "Explore", icon: FaCompass, to: "/explore" },
  { label: "ShareMoney", icon: FaShareAlt, to: "/money-share" },
  { label: "Favorite", icon: FaHeart, to: "/favorite" },
];

export default function BottomTabBar() {
  return (
    <nav className="absolute bottom-0 left-0 right-0 bottom-bar border-t border-gray-200 flex justify-around items-center h-18 pb-safe">
      {tabItems.map(({ label, icon: Icon, to }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center text-sm md:text-base transition-colors ${
              isActive ? "color-primary font-semibold" : "text-gray-500"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon
                className={`mb-1 ${
                  isActive ? "color-primary" : "text-gray-500"
                } text-xl`}
              />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
