import React from "react";
import { Tabs } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { TableOutlined, SyncOutlined } from "@ant-design/icons";
import Transactions from "./Transaction";
import RecurringTransactions from "./RecurringTransaction";

// Hub that groups the transaction views (History + Recurring) into one
// destination with tabs, so Recurring is easily reachable on every device.
const TransactionsHub = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeKey =
    location.pathname === "/recurring-transactions" ? "recurring" : "history";

  const onTabChange = (key) => {
    navigate(key === "recurring" ? "/recurring-transactions" : "/transactions", {
      replace: true,
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-1 sm:px-4 py-2">
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-slate-100 m-0">
          Transactions
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 mb-0">
          Browse your history and manage recurring payments.
        </p>
      </div>

      <Tabs
        activeKey={activeKey}
        onChange={onTabChange}
        items={[
          {
            key: "history",
            label: (
              <span>
                <TableOutlined /> History
              </span>
            ),
            children: <Transactions embedded />,
          },
          {
            key: "recurring",
            label: (
              <span>
                <SyncOutlined /> Recurring
              </span>
            ),
            children: <RecurringTransactions embedded />,
          },
        ]}
      />
    </div>
  );
};

export default TransactionsHub;
