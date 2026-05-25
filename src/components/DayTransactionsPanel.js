import React from "react";
import { Table } from "antd";

const DayTransactionsPanel = ({ selectedDate, transactions }) => {
  const dayColumns = [
    {
      title: "Title",
      dataIndex: "source",
      key: "source",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text, record) => (
        <span
          className={`font-semibold ${
            record.type === "income"
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          ₹{text}
        </span>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <span
          className={
            type === "income"
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }
        >
          {type.toUpperCase()}
        </span>
      ),
    },
  ];

  const getTransactionsForDate = () => {
    return transactions.filter(
      (txn) =>
        new Date(txn.date).toDateString() ===
        selectedDate.toDate().toDateString(),
    );
  };

  const dayTransactions = getTransactionsForDate();

  if (dayTransactions.length === 0) {
    return (
      <div className="h-44 flex flex-col justify-center items-center text-gray-500 dark:text-slate-400 text-center">
        <div className="text-5xl">📅</div>
        <p className="font-semibold mb-1 mt-2">
          No transactions for {selectedDate.format("DD MMM YYYY")}
        </p>
        <p className="text-xs">
          Add a transaction or wait for your recurring payments.
        </p>
      </div>
    );
  }

  return (
    <Table
      dataSource={dayTransactions}
      columns={dayColumns}
      rowKey="_id"
      pagination={false}
      size="small"
    />
  );
};

export default DayTransactionsPanel;
