import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import BottomTabBar from "./components/BottomTabBar";
import Search from "./pages/Search";
import Explore from "./pages/Explore";
import Favorite from "./pages/Favorite";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import FloatingButton from "./components/FloatingButton";
import MoneyShare from "./pages/MoneyShare";
export default function App() {
  return (
    <Router>
      <div className="h-screen bg-[#faf2e4] flex flex-col">
        <Header />

        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Search />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/favorite" element={<Favorite />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/money-share" element={<MoneyShare />} />
          </Routes>
        </main>
        {/* <FloatingButton /> */}
        <BottomTabBar />
      </div>
    </Router>
  );
}
