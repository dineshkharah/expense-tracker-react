import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, DatePicker, Popconfirm, message } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import isBetween from "dayjs/plugin/isBetween";

const { Option } = Select;
const { RangePicker } = DatePicker;

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
        t.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }
    if (filters.dateRange.length === 2) {
      const [start, end] = filters.dateRange;
      data = data.filter((t) =>
        dayjs(t.date).isBetween(start, end, "day", "[]")
      );
    }
    if (filters.search) {
      data = data.filter((t) =>
        t.source.toLowerCase().includes(filters.search.toLowerCase())
      );
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
        { headers }
      );
      message.success("Transaction updated successfully!");
      setEditingTransaction(null);
      fetchTransactions();
    } catch (error) {
      console.error("Error updating transaction:", error);
      message.error("Failed to update transaction.");
    }
  };

  // Export to CSV
  const exportCSV = () => {
    const headers = ["Date", "Type", "Source", "Category", "Amount", "Notes"];
    const rows = transactions.map(t => [
      dayjs(t.date).format("DD-MM-YYYY"),
      t.type,
      t.source,
      t.category,
      t.amount,
      t.notes || ""
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "transactions.csv");
  };

  // Export to PDF
  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text("Transactions Report", 14, 15);

    const tableColumn = ["Date", "Type", "Source", "Category", "Amount", "Notes"];
    const tableRows = transactions.map(t => [
      dayjs(t.date).format("DD-MM-YYYY"),
      t.type,
      t.source,
      t.category,
      t.amount,
      t.notes || ""
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save("transactions.pdf");
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
      title: "Type",
      dataIndex: "type",
      key: "type",
      align: "center",
      // filters: [
      //   { text: "Income", value: "income" },
      //   { text: "Expense", value: "expense" },
      // ],
      onFilter: (value, record) => record.type === value,
    },
    { title: "Source", dataIndex: "source", key: "source", align: "center" },
    { title: "Category", dataIndex: "category", key: "category", align: "center" },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "center",
      sorter: (a, b) => a.amount - b.amount,
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
      <div className="mb-4">
        <div className="flex flex-wrap gap-3 w-full">
          {/* Search */}
          <Input
            placeholder="Search by source"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full sm:w-[220px]"
          />

          {/* Type */}
          <Select
            placeholder="Type"
            allowClear
            value={filters.type || undefined}
            onChange={(value) => setFilters({ ...filters, type: value })}
            className="w-full sm:w-[160px]"
          >
            <Option value="income">Income</Option>
            <Option value="expense">Expense</Option>
          </Select>

          {/* Category */}
          <Input
            placeholder="Category"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="w-full sm:w-[180px]"
          />

          {/* Date range */}
          <RangePicker
            value={filters.dateRange}
            onChange={(dates) => setFilters({ ...filters, dateRange: dates || [] })}
            className="flex-1 min-w-[260px]"
            format="DD-MM-YYYY"
          />
        </div>

        {/* Export buttons */}
        <div className="flex gap-2 mt-3">
          <Button onClick={exportCSV} type="primary">Export CSV</Button>
          <Button onClick={exportPDF} type="default">Export PDF</Button>
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <Table
          dataSource={filteredTransactions}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
          className="min-w-full"
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

          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
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