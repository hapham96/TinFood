import React, { useState, useEffect } from "react";
import "../styles/MoneyShare.css";

export default function App() {
  const [people, setPeople] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [name, setName] = useState("");
  const [expenseName, setExpenseName] = useState("");
  const [amount, setAmount] = useState("");
  const [payer, setPayer] = useState("");
  const [total, setTotal] = useState(0);
  const [average, setAverage] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [balances, setBalances] = useState({});
  // 🔹 Recalculate total & average whenever people or expenses change
  useEffect(() => {
    const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    setTotal(totalAmount);
    setAverage(people.length > 0 ? totalAmount / people.length : 0);
  }, [expenses, people]);

  // 🔹 Add person
  const addPerson = () => {
    if (name.trim() === "") return;
    if (people.includes(name)) return alert("Name already exists");
    setPeople([...people, name]);
    setName("");
  };

  // 🔹 Remove person & their related expenses
  const removePerson = (person) => {
    setPeople(people.filter((p) => p !== person));
    setExpenses(expenses.filter((e) => e.payer !== person));
  };

  // 🔹 Add expense
  const addExpense = () => {
    if (!expenseName || !amount || !payer)
      return alert("Please fill all fields");
    setExpenses([
      ...expenses,
      { name: expenseName, amount: Number(amount), payer },
    ]);
    setExpenseName("");
    setAmount("");
    setPayer("");
  };

  // 🔹 Remove expense
  const removeExpense = (index) => {
    const updated = [...expenses];
    updated.splice(index, 1);
    setExpenses(updated);
  };

  // 🔹 Calculate balance per person
  const calculateBalances = () => {
    if (people.length === 0 || expenses.length === 0) {
      alert("Please add participants and expenses first.");
      return;
    }

    const payments = {};
    people.forEach((p) => (payments[p] = 0));

    expenses.forEach((e) => {
      payments[e.payer] += e.amount;
    });

    const results = {};
    for (const p of people) {
      results[p] = Math.round(payments[p] - average);
    }

    setBalances(results);
    setShowPopup(true);
  };

  return (
    <div className="app-container">
      <div className="header-bar">
        <h1 className="title">Share Bill</h1>
        <button className="calc-btn" onClick={calculateBalances}>
          🧮 Calculator
        </button>
      </div>

      {/* 👥 People Section */}
      <div className="section">
        <h2>👥 Participants</h2>
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={addPerson}>Add</button>
        </div>

        <ul className="people-list">
          {people.map((person, i) => (
            <li key={i} className="fade-in">
              {person}
              <button
                className="remove-btn"
                onClick={() => removePerson(person)}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* 💰 Expense Section */}
      <div className="section">
        <h2>💰 Expenses</h2>
        <div className="input-group">
          <input
            type="text"
            placeholder="Expense name"
            value={expenseName}
            onChange={(e) => setExpenseName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <select value={payer} onChange={(e) => setPayer(e.target.value)}>
            <option value="">Select payer</option>
            {people.map((p, i) => (
              <option key={i} value={p}>
                {p}
              </option>
            ))}
          </select>
          <button onClick={addExpense}>Add</button>
        </div>

        {expenses.length > 0 && (
          <table className="expense-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Amount (₫)</th>
                <th>Payer</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp, i) => (
                <tr key={i} className="slide-up">
                  <td>{exp.name}</td>
                  <td>{exp.amount.toLocaleString()}</td>
                  <td>{exp.payer}</td>
                  <td>
                    <button
                      className="remove-btn"
                      onClick={() => removeExpense(i)}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 📊 Summary Section */}
      <div className="summary fade-in mb-12">
        <p>
          <strong>Total:</strong> {total.toLocaleString()} ₫
        </p>
        <p>
          <strong>Average per person:</strong>{" "}
          {average.toLocaleString(undefined, { maximumFractionDigits: 0 })} ₫
        </p>
      </div>

      {/* 💡 Popup */}
      {showPopup && (
        <div className="modal-backdrop" onClick={() => setShowPopup(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>💸 Build Split Result</h3>
            <ul>
              {Object.entries(balances).map(([person, balance]) => (
                <li key={person}>
                  <strong>{person}</strong> —{" "}
                  {balance > 0
                    ? `Receive (+) ${balance.toLocaleString()} ₫`
                    : balance < 0
                    ? `Pay (-) ${Math.abs(balance).toLocaleString()} ₫`
                    : "Nothing todo"}
                </li>
              ))}
            </ul>
            <button className="close-btn" onClick={() => setShowPopup(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
