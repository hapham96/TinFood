/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";

const ConfirmModal = ({ isOpen, text, onClose, onConfirm }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-[#faf2e4] rounded-2xl shadow-lg p-6 w-80 text-center"
          >
            <h2 className="text-xl font-semibold text-[#6b4f4f] mb-4">
              Confirmation
            </h2>
            <p className="text-[#6b4f4f] mb-6">{text}</p>

            <div className="flex justify-center gap-4">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-gray-300 text-[#6b4f4f] hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded-xl bg-[#6b4f4f] text-white hover:bg-[#553939]"
              >
                Yes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
