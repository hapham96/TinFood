import { useState, useEffect } from "react";
import { MoneyBillType } from "../services/money-bill.service";

export default function ModeTabs({ value, onChange, disabled = false }) {
  const [active, setActive] = useState(value || MoneyBillType.NORMAL);

  useEffect(() => {
    if (value) setActive(value);
  }, [value]);

  const handleChange = (mode) => {
    setActive(mode);
    onChange?.(mode);
  };

  return (
    <div className="flex items-center justify-center bg-primary rounded-2xl p-1">
      {[
        { id: MoneyBillType.NORMAL, label: "⚖️ Normal" },
        { id: MoneyBillType.FOOD, label: "🍱 Food" },
      ].map((tab) => {
        return (
          <button
            disabled={disabled}
            key={tab.id}
            onClick={() => handleChange(tab.id)}
            className={`flex-1 py-2 text-center rounded-xl font-medium transition-all ${
              active === tab.id
                ? "bg-white text-black shadow-inner"
                : "text-gray-400"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
