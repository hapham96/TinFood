/* eslint-disable no-unused-vars */
import { NavLink } from "react-router-dom";
import { CiSearch, CiShare2 } from "react-icons/ci";
import { FaWpexplorer } from "react-icons/fa";
import { MdFavoriteBorder } from "react-icons/md";
import { IoRestaurantOutline } from "react-icons/io5";
const tabItems = [
  { label: "Search", icon: CiSearch, to: "/" },
  { label: "Explore", icon: IoRestaurantOutline, to: "/explore" },
  { label: "ShareMoney", icon: CiShare2, to: "/bill-records" },
  { label: "Favorite", icon: MdFavoriteBorder, to: "/favorite" },
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
