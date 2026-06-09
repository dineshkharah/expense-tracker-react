import React, { useEffect, useState, useCallback } from "react";
import { Card, Empty } from "antd";
import { WalletOutlined } from "@ant-design/icons";
import api from "../utils/api";

// "Spending by Wallet" - shows each wallet's spend this month and all-time,
// sorted by most-used. Read-only; totals are derived server-side.
const WalletSummary = () => {
  const [month, setMonth] = useState("");
  const [wallets, setWallets] = useState([]);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await api.get("/api/v1/transactions/wallet-summary");
      setMonth(res.data.month);
      setWallets(res.data.wallets || []);
    } catch (error) {
      console.error("Error fetching wallet summary:", error);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const maxExpense = Math.max(...wallets.map((w) => w.totalExpense), 1);

  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          <WalletOutlined /> Spending by Wallet
        </span>
      }
      className="mt-6 !rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm"
    >
      {wallets.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No wallet activity yet"
        />
      ) : (
        <div className="flex flex-col gap-4">
          {wallets.map((w) => (
            <div key={w.wallet}>
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-medium text-gray-700 dark:text-slate-200">
                  {w.wallet}
                  <span className="text-xs text-gray-400 dark:text-slate-500 ml-2">
                    {w.count} transaction{w.count !== 1 ? "s" : ""}
                  </span>
                </span>
                <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                  ₹{w.totalExpense.toLocaleString()}
                </span>
              </div>

              {/* usage bar (relative to the biggest spender) */}
              <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${(w.totalExpense / maxExpense) * 100}%`,
                  }}
                />
              </div>

              <div className="flex justify-between text-xs text-gray-400 dark:text-slate-500 mt-1">
                <span>
                  {month}: ₹{w.monthExpense.toLocaleString()} spent
                </span>
                <span>Income ₹{w.totalIncome.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default WalletSummary;
