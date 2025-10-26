import { useState, useEffect } from "react";
import { MoneyBillType } from "../../services/money-bill.service";

export default function AddExpensePopup({
  type,
  participants = [],
  onSave,
  onClose,
  expenseData, // <-- Prop mới: Dữ liệu từ sub-bill (nếu có)
  onAddSubBill, // <-- Prop mới: Hàm gọi để tạo sub-bill
}) {
  // === Sửa State ===
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(""); // <-- Bắt đầu rỗng
  const [quantity, setQuantity] = useState(1);
  const [subBillId, setSubBillId] = useState(null); // <-- State mới

  // Lấy thời gian hiện tại
  const now = new Date();
  const localISOTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  const [createdAt, setCreatedAt] = useState(localISOTime);

  // === Thêm useEffect ===
  // Điền dữ liệu nếu là từ sub-bill
  useEffect(() => {
    if (expenseData) {
      setName(expenseData.name || "");
      setAmount(expenseData.amount?.toString() || ""); // Chuyển sang string
      setSubBillId(expenseData.subBillId || null);
      setCreatedAt(expenseData.createdAt || localISOTime);
      // Payer sẽ để người dùng tự chọn
      setPaidBy(expenseData.paidBy || participants?.[0] || ""); // Hoặc lấy Payer mặc định nếu có
    } else {
      // Nếu không phải edit, đảm bảo state là rỗng/mặc định
      setName("");
      setAmount("");
      setSubBillId(null);
      setPaidBy(participants?.[0] || ""); // Payer mặc định
      setQuantity(1);
      setCreatedAt(localISOTime);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenseData, participants]); // Chạy khi expenseData thay đổi

  // Kiểm tra xem có phải đang chỉnh sửa từ sub-bill không
  const isFromSubBill = !!subBillId;

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
      subBillId: subBillId, // <-- Gửi kèm ID (nếu có)
      isSubBill: isFromSubBill, // <-- Đánh dấu nếu là bill con
    };
    console.log("Saving expense:", expense);
    onSave(expense);
    onClose(); // Đóng popup sau khi lưu
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="relative bg-[#fff9e8] rounded-t-3xl shadow-xl w-full max-w-md h-[90vh] p-6 text-[#4b2e19] animate-fadeInUp overflow-x-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[#c14564] text-2xl font-semibold hover:opacity-80 transition"
        >
          ✕
        </button>

        <h3 className="text-2xl font-semibold mb-4 text-center text-[#4b2e19]">
          {isFromSubBill ? "🧾 Confirm Sub-Bill" : "➕ Add Expense"}
        </h3>
        {type === MoneyBillType.NORMAL && !isFromSubBill && (
          <button
            onClick={onAddSubBill}
            className={`px-2 py-2 font-medium text-white shadow-sm bg-[#ff8f28] rounded-xl mb-3`}
          >
            🔍 Scan Bill AI / Add Sub-Bill
          </button>
        )}
        {/* === Form Inputs === */}
        <div className="space-y-3 overflow-y-auto pb-24 max-h-[calc(70vh-50px)]">
          {" "}
          {/* Thêm max-height */}
          <div>
            <label className="block text-medium mb-1"> Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter item or service name"
              className={`block w-full max-w-full border rounded-lg p-2 bg-[#fffaf2] focus:outline-none focus:ring-2 focus:ring-[#c14564] border-[#d6c6a8]`}
            />
          </div>
          <div>
            <label className="block text-medium mb-1">Amount (₫)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter price"
              disabled={isFromSubBill} // <-- Vô hiệu hóa nếu từ sub-bill
              className={`block w-full max-w-full border rounded-lg p-2 bg-[#fffaf2] focus:outline-none focus:ring-2 focus:ring-[#c14564] ${
                isFromSubBill
                  ? "border-gray-300 bg-gray-100 text-gray-500"
                  : "border-[#d6c6a8]"
              }`}
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
          {/* Luôn hiển thị Payer ở NORMAL mode */}
          {type === MoneyBillType.NORMAL && (
            <div>
              <label className="block text-medium mb-1">Payer (*)</label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="block w-full max-w-full border border-[#d6c6a8] rounded-lg p-2 bg-[#fffaf2] focus:outline-none focus:ring-2 focus:ring-[#c14564]"
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

        {/* Nút Save */}
        <div className="absolute bottom-6 left-0 right-0 px-6">
          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-2xl bg-[#c14564] text-white font-semibold shadow-md hover:bg-[#a63b55] transition active:scale-[0.98]"
          >
            {isFromSubBill ? "Confirm Expense" : "Save Expense"}
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
