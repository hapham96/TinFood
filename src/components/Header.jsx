import React, { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";
import { StorageService } from "../services/storage.service";
import { apiService } from "../services/baseApi/api.service";
import { STORAGE_KEYS } from "../utils/constants";
import { useLogger } from "../services/logger/useLogger";

export default function Header() {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [newBaseUrl, setNewBaseUrl] = useState("");
  const storageService = new StorageService();
  const logger = useLogger("HeaderPage");
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

  const handleTapLogo = () => {
    setTapCount((prev) => {
      const newCount = prev + 1;
      logger.info("Logo tapped ->", newCount);
      if (newCount >= 4) {
        setShowPopup(true);
        return 0;
      }
      setTimeout(() => setTapCount(0), 3000); // reset after 3s
      return newCount;
    });
  };

  const handleSaveBaseUrl = async () => {
    if (newBaseUrl.trim()) {
      apiService.setBaseUrl(newBaseUrl.trim());
      await storageService.set(STORAGE_KEYS.BASE_URL, newBaseUrl.trim());
      setShowPopup(false);
      setNewBaseUrl("");
    }
  };

  useEffect(() => {
    // load baseUrl from storage
    storageService.get(STORAGE_KEYS.BASE_URL).then((saved) => {
      if (saved) {
        apiService.setBaseUrl(saved);
      }
    });
  }, []);

  return (
    <header
      className="w-full bg-white shadow-md px-6 py-3 flex items-center justify-between"
      style={{
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)",
      }}
    >
      {/* Left: Logo */}
      <div className="text-2xl font-bold text-sky-500" onClick={handleTapLogo}>
        TinFood
      </div>

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
      {/* Popup input BaseUrl */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: "rgb(29 29 40 / 20%)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white rounded-xl shadow-lg p-6 w-96">
              <h2 className="text-lg font-bold mb-4">⚙️ Set API Base URL</h2>
              <input
                type="text"
                value={newBaseUrl}
                onChange={(e) => setNewBaseUrl(e.target.value)}
                placeholder="Enter new base URL"
                className="w-full border px-3 py-2 rounded mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowPopup(false)}
                  className="px-4 py-2 rounded bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBaseUrl}
                  className="px-4 py-2 rounded bg-sky-500 text-white"
                >
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
