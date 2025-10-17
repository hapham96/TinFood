import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoneyBill, MoneyBillType } from "../services/money-bill.service";

export default function RecordsMoneyBill() {
  const [records, setRecords] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBills = async () => {
      const bill = new MoneyBill();
      const list = await bill.getMoneyBills();
      setRecords(Array.isArray(list) ? list.reverse() : []);
    };
    fetchBills();
  }, []);

  if (records.length === 0)
    return (
      <div className="p-4 text-center text-gray-500">No saved bills yet.</div>
    );

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-xl font-bold mb-3">Saved Bills</h2>

      {records.map((r) => (
        <div
          key={r.id}
          onClick={() => navigate(`/money-share/${r.id}`)}
          className="p-4 bg-white rounded-xl shadow border cursor-pointer hover:bg-gray-50 transition"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="text-lg font-semibold text-gray-800">
                {r.name || "Untitled Bill"}
              </div>

              <div className="text-sm text-gray-600 mt-1">
                {r.type === MoneyBillType.FOOD ? "🍱 FOOD" : "💰 NORMAL"}
              </div>

              <div className="text-xs text-gray-400 mt-1">
                {r.date || "N/A"}
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-bold text-gray-800">
                {(r.totalAfterDiscount || 0).toLocaleString()} ₫
              </div>
              <div className="text-xs text-gray-400">
                ({r.expenses?.length || 0} items)
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
