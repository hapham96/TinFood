import React, { useState } from "react";
import { MoneyBillType } from "../../services/money-bill.service";
import ConfirmModal from "./ConfirmModal";
/**
 * Modal component for creating a new money bill.
 * Collects name, address (optional), and type (NORMAL or FOOD).
 */
export default function AddNewBillModal({ isOpen, onClose, onCreate }) {
  // --- State for form inputs ---
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [type, setType] = useState(MoneyBillType.NORMAL); // Default to NORMAL
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    message: ""
  });
  // Don't render if not open
  if (!isOpen) return null;

  /**
   * Handles the creation process.
   * Validates the name and calls the onCreate callback.
   */
  const handleCreate = () => {
    // Validate required fields
    if (!name.trim()) {
      setAlertModal({
        isOpen: true,
        message: "⚠️ Bill name is required!",
      });
      return;
    }
    // Pass collected data to the parent component
    onCreate({
      name: name.trim(),
      address: address.trim(),
      type: type,
    });
    // Reset form state after creation
    setName("");
    setAddress("");
    setType(MoneyBillType.NORMAL);
    onClose();
  };

  return (
    // Modal Overlay
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 backdrop-blur-sm"
      onClick={onClose} // Close on overlay click
    >
      {/* Modal Container */}
      <div
        className="relative bg-white rounded-xl shadow-lg p-6 w-full max-w-sm mx-4 text-[#4b2e19] animate-fadeIn"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 text-2xl hover:text-[#c14564] transition"
          aria-label="Close"
        >
          &times;
        </button>

        {/* Modal Title */}
        <h3 className="text-xl font-bold mb-5 text-center text-[#c14564]">
          {" "}
         ✨ Create New Bill
        </h3>

        {/* Bill Name Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            📌 Bill Name (*)
          </label>{" "}
          <input
            type="text"
            placeholder="Enter bill name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            // Standardized input style with primary focus color
            className="w-full border border-gray-300 rounded-lg p-2 bg-white text-[#4b2e19] focus:outline-none focus:ring-2 focus:ring-[#c14564]"
          />
        </div>

        {/* Address Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            🏠 Address (optional)
          </label>{" "}
          <input
            type="text"
            placeholder="Enter address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            // Standardized input style with primary focus color
            className="w-full border border-gray-300 rounded-lg p-2 bg-white text-[#4b2e19] focus:outline-none focus:ring-2 focus:ring-[#c14564]"
          />
        </div>

        {/* Bill Type Select */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ⚙️ Bill Type
          </label>{" "}
          <select
            value={type}
            onChange={(e) => setType(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg p-2 bg-white text-[#4b2e19] focus:outline-none focus:ring-2 focus:ring-[#c14564]"
          >
            <option value={MoneyBillType.NORMAL}>
              💰 Normal (Share expenses)
            </option>
            <option value={MoneyBillType.FOOD}>
              🍱 Food (Scan/Split items)
            </option>
          </select>
        </div>

        {/* Create Button */}
        <div className="flex justify-center">
          <button
            className="w-full py-2.5 rounded-lg bg-[#c14564] text-white font-semibold shadow-md hover:bg-[#a63b55] transition active:scale-[0.98]"
            onClick={handleCreate}
          >
            Create
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={alertModal.isOpen}
        text={alertModal.message}
        isAlertMode={true}
        onClose={() => setAlertModal({ isOpen: false, message: "" })}
        onConfirm={() => setAlertModal({ isOpen: false, message: "" })}
      />
      {/* Animation Styles */}
      <style>{`
            @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
            }
            .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
        `}</style>
    </div>
  );
}
