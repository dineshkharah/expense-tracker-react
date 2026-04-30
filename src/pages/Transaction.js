import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, DatePicker, message } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { exportCSV, exportPDF } from "../utils/exportUtils";

import TransactionFilters from "../components/TransactionFilters";
import TransactionTable from "../components/TransactionTable";

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

        <TransactionTable
          data={filteredTransactions}
          loading={loading}
          filters={filters}
          onEdit={handleEdit}
          onDelete={handleDelete}
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
