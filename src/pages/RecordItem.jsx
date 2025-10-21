/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrash } from "react-icons/fa";
import { MoneyBillType } from "../services/money-bill.service";

export default function RecordItem({ record, onOpen, onSwipeLeft }) {
  const [translateX, setTranslateX] = useState(0);

  const handlers = useSwipeable({
    onSwiping: (e) => {
      if (Math.abs(e.deltaY) > 10) return; // Nếu kéo dọc -> bỏ qua swipe ngang
      if (e.dir === "Left") setTranslateX(-Math.min(e.absX, 80));
      if (e.dir === "Right") setTranslateX(0);
    },
    onSwipedLeft: (e) => {
      if (Math.abs(e.deltaY) < 10 && e.absX > 60) onSwipeLeft?.();
      setTranslateX(0);
    },
    onSwipedRight: () => setTranslateX(0),
    preventScrollOnSwipe: false, // alow scroll
    trackMouse: false,
  });

  return (
    <AnimatePresence>
      <div className="relative overflow-hidden rounded-xl" {...handlers}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: translateX < 0 ? 1 : 0 }}
          className="absolute inset-0 bg-red-600 flex items-center justify-end pr-6 z-0"
        >
          <motion.div
            animate={{ x: translateX < 0 ? 0 : 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <FaTrash className="text-white w-5 h-5" />
          </motion.div>
        </motion.div>

        <motion.div
          style={{ x: translateX }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          onClick={() => translateX === 0 && onOpen()}
          className="
          relative z-10 p-4
          rounded-2xl
          cursor-pointer
          bg-white/60
          backdrop-blur-md
          border border-white/20
          shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_2px_6px_rgba(0,0,0,0.08)]
          hover:bg-white/70
          transition"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="text-lg font-semibold text-gray-800">
                {record.name || "Untitled Bill"}
              </div>

              <div className="text-sm text-gray-600 mt-1">
                {record.type === MoneyBillType.FOOD ? "🍱 FOOD" : "💰 NORMAL"}
              </div>

              <div className="text-xs text-gray-400 mt-1">
                {record.date || "N/A"}
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-bold text-gray-800">
                {(record.totalAfterDiscount || 0).toLocaleString()} ₫
              </div>
              <div className="text-xs text-gray-400">
                ({record.expenses?.length || 0} items)
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
