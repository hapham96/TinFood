import { NavLink } from "react-router-dom";
import { FaSearch, FaCompass, FaHeart } from "react-icons/fa";

const tabItems = [
  { label: "Search", icon: <FaSearch />, to: "/" },
  { label: "Explore", icon: <FaCompass />, to: "/explore" },
  { label: "Favorite", icon: <FaHeart />, to: "/favorite" },
];

export default function BottomTabBar() {
  return (
    <nav className="fixed bottom-0 border-gray-200 left-0 right-0 bg-white border-t shadow-md flex justify-around items-center h-16 rounded-xl mx-4 mb-4 shadow-lg">
      {tabItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          className={({ isActive }) =>
            `flex flex-col items-center text-sm ${
              isActive ? "color-primary font-semibold" : "text-gray-700"
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
