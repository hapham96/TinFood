import { NavLink } from "react-router-dom";
import { FaSearch, FaCompass, FaHeart } from "react-icons/fa";

const tabItems = [
  { label: "Search", icon: <FaSearch />, to: "/" },
  { label: "Explore", icon: <FaCompass />, to: "/explore" },
  { label: "Favorite", icon: <FaHeart />, to: "/favorite" },
];

export default function BottomTabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md flex justify-around items-center h-16">
      {tabItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          className={({ isActive }) =>
            `flex flex-col items-center text-sm ${
              isActive ? "text-blue-600 font-semibold" : "text-gray-400"
            }`
          }
        >
          <div className="text-xl">{item.icon}</div>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
