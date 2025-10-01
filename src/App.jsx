import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Search from "./pages/Search";
import Explore from "./pages/Explore";
import Favorite from "./pages/Favorite";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import BottomTabBar from "./components/BottomTabBar";
import Header from "./components/Header";

export default function App() {
  return (
    <Router>
      <div className="pb-16 min-h-screen">
        <Header />
        <Routes>
          <Route path="/" element={<Search />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/favorite" element={<Favorite />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>

        <BottomTabBar />
      </div>
    </Router>
  );
}
