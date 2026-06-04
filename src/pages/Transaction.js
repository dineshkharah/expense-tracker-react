import React, { useEffect, useState, useCallback } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
} from "antd";
import api from "../utils/api";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { exportCSV, exportPDF } from "../utils/exportUtils";

import TransactionFilters from "../components/TransactionFilters";
import TransactionTable from "../components/TransactionTable";

const { Option } = Select;

dayjs.extend(isBetween);

const Transactions = ({ embedded = false }) => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    wallet: "",
    dateRange: [],
    search: "",
  });
  const [form] = Form.useForm();

  // Fetch all transactions
  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/v1/transactions");
      setTransactions(res.data);
      setFilteredTransactions(res.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      message.error("Failed to fetch transactions.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWallets = useCallback(async () => {
    try {
      const res = await api.get("/api/v1/wallets");
      setWallets(res.data.map((w) => ({ value: w.name, label: w.name })));
    } catch (error) {
      console.error("Error fetching wallets:", error);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    fetchWallets();
  }, [fetchTransactions, fetchWallets]);

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
    if (filters.wallet) {
      data = data.filter((t) =>
        filters.wallet === "__none__" ? !t.wallet : t.wallet === filters.wallet,
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
      await api.delete(`/api/v1/transactions/${id}`);
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
      await api.put(`/api/v1/transactions/${editingTransaction._id}`, payload);
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
      wallet: "",
      dateRange: [],
      search: "",
    });
  };

  return (
    <div
      className={
        embedded
          ? "flex flex-col w-full"
          : "flex flex-col w-full max-w-6xl mx-auto px-1 sm:px-4 py-2"
      }
    >
      {!embedded && (
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-slate-100 m-0">
            Transactions
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 mb-0">
            Search, filter and manage your transaction history.
          </p>
        </div>
      )}

      {/* Filters */}
      <TransactionFilters
        filters={filters}
        setFilters={setFilters}
        transactions={transactions}
        wallets={wallets}
        onExportCSV={exportCSV}
        onExportPDF={exportPDF}
        onClearFilters={clearFilters}
      />

      {/* Table */}
      <div className="w-full overflow-x-auto">
        {/* Display transaction count */}
        {filteredTransactions.length > 0 && (
          <div className="text-sm text-gray-500 mb-2 dark:text-slate-400">
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

          <Form.Item name="wallet" label="Wallet">
            <Select
              allowClear
              placeholder="Select a wallet (optional)"
              options={wallets}
              disabled={wallets.length === 0}
            />
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
