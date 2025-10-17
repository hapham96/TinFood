import React, { useState, useEffect } from "react";
import "../styles/MoneyShare.css";
import { MoneyBillType } from "../services/money-bill.service";
import { MoneyBill } from "../services/money-bill.service";
import { useNavigate, useParams } from "react-router-dom";

export default function MoneyShare() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [bill, setBill] = useState(
    () => new MoneyBill({ type: MoneyBillType.NORMAL })
  );
  const [balances, setBalances] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempItem, setTempItem] = useState("");
  const [tempAmount, setTempAmount] = useState("");
  const [tempQty, setTempQty] = useState("");
  const [tempPayer, setTempPayer] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [billName, setBillName] = useState("");
  const [billAddress, setBillAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  // ➕ Add expense
  const addExpense = () => {
    if (!tempItem || !tempAmount)
      return alert("Please fill item name & amount");
    if (bill.type === MoneyBillType.NORMAL && !tempPayer)
      return alert("Please select payer");

    const newExpense =
      bill.type === MoneyBillType.FOOD
        ? {
            name: tempItem,
            amount: Number(tempAmount),
            quantity: Number(tempQty) || 1,
          }
        : {
            name: tempItem,
            amount: Number(tempAmount),
            paidBy: tempPayer,
            quantity: 1,
          };

    setBill(
      new MoneyBill({
        ...bill,
        expenses: [...bill.expenses, newExpense],
      })
    );

    setTempItem("");
    setTempAmount("");
    setTempPayer("");
    setTempQty("");
  };

  const removeExpense = (i) => {
    const newExp = [...bill.expenses];
    newExp.splice(i, 1);
    setBill(new MoneyBill({ ...bill, expenses: newExp }));
  };

  // ⚙️ Calculate
  const calculateBalances = () => {
    try {
      const result = bill.calculateBalances();
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

  return (
    <div className="app-container">
      {/* 🔝 Top bar */}
      <div className="top-bar">
        <div className="toggle-group">
          <button
            className={bill.type === MoneyBillType.NORMAL ? "active" : ""}
            onClick={() =>
              setBill(new MoneyBill({ ...bill, type: MoneyBillType.NORMAL }))
            }
            disabled={!!id} // disable toggle when editing existing bill
          >
            ⚖️ Normal
          </button>
          <button
            className={bill.type === MoneyBillType.FOOD ? "active" : ""}
            onClick={() =>
              setBill(new MoneyBill({ ...bill, type: MoneyBillType.FOOD }))
            }
            disabled={!!id}
          >
            🍱 Food
          </button>
        </div>

        <button
          className="records-btn"
          onClick={() => navigate("/bill-records")}
        >
          View Saved Bills
        </button>
      </div>

      {/* 🧾 Header section */}
      <div className="header-bar">
        <h1 className="title">
          Share Bill
          {id && <p className="edit-hint">📝 Editing saved bill</p>}
        </h1>

        <button className="calc-btn" onClick={calculateBalances}>
          Calculate
        </button>
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

      <div className="section">
        <h2>💰 Expenses</h2>
        <div className="input-group">
          <input
            type="text"
            placeholder="Item"
            value={tempItem}
            onChange={(e) => setTempItem(e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount"
            value={tempAmount}
            onChange={(e) => setTempAmount(e.target.value)}
          />
          {bill.type === MoneyBillType.FOOD && (
            <input
              type="number"
              placeholder="Qty (default 1)"
              value={tempQty}
              min="1"
              onChange={(e) => setTempQty(e.target.value)}
              className="qty-input"
            />
          )}
          {bill.type === MoneyBillType.NORMAL && (
            <select
              value={tempPayer}
              onChange={(e) => setTempPayer(e.target.value)}
            >
              <option value="">Select payer</option>
              {bill.participants?.map((p, i) => (
                <option key={i} value={p}>
                  {p}
                </option>
              ))}
            </select>
          )}
          <button className="circle-btn" onClick={addExpense}>
            +
          </button>
        </div>

        {bill.type === MoneyBillType.FOOD && (
          <div className="extra-inputs mt-3">
            <div className="flex justify-start items-center">
              <span>Discount </span>
              <input
                className="ml-2"
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
            <div className="flex justify-start items-center">
              <span>Ship Fee </span>
              <input
                className="ml-2"
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
                  <td>{e.name}</td>
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

      {showPopup && (
        <div className="modal-backdrop" onClick={() => setShowPopup(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>💸 Result</h3>
            <ul>
              {Object.entries(balances).map(([person, balance]) => (
                <li key={person}>
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
            <div className="modal-actions">
              <button
                className="save-btn"
                onClick={id ? handleSaveResult : () => setShowSaveForm(true)}
              >
                💾 {id ? "Update" : "Save"}
              </button>

              <button className="copy-btn" onClick={handleCopyResult}>
                📋 Copy
              </button>
              <button className="close-btn" onClick={() => setShowPopup(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showSaveForm && (
        <div className="modal-backdrop" onClick={() => setShowSaveForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>💾 Save Bill</h3>

            <div className="input-group mb-2">
              <label>📌 Bill Name (*)</label>
              <input
                type="text"
                placeholder="Enter bill name"
                value={billName}
                onChange={(e) => setBillName(e.target.value)}
              />
            </div>

            <div className="input-group mb-2">
              <label>🏠 Address (optional)</label>
              <input
                type="text"
                placeholder="Enter address"
                value={billAddress}
                onChange={(e) => setBillAddress(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button
                className="save-btn"
                onClick={async () => {
                  if (!billName.trim()) {
                    alert("⚠️ Bill name is required!");
                    return;
                  }

                  try {
                    const updatedBill = new MoneyBill({
                      ...bill,
                      name: billName.trim(),
                      address: billAddress.trim(),
                    });

                    await updatedBill.saveMoneyBill(updatedBill);

                    // reset state sau khi lưu
                    setShowSaveForm(false);
                    setShowPopup(false);
                    setBillName("");
                    setBillAddress("");
                  } catch (error) {
                    console.error("❌ Save failed:", error);
                    alert("Failed to save record!");
                  }
                }}
              >
                ✅ Save
              </button>

              <button
                className="close-btn"
                onClick={() => setShowSaveForm(false)}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
