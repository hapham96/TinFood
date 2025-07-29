import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Search from "./pages/Search";
import Explore from "./pages/Explore";
import Favorite from "./pages/Favorite";
import BottomTabBar from "./components/BottomTabBar";

export default function App() {
  return (
    <Router>
      <div className="pb-16 min-h-screen">
        <Routes>
          <Route path="/" element={<Search />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/favorite" element={<Favorite />} />
        </Routes>

        <BottomTabBar />
      </div>
    </Router>
  );
}
