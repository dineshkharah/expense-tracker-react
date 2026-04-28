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
          style={{
            color: record.type === "income" ? "green" : "red",
            fontWeight: 600,
          }}
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
        <span style={{ color: type === "income" ? "green" : "red" }}>
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
      <div
        style={{
          height: 180,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "#6b7280",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 42 }}>📅</div>
        <p style={{ fontWeight: 600, marginBottom: 4 }}>
          No transactions for {selectedDate.format("DD MMM YYYY")}
        </p>
        <p style={{ fontSize: 12 }}>
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
