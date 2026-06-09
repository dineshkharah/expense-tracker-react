import React from "react";
import { Table, Tag, Empty, Button, Popconfirm, Tooltip } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const TransactionTable = ({ data, loading, filters, onEdit, onDelete }) => {
  const highlightText = (text, search) => {
    if (!search) return text;

    const regex = new RegExp(`(${search})`, "gi");
    const parts = String(text).split(regex);

    return parts.map((part, index) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <span key={index} className="bg-yellow-200 dark:bg-yellow-700 px-0.5">
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      align: "center",
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      render: (d) => dayjs(d).format("DD MMM YYYY"),
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      align: "center",
      render: (text) => highlightText(text, filters.search),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      align: "center",
      render: (type) => (
        <Tag color={type === "income" ? "green" : "red"} bordered={false}>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      align: "center",
      render: (text) => highlightText(text, filters.search),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "center",
      sorter: (a, b) => a.amount - b.amount,
      render: (amt, record) => (
        <span
          className={`font-bold 
            ${
              record.type === "income"
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
        >
          ₹{amt}
        </span>
      ),
    },
    {
      title: "Wallet",
      dataIndex: "wallet",
      key: "wallet",
      align: "center",
      render: (wallet) =>
        wallet ? (
          <Tag bordered={false}>{wallet}</Tag>
        ) : (
          <span className="text-gray-300 dark:text-slate-600">-</span>
        ),
    },
    {
      title: "Recurring",
      key: "recurring",
      align: "center",
      render: (_, record) =>
        record.recurring ? (
          <Tag color="blue" bordered={false}>
            Recurring
          </Tag>
        ) : (
          <span className="text-gray-300 dark:text-slate-600">-</span>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <div className="flex justify-center gap-1">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this transaction?"
            onConfirm={() => onDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800 overflow-hidden p-1">
    <Table
      dataSource={[...data].sort((a, b) => new Date(b.date) - new Date(a.date))}
      columns={columns}
      rowKey="_id"
      loading={loading}
      pagination={{ pageSize: 10 }}
      scroll={{ x: "max-content" }}
      className="min-w-full"
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                No transactions found
                {filters.search && (
                  <>
                    {" "}
                    for "<b>{filters.search}</b>"
                  </>
                )}
              </span>
            }
          />
        ),
      }}
    />
    </div>
  );
};

export default TransactionTable;
