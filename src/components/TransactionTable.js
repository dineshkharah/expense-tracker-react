import React from "react";
import { Table, Tag, Empty, Button, Popconfirm } from "antd";
import dayjs from "dayjs";

const TransactionTable = ({ data, loading, filters, onEdit, onDelete }) => {
  const highlightText = (text, search) => {
    if (!search) return text;

    const regex = new RegExp(`(${search})`, "gi");
    const parts = String(text).split(regex);

    return parts.map((part, index) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <span
          key={index}
          style={{ backgroundColor: "#ffe58f", padding: "0 2px" }}
        >
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
        <Tag color={type === "income" ? "green" : "red"}>
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
          style={{
            color: record.type === "income" ? "green" : "red",
            fontWeight: "bold",
          }}
        >
          ₹{amt}
        </span>
      ),
    },
    {
      title: "Recurring",
      key: "recurring",
      align: "center",
      render: (_, record) =>
        record.recurring ? (
          <Tag color="blue">Recurring</Tag>
        ) : (
          <Tag>Not-Recurring</Tag>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <div className="flex justify-center gap-2">
          <Button type="link" onClick={() => onEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this transaction?"
            onConfirm={() => onDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
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
  );
};

export default TransactionTable;
