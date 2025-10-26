import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoneyBill } from "../services/money-bill.service";
import ConfirmModal from "../components/modals/ConfirmModal";
import RecordItem from "./RecordItem";
import AddNewBillModal from "../components/modals/AdNewBillModal";
import { useLogger } from "../services/logger/useLogger";

export default function RecordsMoneyBill() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const logger = useLogger("RecordsMoneyBill");
  const fetchBills = async () => {
    const bill = new MoneyBill();
    const list = await bill.getMoneyBills(false);
    logger.info("Fetched list bills:", list);
    setRecords(Array.isArray(list) ? list.reverse() : []);
  };

  const handleDelete = async () => {
    const bill = new MoneyBill();
    await bill.deleteMoneyBill(selectedId);
    setRecords((prev) => prev.filter((r) => r.id !== selectedId));
  };

  const addNewBill = () => {
    setShowAddModal(true);
  };

  const handleCreateBill = async (billData) => {
    try {
      const billService = new MoneyBill(); // Tạo instance service
      const newBill = await billService.createMoneyBill(billData);
      setShowAddModal(false);

      if (newBill && newBill.id) {
        navigate(`/money-share/${newBill.id}`);
      } else {
        throw new Error("Failed to get new bill ID");
      }
    } catch (error) {
      console.error("Failed to create bill:", error);
      alert("Error creating new bill. Please try again.");
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  return (
    <div className="flex flex-col p-4" style={{ height: "79vh" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h2 className="text-xl font-bold color-primary">Saved Bills</h2>
        <button
          onClick={addNewBill}
          className="circle-btn flex items-center justify-center"
        >
          +
        </button>
      </div>

      {records.length === 0 ? (
        <div className="p-4 text-center text-gray-500 flex-1">
          No saved bills yet <br />
          <a
            onClick={addNewBill}
            className="items-center justify-center color-primary font-bold cursor-pointer"
          >
            + Add New Bill
          </a>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto min-h-0 space-y-3 pr-1">
          {records.map((r) => (
            <RecordItem
              key={r.id}
              record={r}
              onOpen={() => navigate(`/money-share/${r.id}`)}
              onSwipeLeft={() => setSelectedId(r.id)}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!selectedId}
        text="Are you sure you want to delete this bill?"
        onClose={() => setSelectedId(null)}
        onConfirm={() => {
          handleDelete(selectedId);
          setSelectedId(null);
        }}
      />

      <AddNewBillModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreate={handleCreateBill}
      />
    </div>
  );
}
