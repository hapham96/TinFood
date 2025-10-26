import React, { useState } from "react";
import { MoneyBill, MoneyBillType } from "../../services/money-bill.service";
import AddExpensePopup from "./AddExpensePopup";
import { cameraService } from "../../services/camera.service";

export default function SubBillCreatorModal({
  isOpen,
  onClose,
  onSave,
  logger,
}) {
  const [subBill, setSubBill] = useState(
    new MoneyBill({ type: MoneyBillType.FOOD })
  );
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const handleScanBill = async () => {
    try {
      const base64Url = await cameraService.selectOrCaptureImage();
      if (!base64Url) return;
      setIsScanning(true);
      const response = await subBill.decodeBillInfo(base64Url);
      if (response && response.totalAmount) delete response.totalAmount;
      const parsedBill = new MoneyBill({
        ...response,
        type: MoneyBillType.FOOD,
      });
      setSubBill(parsedBill); // Cập nhật state nội bộ
    } catch (err) {
      logger.error("❌ Scan error:", err);
      alert("Failed to scan or decode bill!");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveSubBill = async () => {
    if (!subBill.expenses.length) {
      alert("Sub-bill has no expenses!");
      return;
    }

    const billToSave = new MoneyBill({
      ...subBill,
      name: subBill.name || `Sub-Bill Food`,
      createdAt: new Date().toISOString(),
    });

    try {
      // Tự động lưu (không alert)
      const savedSubBill = await subBill.saveSubBill(billToSave);
      logger.info("✅ Sub-bill saved with ID:", savedSubBill.id);
      onSave(savedSubBill); // Trả bill đã lưu về MoneyShare
      handleClose();
    } catch (error) {
      logger.error("❌ Failed to save sub-bill:", error);
      alert("Failed to save sub-bill!");
    }
  };

  const handleClose = () => {
    // Reset state trước khi đóng
    setSubBill(new MoneyBill({ type: MoneyBillType.FOOD }));
    onClose();
  };

  const removeExpense = (i) => {
    const newExp = [...subBill.expenses];
    newExp.splice(i, 1);
    setSubBill(new MoneyBill({ ...subBill, expenses: newExp }));
  };

  if (!isOpen) return null;

  return (
    // Đây là một modal full-screen
    <div
      className="fixed inset-0 bg-[#faf2e4] z-[60] p-4 flex flex-col overflow-y-auto"
      style={{
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)",
      }}
    >
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold color-primary">
          Create Sub-Bill (Food Mode)
        </h2>
        <button onClick={handleClose} className="text-2xl text-red-500">
          ✖
        </button>
      </div>

      {/* Nút Scan và Thêm tay */}
      <div className="flex-shrink-0 flex gap-4 mb-4">
        <button
          onClick={handleScanBill}
          disabled={isScanning}
          className={`px-2 py-2 font-medium text-white shadow-sm bg-[#ff8f28] rounded-xl`}
        >
          {isScanning ? "🔍 Scanning..." : "🔍 Scan Bill AI"}
        </button>
        <button
          onClick={() => setShowAddExpense(true)}
          className="px-4 py-2 bg-[#2a8841] text-white rounded-lg shadow"
        >
          + Add Manually
        </button>
      </div>

      {/* Danh sách Expenses (của bill con) */}
      <div className="flex-1 overflow-y-auto bg-[#fff8f6] rounded-lg p-2 mb-4">
        <table className="expense-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Amount</th>
              <th>Qty</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {subBill.expenses.map((e, i) => (
              <tr key={i}>
                <td>
                  {e.name} <br />
                  {e.createdAt ? new Date(e.createdAt).toLocaleString() : ""}
                </td>
                <td>{e.amount.toLocaleString()}</td>
                <td>{e.quantity || 1}</td>
                <td>
                  <button onClick={() => removeExpense(i)}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {subBill.expenses.length === 0 && (
          <p className="text-center text-gray-500 p-4">
            No expenses added yet.
          </p>
        )}
      </div>

      {/* Thông tin thêm (của bill con) */}
      <div className="flex-shrink-0 section p-4 rounded-xl bg-[#fff8f6] space-y-3 mb-4">
        {/* Input Real Payment */}
        <div className="flex justify-between items-center">
          <span className="w-1/3 text-gray-700 font-medium">Real Payment</span>
          <input
            className="w-2/3 border border-gray-300 rounded-lg px-3 py-1"
            type="number"
            placeholder="Real payment amount"
            value={subBill.actualTotal || ""}
            onChange={(e) =>
              setSubBill(
                new MoneyBill({
                  ...subBill,
                  actualTotal: Number(e.target.value),
                })
              )
            }
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="w-1/3 text-gray-700 font-medium">Discount</span>
          <input
            className="w-2/3 border border-gray-300 rounded-lg px-3 py-1"
            type="number"
            placeholder="Discount amount"
            value={subBill.discountAmount || ""}
            onChange={(e) =>
              setSubBill(
                new MoneyBill({
                  ...subBill,
                  discountAmount: Number(e.target.value),
                })
              )
            }
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="w-1/3 text-gray-700 font-medium">Ship Fee</span>
          <input
            className="w-2/3 border border-gray-300 rounded-lg px-3 py-1"
            type="number"
            placeholder="Ship Fee amount"
            value={subBill.shipAmount || ""}
            onChange={(e) =>
              setSubBill(
                new MoneyBill({
                  ...subBill,
                  shipAmount: Number(e.target.value),
                })
              )
            }
          />
        </div>

        <p>
          <strong>Total:</strong> {subBill.totalAfterDiscount.toLocaleString()}{" "}
          ₫
        </p>
      </div>

      {/* Nút Save chính */}
      <button
        onClick={handleSaveSubBill}
        className="w-full px-6 py-3 rounded-xl bg-[#c14564] text-white font-medium text-lg hover:bg-[#553939] transition"
      >
        Save Sub-Bill
      </button>

      {/* Popup Thêm Chi Tiêu (cho bill con) */}
      {showAddExpense && (
        <AddExpensePopup
          type={MoneyBillType.FOOD} // Luôn là FOOD
          participants={[]} // Không cần participants
          onClose={() => setShowAddExpense(false)}
          onSave={(expense) =>
            setSubBill(
              new MoneyBill({
                ...subBill,
                expenses: [...subBill.expenses, expense],
              })
            )
          }
        />
      )}

      {isScanning && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-[9999]">
          <div className="w-12 h-12 border-4 border-t-transparent border-yellow-300 rounded-full animate-spin mb-3"></div>
          <p className="text-white font-medium text-lg">Scanning...</p>
        </div>
      )}
    </div>
  );
}
