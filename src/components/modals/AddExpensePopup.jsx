import { useState, useEffect } from "react";
import { MoneyBillType } from "../../services/money-bill.service";

/**
 * Centered modal popup for adding or editing an expense.
 * Handles different modes (add, confirm sub-bill) and types (NORMAL, FOOD).
 */
export default function AddExpensePopup({
  type,
  participants = [],
  onSave,
  onClose,
  expenseData, // <-- Data from sub-bill (if applicable)
  onAddSubBill, // <-- Function to call for creating a sub-bill
  // Props for edit/delete are removed as per the provided code
}) {
  // --- Component State ---
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(""); // Starts empty
  const [quantity, setQuantity] = useState(1);
  const [subBillId, setSubBillId] = useState(null); // Stores sub-bill ID

  // Default date/time setup
  const now = new Date();
  const localISOTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  const [createdAt, setCreatedAt] = useState(localISOTime);

  // --- Effect to pre-fill form based on expenseData ---
  useEffect(() => {
    if (expenseData) {
      // Pre-fill form if confirming a sub-bill
      setName(expenseData.name || "");
      setAmount(expenseData.amount?.toString() || ""); // Convert amount to string
      setSubBillId(expenseData.subBillId || null);
      setCreatedAt(expenseData.createdAt || localISOTime);
      // Set payer from data or default to first participant
      setPaidBy(expenseData.paidBy || (participants?.[0] || ""));
    } else {
      // Reset form for adding a new expense
      setName("");
      setAmount("");
      setSubBillId(null);
      setPaidBy(participants?.[0] || ""); // Default payer
      setQuantity(1);
      setCreatedAt(localISOTime);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenseData, participants]); // Rerun when data or participants change

  // --- Derived State ---
  const isFromSubBill = !!subBillId; // True if subBillId is present

  // --- Event Handlers ---

  /**
   * Handles the form submission (Save/Confirm button).
   * Validates input and calls the onSave callback.
   */
  const handleSubmit = () => {
    // Basic validation
    if (!name.trim() || !amount) {
      alert("⚠️ Please enter name and amount");
      return;
    }
    if (type === MoneyBillType.NORMAL && !paidBy) {
      alert("⚠️ Please select payer");
      return;
    }

    // Prepare expense object payload
    const expense = {
      name: name.trim(),
      amount: Number(amount),
      quantity: Number(quantity) || 1,
      paidBy: paidBy || undefined, // Set to undefined if empty
      createdAt: new Date(createdAt).toISOString(),
      subBillId: subBillId, // Include subBillId if it exists
      isSubBill: isFromSubBill, // Mark if this is a sub-bill summary
    };
    console.log("Saving expense:", expense);
    onSave(expense); // Call the onSave callback provided by the parent
    onClose(); // Close the popup after saving
  };

  // --- Render ---
  return (
    // Modal Overlay - Centered style
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm" // Centered items
      onClick={onClose}
    >
      {/* Modal Content - Centered style */}
      <div
        className="relative bg-white rounded-xl shadow-lg w-full max-w-sm p-6 text-[#4b2e19] animate-fadeIn mx-4" // White bg, rounded-xl, centered animation
        onClick={(e) => e.stopPropagation()}
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
          {/* Primary color, adjusted margin */}
          {isFromSubBill ? "🧾 Confirm Sub-Bill" : "➕ Add Expense"}
        </h3>
        {/* "Scan / Add Sub-Bill" Button (conditional) */}
        {type === MoneyBillType.NORMAL && !isFromSubBill && (
          <button
            onClick={onAddSubBill}
            className={`px-2 py-2 mb-5 mt-1 font-medium text-white shadow-sm bg-[#ff8f28] rounded-xl`}
          >
            🔍 Add By Scan Bill AI
          </button>
        )}
        {/* Form Inputs - Scrollable Area */}
        <div
          className="space-y-4 overflow-y-auto pb-4"
          style={{ maxHeight: "calc(70vh - 120px)" }}
        >
          {" "}
          {/* Adjusted max-height */}
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter item or service name"
              // Name input is NOT disabled when confirming sub-bill in this version
              className="block w-full border border-gray-300 rounded-lg p-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#c14564]"
            />
          </div>
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₫)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter price"
              disabled={isFromSubBill} // Amount IS disabled when confirming sub-bill
              className={`block w-full border rounded-lg p-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#c14564] ${
                isFromSubBill
                  ? "border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed" // Disabled style
                  : "border-gray-300" // Standard border
              }`}
            />
          </div>
          {/* Quantity Input (FOOD only) */}
          {type === MoneyBillType.FOOD && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="block w-full border border-gray-300 rounded-lg p-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#c14564]"
              />
            </div>
          )}
          {/* Payer Select (NORMAL only) */}
          {type === MoneyBillType.NORMAL && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payer (*)
              </label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="block w-full border border-gray-300 rounded-lg p-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#c14564]"
              >
                <option value="">-- Select payer --</option>
                {participants.map((p, i) => (
                  <option key={i} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          )}
          {/* Created At Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created At
            </label>
            <input
              type="datetime-local"
              value={createdAt}
              onChange={(e) => setCreatedAt(e.target.value)}
              className="block w-full border border-gray-300 rounded-lg p-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#c14564]"
            />
          </div>
        </div>{" "}
        {/* End of scrollable form inputs */}
        {/* Action Button */}
        <div className="mt-6 flex flex-col gap-2">
          {" "}
          {/* Added margin-top */}
          {/* Save/Confirm Button */}
          <button
            onClick={handleSubmit}
            className="w-full py-2.5 rounded-lg bg-[#c14564] text-white font-semibold shadow-md hover:bg-[#a63b55] transition active:scale-[0.98]"
          >
            {isFromSubBill ? "Confirm Expense" : "Save Expense"}
          </button>
        </div>
      </div>{" "}
      {/* End of modal content */}
      {/* Animation Styles - Centered FadeIn */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
        `}
      </style>
    </div> // End of modal overlay
  );
}