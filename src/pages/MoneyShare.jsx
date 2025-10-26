/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import "../styles/MoneyShare.css";
import { exportToPDF } from "../services/pdf-export.service";
import { MoneyBillType } from "../services/money-bill.service";
import { MoneyBill } from "../services/money-bill.service";
import { useNavigate, useParams } from "react-router-dom";
import { cameraService } from "../services/camera.service";
import { useLogger } from "../services/logger/useLogger";
import { sleep } from "../utils/helpers";
import ConfirmModal from "../components/modals/ConfirmModal.jsx";

// Component
import AddExpensePopup from "../components/modals/AddExpensePopup.jsx";
import SubBillCreatorModal from "../components/modals/SubBillCreatorModal.jsx";

export default function MoneyShare() {
  const logger = useLogger("MoneySharePage");
  const navigate = useNavigate();
  const { id } = useParams();

  // === State chính ===
  const [bill, setBill] = useState(null); // Bắt đầu là null
  const [isLoading, setIsLoading] = useState(true); // Bắt đầu loading

  // === State cho UI ===
  const [balances, setBalances] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [tempName, setTempName] = useState("");
  const [isScanning, setIsScanning] = useState(false); // Dành cho scan FOOD mode

  // === State cho Form Save (lưu bill cha) ===
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [billName, setBillName] = useState("");
  const [billAddress, setBillAddress] = useState("");

  // === State quản lý Sub-Bill & Modals ===
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSubBillCreator, setShowSubBillCreator] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null); // Lưu data từ sub-bill
  // === flag for back btn ===
  const [savedParentBillId, setSavedParentBillId] = useState("");
  // alert modal
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    message: "",
    isAlertModal: true,
    onConfirm: null,
  });
  // ⚡ Load bill (Luồng chính)
  useEffect(() => {
    const loadBill = async () => {
      if (!id) {
        logger.warn("MoneyShare accessed without ID. Redirecting.");
        navigate("/bill-records");
        return;
      }
      setIsLoading(true);
      try {
        const billService = new MoneyBill();
        const loaded = await billService.getMoneyBill(id);
        if (!loaded) {
          setAlertModal({
            isOpen: true,
            message: "⚠️ Bill not found!",
          });
          navigate("/bill-records");
          return;
        }
        setBill(new MoneyBill(loaded));
        setBillName(loaded.name || "");
        setBillAddress(loaded.address || "");
        logger.info("✅ Bill loaded:", loaded);
      } catch (err) {
        console.error("❌ Load failed:", err);
        setAlertModal({
          isOpen: true,
          message: "⚠️ Failed to load bill!",
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadBill();
  }, [id, navigate, logger]);

  // 🔍 Scan Bill (CHỈ DÀNH CHO FOOD MODE - thay thế toàn bộ bill)
  const handleScanBill = async () => {
    if (bill.type !== MoneyBillType.FOOD) return;
    try {
      const base64Url = await cameraService.selectOrCaptureImage();
      if (!base64Url) return;
      setIsScanning(true);
      const response = await bill.decodeBillInfo(base64Url);
      logger.info("🧾 API Response (FOOD Mode):", response);
      if (response && response.totalAmount) delete response.totalAmount;
      const parsedBill = new MoneyBill({
        ...bill, // Giữ lại ID, Name, Address
        ...response, // Ghi đè expenses, actualTotal, v.v.
        type: MoneyBillType.FOOD,
      });
      setBill(parsedBill);
    } catch (err) {
      logger.error("❌ Scan error:", err);
      setAlertModal({
        isOpen: true,
        message: "⚠️ Failed to scan or decode bill!",
      });
    } finally {
      setIsScanning(false);
    }
  };

  // ➕ Add participant (NORMAL mode)
  const addPerson = () => {
    if (!tempName.trim()) return;
    if (bill.participants?.includes(tempName))
      return setAlertModal({
        isOpen: true,
        message: "⚠️ Name is already exist!",
      });

    setBill(
      new MoneyBill({
        ...bill,
        participants: [...(bill.participants ?? []), tempName],
      })
    );
    setTempName("");
  };

  const removePerson = (p) => {
    setAlertModal({
      isOpen: true,
      message: "Are you sure you want to delete this person?",
      isAlertModal: false,
      onClose: () => setAlertModal({ isOpen: false, message: "" }),
      onConfirm: () => {
        setBill(
          new MoneyBill({
            ...bill,
            participants: bill.participants?.filter((x) => x !== p),
            expenses: bill.expenses.filter((e) => e.paidBy !== p),
          })
        );
        setAlertModal({ isOpen: false, message: "" });
      },
    });
  };

  const removeExpense = (i, subBillId) => {
    setAlertModal({
      isOpen: true,
      message: "Are you sure you want to delete this expense?",
      isAlertModal: false,
      onClose: () => setAlertModal({ isOpen: false, message: "" }),
      onConfirm: () => {
        const newExp = [...bill.expenses];
        newExp.splice(i, 1);
        setBill(new MoneyBill({ ...bill, expenses: newExp }));
        if (subBillId) {
          // remove in storage
          bill.deleteMoneyBill(subBillId);
          logger.info("✅ Sub-bill deleted with ID:", subBillId);
        }
        setAlertModal({ isOpen: false, message: "" })
      },
    });
  };

  // ⚙️ Calculate
  const calculateBalances = () => {
    try {
      // Dùng hàm gốc (NORMAL mode) hay hàm mới (FOOD mode)
      const result =
        bill.type === MoneyBillType.FOOD && bill.actualTotal
          ? bill.calculateBalancesByRealPayment()
          : bill.calculateBalances(); // Hàm gốc cho NORMAL
      setBalances(result);
      setShowPopup(true);
    } catch (err) {
      setAlertModal({
        isOpen: true,
        message: err.message,
      });
    }
  };

  // 💾 Save (Lưu/Cập nhật bill CHÍNH)
  const handleSaveResult = async () => {
    try {
      const billToSave = new MoneyBill({
        ...bill,
        name: billName.trim(),
        address: billAddress.trim(),
      });
      await bill.saveMoneyBill(billToSave);
      navigate("/bill-records");
    } catch (error) {
      console.error("❌ Save failed:", error);
      setAlertModal({
        isOpen: true,
        message: "⚠️ Failed to save record!",
      });
    }
  };

  // 📋 Copy
  const handleCopyResult = () => {
    const text = Object.entries(balances)
      .map(([key, val]) =>
        bill.type === MoneyBillType.FOOD
          ? `${key}: ${val.toLocaleString()} ₫`
          : val > 0
          ? `${key}: Receive (+${val.toLocaleString()} ₫)`
          : val < 0
          ? `${key}: Pay (-${Math.abs(val).toLocaleString()} ₫)`
          : `${key}: Nothing todo`
      )
      .join("\n");

    const summary = `💸 Bill Split Result\nMode: ${
      bill.type === 1 ? "Normal" : "Food"
    }\nTotal: ${bill.totalAfterDiscount.toLocaleString()} ₫\n${text}`;
    navigator.clipboard.writeText(summary);
    setAlertModal({
      isOpen: true,
      message: "📋 Result copied",
    });
  };

  const handleExportPDF = () => {
    exportToPDF(bill, balances);
  };

  // === Quản lý luồng Sub-Bill ===

  // 1. Mở popup Thêm Chi Tiêu
  const handleAddExpense = () => {
    if (
      bill.type === MoneyBillType.NORMAL &&
      (!bill.participants || bill.participants.length === 0)
    ) {
      setAlertModal({
        isOpen: true,
        message:
          "⚠️ Please add at least one participant before adding an expense.",
      });
      return;
    }
    setExpenseToEdit(null); // Mở ở chế độ "thêm mới"
    setShowAddExpense(true);
  };

  // 2. Bắt đầu tạo Sub-Bill (từ AddExpensePopup)
  const handleStartSubBill = () => {
    setShowAddExpense(false); // Đóng modal 1
    setShowSubBillCreator(true); // Mở modal 2 (tạo bill con)
  };

  // 3. Sub-Bill đã được tạo (từ SubBillCreatorModal)
  const handleSubBillCreated = (savedSubBill) => {
    setShowSubBillCreator(false); // Đóng modal 2

    // Chuẩn bị data cho modal 1
    setExpenseToEdit({
      name: savedSubBill.name,
      amount: savedSubBill.actualTotal || savedSubBill.totalAfterDiscount,
      subBillId: savedSubBill.id,
      isSubBill: true, // Đánh dấu đây là bill con
    });

    setShowAddExpense(true); // Mở lại modal 1
  };

  // 4. Lưu chi tiêu (từ AddExpensePopup)
  const handleSaveExpense = (expense) => {
    const billToSave = new MoneyBill({
      ...bill,
      expenses: [...bill.expenses, expense],
    });
    setBill(billToSave);
    // auto update bill in storage every time add expense
    bill.saveMoneyBill(billToSave, false);
    setShowAddExpense(false);
    setExpenseToEdit(null);
  };

  const handleClickTableRow = (subBillId) => {
    if (subBillId) {
      console.log("saved parent bill id:", id);
      setSavedParentBillId(id);
      navigate(`/money-share/${subBillId}`);
    }
  };

  const handleBackButton = () => {
    console.log("handleBackButton -> saved parent bill id:", id);
    if (savedParentBillId) {
      navigate(`/money-share/${savedParentBillId}`);
      setSavedParentBillId("");
      return;
    }
    navigate("/bill-records");
  };

  // === Loading Guard ===
  if (isLoading || !bill) {
    return (
      <div className="app-content-padding text-center py-10">
        <p className="text-gray-500 animate-pulse">Loading bill...</p>
      </div>
    );
  }

  // === Render ===
  return (
    <div className="app-content-padding">
      {/* <div style={{ fontSize: "14px" }}>
        <ModeTabs
          disabled={true}
          onChange={() => {}}
        />
      </div> */}

      {/* 🧾 Header section */}
      <div className="header-bar mt-3">
        <button
          onClick={handleBackButton}
          className="bg-[#c14564] text-white px-3 py-2 rounded-full shadow-md hover:bg-[#a83853] transition z-50"
        >
          ←
        </button>
        <button className="calc-btn" onClick={calculateBalances}>
          Calculate
        </button>
      </div>
      <h1 className="text-2xl font-semibold mb-4 text-center color-primary">
        {bill?.name ? bill.name : "Share Bill"}
      </h1>

      {/* Nút Scan (chỉ cho FOOD mode) */}
      <div>
        {bill.type === MoneyBillType.FOOD && (
          <button
            onClick={handleScanBill}
            disabled={isScanning}
            className={`px-2 py-2 font-medium text-white shadow-sm bg-[#ff8f28] rounded-xl`}
          >
            {isScanning ? "🔍 Scanning..." : "🔍 Scan Bill AI"}
          </button>
        )}
      </div>

      {/* Participants (chỉ cho NORMAL mode) */}
      {bill.type === MoneyBillType.NORMAL && (
        <div className="section">
          <h2>👥 Participants</h2>
          <div className="input-group mb-3">
            <input
              type="text"
              placeholder="Enter name"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
            />
            <button className="circle-btn" onClick={addPerson}>
              +
            </button>
          </div>
          {!bill?.participants?.length && (
            <p className="text-sm text-gray-500 text-italic">
              No participants added yet. Please add at least one before creating
              an expense.
            </p>
          )}
          <ul className="people-list">
            {bill.participants?.map((p, i) => (
              <li key={i}>
                {p}
                <button onClick={() => removePerson(p)}>✕</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Expenses (cho cả 2 mode) */}
      <div className="section">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-[#4b2e19]">💰 Expenses</h2>
          <button
            className="circle-btn flex items-center"
            onClick={handleAddExpense} // <-- Luôn mở AddExpensePopup
          >
            +
          </button>
        </div>
        {!bill.expenses?.length && (
          <p className="text-sm text-gray-500 text-italic">
            {bill.type === MoneyBillType.FOOD
              ? "No expenses added yet. You can add them manually using the + button or automatically by scanning a real bill with AI."
              : "No expenses added yet. You can add them manually using the + button"}
          </p>
        )}
        {bill.expenses.length > 0 && (
          <table className="expense-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Amount</th>
                {bill.type === MoneyBillType.FOOD && <th>Qty</th>}
                {bill.type === MoneyBillType.NORMAL && <th>Payer</th>}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {bill.expenses.map((e, i) => (
                <tr key={i}>
                  {/* Cột Tên */}
                  <td onClick={() => handleClickTableRow(e.subBillId)}>
                    {e.subBillId ? (
                      <span className="font-semibold"> {e.name}</span>
                    ) : (
                      e.name
                    )}
                    <br />
                    {e.createdAt ? new Date(e.createdAt).toLocaleString() : ""}
                  </td>

                  <td onClick={() => handleClickTableRow(e.subBillId)}>
                    {e.amount.toLocaleString()}
                  </td>

                  {bill.type === MoneyBillType.FOOD && (
                    <td onClick={() => handleClickTableRow(e.subBillId)}>
                      {e.quantity || 1}
                    </td>
                  )}

                  {bill.type === MoneyBillType.NORMAL && (
                    <td onClick={() => handleClickTableRow(e.subBillId)}>
                      {e.subBillId ? (
                        <span className="font-semibold">{e.paidBy}</span>
                      ) : (
                        e.paidBy
                      )}
                    </td>
                  )}
                  <td>
                    <button onClick={() => removeExpense(i, e.subBillId)}>
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Food Options (chỉ cho FOOD mode) */}
      {bill.type === MoneyBillType.FOOD && (
        <div className="section p-4 rounded-xl bg-[#fff8f6]">
          {/* ... (Inputs: Real Payment, Discount, Ship Fee) ... */}
          <h2 className="text-lg font-semibold mb-3">
            Adding bill info (optional)
          </h2>
          <div className="extra-inputs space-y-3">
            <div className="flex justify-between items-center">
              <span className="w-1/3 text-gray-700 font-medium">
                Real Payment
              </span>
              <input
                className="w-2/3 border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-rose-300"
                type="number"
                placeholder="Real payment amount"
                value={bill.actualTotal || ""}
                onChange={(e) =>
                  setBill(
                    new MoneyBill({
                      ...bill,
                      actualTotal: Number(e.target.value),
                    })
                  )
                }
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="w-1/3 text-gray-700 font-medium">Discount</span>
              <input
                className="w-2/3 border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-rose-300"
                type="number"
                placeholder="Discount amount"
                value={bill.discountAmount || ""}
                onChange={(e) =>
                  setBill(
                    new MoneyBill({
                      ...bill,
                      discountAmount: Number(e.target.value),
                    })
                  )
                }
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="w-1/3 text-gray-700 font-medium">Ship Fee</span>
              <input
                className="w-2/3 border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-rose-300"
                type="number"
                placeholder="Ship amount"
                value={bill.shipAmount || ""}
                onChange={(e) =>
                  setBill(
                    new MoneyBill({
                      ...bill,
                      shipAmount: Number(e.target.value),
                    })
                  )
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Summary (cho cả 2 mode) */}
      {bill.expenses?.length > 0 && (
        <div className="summary">
          {bill.type === MoneyBillType.FOOD && (
            <p>
              <strong>Total:</strong> {bill.totalAmountAll.toLocaleString()} ₫
            </p>
          )}
          <p>
            <strong>Total After Discount:</strong>{" "}
            {bill.totalAfterDiscount.toLocaleString()} ₫
          </p>
          {bill.type === MoneyBillType.NORMAL && (
            <p>
              <strong>Average per person:</strong>{" "}
              {bill.averageAmount?.toLocaleString()} ₫
            </p>
          )}
        </div>
      )}

      {/* Popup Add Expense */}
      {showAddExpense && (
        <AddExpensePopup
          type={bill.type}
          participants={bill.participants}
          expenseData={expenseToEdit} // <-- Prop mới
          onClose={() => {
            setShowAddExpense(false);
            setExpenseToEdit(null); // <-- Reset
          }}
          onSave={handleSaveExpense} // <-- Hàm mới
          onAddSubBill={handleStartSubBill} // <-- Hàm mới
        />
      )}

      {/* Modal tạo Sub-Bill*/}
      <SubBillCreatorModal
        isOpen={showSubBillCreator}
        onClose={() => setShowSubBillCreator(false)}
        onSave={handleSubBillCreated}
        logger={logger}
      />

      {/* Popup Result */}
      {/* Popup: Result Display */}
      {showPopup && (
        <div
          // Overlay - Kept original styles
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 backdrop-blur-sm" // Added backdrop-blur-sm for visual enhancement
          onClick={() => setShowPopup(false)} // Close on overlay click
        >
          <div
            // Modal Container - White background, rounded corners, shadow
            className="relative bg-white rounded-xl shadow-lg p-6 w-full max-w-sm mx-4 text-[#4b2e19] animate-fadeIn" // Changed bg, max-w-sm, mx-4
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            {/* Close Button - Hover with primary color */}
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-3 right-3 text-gray-400 text-2xl hover:text-[#c14564] transition" // Changed color, size, hover effect
              aria-label="Close"
            >
              &times; {/* Using a standard 'times' character */}
            </button>

            <h3 className="text-xl font-bold mb-5 text-center text-[#c14564]">
              {" "}
              💸 Result 💸
            </h3>

            <ul className="space-y-2.5 mb-6 border-t border-b border-gray-200 py-4 max-h-[40vh] overflow-y-auto">
              {" "}
              {Object.entries(balances).map(([person, balance]) => (
                <li
                  key={person}
                  className="text-sm text-[#4b2e19] flex justify-between items-center"
                >
                  {" "}
                  {/* Kept text color, added flex */}
                  <strong>{person}</strong>
                  {/* Amount display with conditional coloring */}
                  <span
                    className={`font-medium ${
                      balance > 0
                        ? "text-green-600"
                        : balance < 0
                        ? "text-red-600"
                        : "text-gray-500"
                    }`}
                  >
                    {" "}
                    {/* Added text color based on value */}
                    {balance > 0
                      ? `Receive (+${balance.toLocaleString()} ₫)`
                      : balance < 0
                      ? `Pay (-${Math.abs(balance).toLocaleString()} ₫)`
                      : "Nothing todo"}{" "}
                  </span>
                </li>
              ))}
            </ul>

            {/* Action Buttons Container */}
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              {" "}
              {/* Save/Update Button - Primary background color */}
              <button
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#c14564] text-white font-semibold shadow-md hover:bg-[#a63b55] transition active:scale-[0.98]" // Adjusted padding, font-weight, shadow
                onClick={id ? handleSaveResult : () => setShowSaveForm(true)}
              >
                💾 {id ? "Update" : "Save"}
              </button>
              {/* Copy Button - Outlined style */}
              <button
                className="flex-1 px-4 py-2.5 rounded-lg border border-[#c14564] text-[#c14564] font-semibold hover:bg-[#c14564]/10 transition active:scale-[0.98]" // Changed to outlined style
                onClick={handleCopyResult}
              >
                📋 Copy
              </button>
              {/* Export PDF Button - Outlined style */}
              <button
                className="flex-1 px-4 py-2.5 rounded-lg border border-[#c14564] text-[#c14564] font-semibold hover:bg-[#c14564]/10 transition active:scale-[0.98]" // Changed to outlined style
                onClick={handleExportPDF}
              >
                📄 PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animation Styles (Kept original styles) */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
      `}</style>

      {/* Popup Save Form (Giữ nguyên, nhưng state `billName` đã được load) */}
      {showSaveForm && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          onClick={() => setShowSaveForm(false)}
        >
          <div
            className="relative bg-[#faf2e4] rounded-2xl shadow-lg p-6 w-96 max-w-[90%] text-[#5b4646] animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSaveForm(false)}
              className="absolute top-3 right-3 text-[#6b4f4f] text-xl hover:text-[#a17f7f] transition"
              aria-label="Close"
            >
              ✖
            </button>
            <h3 className="text-2xl font-semibold mb-5 text-center">
              💾 Update Bill
            </h3>
            {/* Input Tên bill */}
            <div className="mb-4">
              <label className="block text-sm mb-1">📌 Bill Name (*)</label>
              <input
                type="text"
                placeholder="Enter bill name"
                value={billName} // <-- Đã load từ state
                onChange={(e) => setBillName(e.target.value)}
                className="w-full border border-[#d6c6a8] rounded-lg p-2"
              />
            </div>
            {/* Input Địa chỉ */}
            <div className="mb-6">
              <label className="block text-sm mb-1">
                🏠 Address (optional)
              </label>
              <input
                type="text"
                placeholder="Enter address"
                value={billAddress} // <-- Đã load từ state
                onChange={(e) => setBillAddress(e.target.value)}
                className="w-full border border-[#d6c6a8] rounded-lg p-2"
              />
            </div>
            {/* Nút Save */}
            <div className="flex justify-center">
              <button
                className="px-6 py-2 rounded-xl bg-[#6b4f4f] text-white"
                onClick={async () => {
                  if (!billName.trim()) {
                    setAlertModal({
                      isOpen: true,
                      message: "⚠️ Bill name is required!",
                    });
                    return;
                  }
                  await handleSaveResult(); // <-- Gọi hàm save chính
                  setShowSaveForm(false);
                  setShowPopup(false);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={alertModal.isOpen}
        text={alertModal.message}
        isAlertMode={alertModal.isAlertMode}
        onClose={() => setAlertModal({ isOpen: false, message: "" })}
        onConfirm={alertModal.onConfirm ? alertModal.onConfirm : () => setAlertModal({ isOpen: false, message: "" })}
      />

      {isScanning && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-[9999]">
          <div className="w-12 h-12 border-4 border-t-transparent border-yellow-300 rounded-full animate-spin mb-3"></div>
          <p className="text-white font-medium text-lg tracking-wide animate-pulse">
            🔍 Scanning bill...
          </p>
        </div>
      )}
    </div>
  );
}
