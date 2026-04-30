import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Popconfirm,
  message,
  Tag,
  Empty,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { exportCSV, exportPDF } from "../utils/exportUtils";

import TransactionFilters from "../components/TransactionFilters";

const { Option } = Select;

const token = localStorage.getItem("token");
const headers = { Authorization: `Bearer ${token}` };

dayjs.extend(isBetween);

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    dateRange: [],
    search: "",
  });
  const [form] = Form.useForm();

  // Fetch all transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/v1/transactions", {
        headers,
      });
      setTransactions(res.data);
      setFilteredTransactions(res.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      message.error("Failed to fetch transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Apply filters locally
  useEffect(() => {
    let data = [...transactions];

    if (filters.type) {
      data = data.filter((t) => t.type === filters.type);
    }
    if (filters.category) {
      data = data.filter((t) =>
        t.category.toLowerCase().includes(filters.category.toLowerCase()),
      );
    }
    if (filters.dateRange.length === 2) {
      const [start, end] = filters.dateRange;
      data = data.filter((t) =>
        dayjs(t.date).isBetween(start, end, "day", "[]"),
      );
    }
    if (filters.search) {
      const searchText = filters.search.toLowerCase().trim();

      data = data.filter((t) => {
        return (
          t.source?.toLowerCase().includes(searchText) ||
          t.category?.toLowerCase().includes(searchText) ||
          t.type?.toLowerCase().includes(searchText) ||
          String(t.amount).includes(searchText)
        );
      });
    }

    setFilteredTransactions(data);
  }, [filters, transactions]);

  // Handle Delete
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/v1/transactions/${id}`, {
        headers,
      });
      message.success("Transaction deleted successfully!");
      fetchTransactions();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      message.error("Failed to delete transaction.");
    }
  };

  // Handle Edit
  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    form.setFieldsValue({
      ...transaction,
      date: transaction.date ? dayjs(transaction.date) : null,
    });
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        date: values.date ? values.date.toISOString() : null,
      };
      await axios.put(
        `http://localhost:5000/api/v1/transactions/${editingTransaction._id}`,
        payload,
        { headers },
      );
      message.success("Transaction updated successfully!");
      setEditingTransaction(null);
      fetchTransactions();
    } catch (error) {
      console.error("Error updating transaction:", error);
      message.error("Failed to update transaction.");
    }
  };

  // clear all filters
  const clearFilters = () => {
    setFilters({
      type: "",
      category: "",
      dateRange: [],
      search: "",
    });
  };

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
      // filters: [
      //   { text: "Income", value: "income" },
      //   { text: "Expense", value: "expense" },
      // ],
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
          <Tag color="blue" style={{ fontWeight: "bold" }}>
            Recurring
          </Tag>
        ) : (
          <Tag color="default">Not-Recurring</Tag>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <div className="flex justify-center gap-2">
          <Button type="link" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this transaction?"
            onConfirm={() => handleDelete(record._id)}
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
    <div className="flex flex-col w-full px-4 py-6">
      <h2 className="text-xl font-semibold mb-4">All Transactions</h2>

      {/* Filters */}
      <TransactionFilters
        filters={filters}
        setFilters={setFilters}
        transactions={transactions}
        onExportCSV={exportCSV}
        onExportPDF={exportPDF}
        onClearFilters={clearFilters}
      />

      {/* Table */}
      <div className="w-full overflow-x-auto">
        {/* Display transaction count */}
        {filteredTransactions.length > 0 && (
          <div className="text-sm text-gray-500 mb-2">
            Showing {filteredTransactions.length} transaction
            {filteredTransactions.length > 1 ? "s" : ""}
          </div>
        )}

        <Table
          dataSource={[...filteredTransactions].sort(
            (a, b) => new Date(b.date) - new Date(a.date),
          )}
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

      {/* Edit Modal */}
      <Modal
        title="Edit Transaction"
        open={!!editingTransaction}
        onCancel={() => setEditingTransaction(null)}
        onOk={handleUpdate}
        okText="Update"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select>
              <Option value="income">Income</Option>
              <Option value="expense">Expense</Option>
            </Select>
          </Form.Item>

          <Form.Item name="source" label="Source" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>

          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker className="w-full" format="DD-MM-YYYY" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Transactions;
