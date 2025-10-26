// src/components/modals/AddNewBillModal.jsx
import React, { useState } from "react";
import { MoneyBillType } from "../../services/money-bill.service";

export default function AddNewBillModal({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [type, setType] = useState(MoneyBillType.NORMAL); // Mặc định là NORMAL

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!name.trim()) {
      alert("⚠️ Bill name is required!");
      return;
    }
    onCreate({
      name: name.trim(),
      address: address.trim(),
      type: type,
    });
    // Reset state sau khi tạo
    setName("");
    setAddress("");
    setType(MoneyBillType.NORMAL);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      onClick={onClose}
    >
      <div
        className="relative bg-[#faf2e4] rounded-2xl shadow-lg p-6 w-96 max-w-[90%] text-[#5b4646] animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[#6b4f4f] text-xl hover:text-[#a17f7f] transition"
          aria-label="Close"
        >
          ✖
        </button>

        <h3 className="text-2xl font-semibold mb-5 text-center">
          ✨ Create New Bill
        </h3>

        {/* Tên Bill */}
        <div className="mb-4">
          <label className="block text-sm mb-1">📌 Bill Name (*)</label>
          <input
            type="text"
            placeholder="Enter bill name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-[#d6c6a8] rounded-lg p-2 bg-[#fffaf2] text-[#4a3c3c] focus:outline-none focus:ring-2 focus:ring-[#c6a982]"
          />
        </div>

        {/* Địa chỉ */}
        <div className="mb-4">
          <label className="block text-sm mb-1">🏠 Address (optional)</label>
          <input
            type="text"
            placeholder="Enter address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border border-[#d6c6a8] rounded-lg p-2 bg-[#fffaf2] text-[#4a3c3c] focus:outline-none focus:ring-2 focus:ring-[#c6a982]"
          />
        </div>

        {/* Loại Bill */}
        <div className="mb-6">
          <label className="block text-sm mb-1">⚙️ Bill Type</label>
          <select
            value={type}
            onChange={(e) => setType(Number(e.target.value))}
            className="w-full border border-[#d6c6a8] rounded-lg p-2 bg-[#fffaf2] text-[#4a3c3c] focus:outline-none focus:ring-2 focus:ring-[#c6a982]"
          >
            <option value={MoneyBillType.NORMAL}>
              💰 Normal (Share expenses)
            </option>
            <option value={MoneyBillType.FOOD}>
              🍱 Food (Scan/Split items)
            </option>
          </select>
        </div>

        {/* Nút Tạo */}
        <div className="flex justify-center">
          <button
            className="px-6 py-2 rounded-xl bg-[#6b4f4f] text-white font-medium hover:bg-[#553939] transition"
            onClick={handleCreate}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
