import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service"; // ✅ import service

export default function Header() {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const subscription = authService.authState.subscribe((state) => {
      setIsAuth(state);
    });

    // check saved token (Preferences)
    authService.getToken().then((token) => {
      if (token) {
        setIsAuth(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = async () => {
    await authService.logout();
    setShowMenu(false);
  };

  return (
    <header className="w-full bg-white shadow-md px-6 py-3 flex items-center justify-between">
      {/* Left: Logo */}
      <div className="text-2xl font-bold text-sky-500" onClick={() => navigate("/search")}>TinFood</div>

      {/* Right: User Area */}
      <div className="flex items-center gap-4">
        {!isAuth ? (
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-blue-700"
          >
            Login / Sign Up
          </button>
        ) : (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 focus:outline-none"
            >
              <FaUserCircle className="text-3xl text-gray-700" />
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-10"
                >
                  <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
}
