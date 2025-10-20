import { useState } from "react";
import { MoneyBillType } from "../services/money-bill.service";

export default function AddExpensePopup({
  type,
  participants = [],
  onSave,
  onClose,
}) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [quantity, setQuantity] = useState(1);
  const now = new Date();
  const localISOTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  const [createdAt, setCreatedAt] = useState(localISOTime);

  const handleSubmit = () => {
    if (!name.trim() || !amount) {
      alert("⚠️ Please enter name and amount");
      return;
    }
    if (type === MoneyBillType.NORMAL && !paidBy) {
      alert("⚠️ Please select payer");
      return;
    }

    const expense = {
      name: name.trim(),
      amount: Number(amount),
      quantity: Number(quantity) || 1,
      paidBy: paidBy || undefined,
      createdAt: new Date(createdAt).toISOString(),
    };
    console.log("Saving expense:", expense);
    onSave(expense);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="relative bg-[#fff9e8] rounded-t-3xl shadow-xl w-full max-w-md h-[90vh] p-6 text-[#4b2e19] animate-fadeInUp  overflow-x-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[#c14564] text-2xl font-semibold hover:opacity-80 transition"
        >
          ✕
        </button>

        <h3 className="text-2xl font-semibold mb-4 text-center text-[#4b2e19]">
          ➕ Add Expense
        </h3>

        <div className="space-y-3 overflow-y-auto pb-24 max-h-[70vh]">
          <div>
            <label className="block text-medium mb-1"> Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter item or service name"
              className="block w-full max-w-full border border-[#d6c6a8] rounded-lg p-2 bg-[#fffaf2] focus:outline-none focus:ring-2 focus:ring-[#c14564]"
            />
          </div>

          <div>
            <label className="block text-medium mb-1">Amount (₫)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter price"
              className="block w-full max-w-full border border-[#d6c6a8] rounded-lg p-2 bg-[#fffaf2] focus:outline-none focus:ring-2 focus:ring-[#c14564]"
            />
          </div>

          {type === MoneyBillType.FOOD && (
            <div>
              <label className="block text-medium mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="block w-full max-w-full border border-[#d6c6a8] rounded-lg p-2 bg-[#fffaf2] focus:outline-none focus:ring-2 focus:ring-[#c14564]"
              />
            </div>
          )}

          {type === MoneyBillType.NORMAL && (
            <div>
              <label className="block text-medium mb-1">Payer</label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="block w-full max-w-full border border-[#d6c6a8] rounded-lg p-2 bg-[#fffaf2] focus:outline-none focus:ring-2 focus:ring-[#c14564]"
              >
                <option value="">Select payer</option>
                {participants.map((p, i) => (
                  <option key={i} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-medium mb-1">Created At</label>
            <input
              type="datetime-local"
              value={createdAt}
              onChange={(e) => setCreatedAt(e.target.value)}
              className="block w-full max-w-full border border-[#d6c6a8] rounded-lg p-2 bg-[#fffaf2] focus:outline-none focus:ring-2 focus:ring-[#c14564]"
            />
          </div>
        </div>

        <div className="absolute bottom-6 left-0 right-0 px-6">
          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-2xl bg-[#c14564] text-white font-semibold shadow-md hover:bg-[#a63b55] transition active:scale-[0.98]"
          >
            Save Expense
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(100%);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeInUp {
            animation: fadeInUp 0.35s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
}
