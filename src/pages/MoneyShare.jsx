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
import ModeTabs from "../components/ModeTabs.jsx";
import AddExpensePopup from "./AddExpensePopup.jsx";
import { CiCalculator1 } from "react-icons/ci";

export default function MoneyShare() {
  const logger = useLogger("MoneySharePage");
  const navigate = useNavigate();
  const { id } = useParams();
  const [bill, setBill] = useState(
    () => new MoneyBill({ type: MoneyBillType.NORMAL })
  );
  const [balances, setBalances] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [tempName, setTempName] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [billName, setBillName] = useState("");
  const [billAddress, setBillAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const handleScanBill = async () => {
    try {
      const base64Url = await cameraService.selectOrCaptureImage();
      if (!base64Url) return;
      setIsScanning(true);
      logger.info("Get Image (base64):", base64Url);
      const response = await bill.decodeBillInfo(base64Url); //   send base64 to API decode
      // await sleep(5000); // simulate delay
      // const response = {"expenses":[{"name":"Japchae","amount":58000,"quantity":1},{"name":"Lẩu Kimchi CN","amount":65000,"quantity":1},{"name":"Lẩu Kimchi Heo","amount":65000,"quantity":1},{"name":"Gà rán C.N2","amount":75000,"quantity":1},{"name":"Nudu Kiribati","amount":49000,"quantity":1},{"name":"3 Phomai viên+Pepsi","amount":39000,"quantity":1},{"name":"Pepsi","amount":30000,"quantity":2}],"discountAmount":0,"shipAmount":0,"actualTotal":381000,"totalAmount":381000}
      logger.info("🧾 API Response:", response);
      if (response && response.totalAmount) delete response.totalAmount;
      const parsedBill = new MoneyBill({
        ...response,
        type: MoneyBillType.FOOD,
      });
      logger.info("Parsed Bill from OCR:", parsedBill);
      if (parsedBill) {
        setBill(parsedBill);
      }
      // setConfirmData(parsedBill); // TODO: if need a confirm data step
    } catch (err) {
      logger.error("❌ Scan error:", err);
      alert("Failed to scan or decode bill!");
    } finally {
      setIsScanning(false);
    }
  };

  const handleConfirmSave = async () => {
    if (!confirmData) return;
    const bill = new MoneyBill(confirmData);
    setBill(bill);
    setConfirmData(null);
  };

  // ⚡ Load bill
  useEffect(() => {
    const loadBill = async () => {
      if (!id) return;
      try {
        const loaded = await bill.getMoneyBill(id);
        if (!loaded) {
          alert("⚠️ Bill not found!");
          navigate("/bill-records");
          return;
        }
        setBill(new MoneyBill(loaded));
      } catch (err) {
        console.error("❌ Load failed:", err);
        alert("Failed to load bill.");
      } finally {
        setIsLoading(false);
      }
    };
    loadBill();
  }, [id]);

  // ➕ Add participant
  const addPerson = () => {
    if (!tempName.trim()) return;
    if (bill.participants?.includes(tempName))
      return alert("Name already exists");

    setBill(
      new MoneyBill({
        ...bill,
        participants: [...(bill.participants ?? []), tempName],
      })
    );
    setTempName("");
  };

  const removePerson = (p) => {
    setBill(
      new MoneyBill({
        ...bill,
        participants: bill.participants?.filter((x) => x !== p),
        expenses: bill.expenses.filter((e) => e.paidBy !== p),
      })
    );
  };

  const removeExpense = (i) => {
    const newExp = [...bill.expenses];
    newExp.splice(i, 1);
    setBill(new MoneyBill({ ...bill, expenses: newExp }));
  };

  // ⚙️ Calculate
  const calculateBalances = () => {
    try {
      const result = bill.calculateBalancesByRealPayment();
      setBalances(result);
      setShowPopup(true);
    } catch (err) {
      alert(err.message);
    }
  };

  // 💾 Save
  const handleSaveResult = async () => {
    try {
      await bill.saveMoneyBill(bill);
      navigate("/bill-records");
    } catch (error) {
      console.error("❌ Save failed:", error);
      alert("Failed to save record!");
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
    alert("📋 Result copied!");
  };

  const handleAddExpense = () => {
    if (
      bill.type === MoneyBillType.NORMAL &&
      (!bill.participants || bill.participants.length === 0)
    ) {
      return alert(
        "⚠️ Please add at least one participant before adding an expense."
      );
    }
    setShowAddExpense(true);
  };

  const handleExportPDF = () => {
    exportToPDF(bill, balances);
  };

  return (
    <div className="app-content-padding">
      <div style={{ fontSize: "14px" }}>
        <ModeTabs
          disabled={!!id}
          value={bill.type}
          onChange={(mode) => setBill(new MoneyBill({ ...bill, type: mode }))}
        />
      </div>

      {/* 🧾 Header section */}
      <div className="header-bar mt-3">
        <button
          onClick={() => navigate("/bill-records")}
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
      <div>
        {bill.type === MoneyBillType.FOOD && !id && (
          <button
            onClick={handleScanBill}
            disabled={isScanning}
            className={`px-2 py-2 font-medium text-indigo-900 shadow-sm transition rounded-xl`}
          >
            {isScanning ? "🔍 Scanning..." : "🔍 Scan Bill AI"}
          </button>
        )}
      </div>
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
            {bill?.participants?.map((p, i) => (
              <li key={i}>
                {p}
                <button onClick={() => removePerson(p)}>✕</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="section">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-[#4b2e19]">💰 Expenses</h2>
          <button
            className="circle-btn flex items-center"
            onClick={handleAddExpense}
          >
            +
          </button>
        </div>
        {!bill?.expenses?.length && (
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
                  <td>
                    {e.name} <br />
                    {e.createdAt ? new Date(e.createdAt).toLocaleString() : ""}
                  </td>
                  <td>{e.amount.toLocaleString()}</td>
                  {bill.type === MoneyBillType.FOOD && (
                    <td>{e.quantity || 1}</td>
                  )}
                  {bill.type === MoneyBillType.NORMAL && <td>{e.paidBy}</td>}
                  <td>
                    <button onClick={() => removeExpense(i)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {bill.type === MoneyBillType.FOOD && (
        <div className="section p-4 rounded-xl bg-[#fff8f6]">
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
          onClose={() => setShowAddExpense(false)}
          onSave={(expense) =>
            setBill(
              new MoneyBill({
                ...bill,
                expenses: [...bill.expenses, expense],
              })
            )
          }
        />
      )}

      {showPopup && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="relative bg-[#faf2e4] rounded-2xl shadow-lg p-6 w-96 max-w-[90%] text-[#5b4646] animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-3 right-3 text-[#6b4f4f] text-xl hover:text-[#a17f7f] transition"
              aria-label="Close"
            >
              ✖
            </button>

            <h3 className="text-2xl font-semibold mb-4 text-center">
              💸 Result
            </h3>

            <ul className="space-y-2 mb-6">
              {Object.entries(balances).map(([person, balance]) => (
                <li key={person} className="text-sm text-[#4a3c3c]">
                  {bill.type === MoneyBillType.FOOD ? (
                    <>
                      <strong>{person}</strong> — {balance.toLocaleString()} ₫
                    </>
                  ) : (
                    <>
                      <strong>{person}</strong> —{" "}
                      {balance > 0
                        ? `Receive (+${balance.toLocaleString()} ₫)`
                        : balance < 0
                        ? `Pay (-${Math.abs(balance).toLocaleString()} ₫)`
                        : "Nothing todo"}
                    </>
                  )}
                </li>
              ))}
            </ul>

            <div className="flex justify-center gap-3">
              <button
                className="px-4 py-2 rounded-xl bg-[#6b4f4f] text-white hover:bg-[#553939] transition"
                onClick={id ? handleSaveResult : () => setShowSaveForm(true)}
              >
                💾 {id ? "Update" : "Save"}
              </button>

              <button
                className="px-4 py-2 rounded-xl bg-[#d1b89b] text-[#4a3c3c] hover:bg-[#c5a982] transition"
                onClick={handleCopyResult}
              >
                📋 Copy
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-[#88a8d8] text-white hover:bg-[#6c8dc4] transition"
                onClick={handleExportPDF}
              >
                📄 Export PDF
              </button>
            </div>
          </div>
        </div>
      )}

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
              💾 Save Bill
            </h3>

            {/* Nhập tên bill */}
            <div className="mb-4">
              <label className="block text-sm mb-1">📌 Bill Name (*)</label>
              <input
                type="text"
                placeholder="Enter bill name"
                value={billName}
                onChange={(e) => setBillName(e.target.value)}
                className="w-full border border-[#d6c6a8] rounded-lg p-2 bg-[#fffaf2] text-[#4a3c3c] focus:outline-none focus:ring-2 focus:ring-[#c6a982]"
              />
            </div>

            {/* Nhập địa chỉ */}
            <div className="mb-6">
              <label className="block text-sm mb-1">
                🏠 Address (optional)
              </label>
              <input
                type="text"
                placeholder="Enter address"
                value={billAddress}
                onChange={(e) => setBillAddress(e.target.value)}
                className="w-full border border-[#d6c6a8] rounded-lg p-2 bg-[#fffaf2] text-[#4a3c3c] focus:outline-none focus:ring-2 focus:ring-[#c6a982]"
              />
            </div>

            <div className="flex justify-center">
              <button
                className="px-6 py-2 rounded-xl bg-[#6b4f4f] text-white font-medium hover:bg-[#553939] transition"
                onClick={async () => {
                  if (!billName.trim()) {
                    alert("⚠️ Bill name is required!");
                    return;
                  }

                  try {
                    const updatedBillData = new MoneyBill({
                      ...bill,
                      name: billName.trim(),
                      address: billAddress.trim(),
                    });

                    await updatedBillData.saveMoneyBill(updatedBillData);

                    // reset state after save then navigate to history page
                    setShowSaveForm(false);
                    setShowPopup(false);
                    setBillName("");
                    setBillAddress("");
                    navigate("/bill-records");
                  } catch (error) {
                    logger.error("❌ Save failed:", error);
                    alert("Failed to save record!");
                  }
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Confirm Data Scan */}
      {confirmData && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full space-y-3 animate-fadeIn">
            <h3 className="text-lg font-semibold mb-2">Confirm Bill Info</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p>
                <strong>Name:</strong> {confirmData.name || "(No name)"}
              </p>
              <p>
                <strong>Type:</strong>{" "}
                {confirmData.type === 2 ? "🍱 FOOD" : "💰 NORMAL"}
              </p>
              <pre>{JSON.stringify(confirmData)}</pre>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setConfirmData(null)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Loading when scanning bill */}
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
