import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, DatePicker, Popconfirm, message } from "antd";
import axios from "axios";
import dayjs from "dayjs";

const { Option } = Select;

const token = localStorage.getItem("token");
const headers = { Authorization: `Bearer ${token}` };

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [form] = Form.useForm();

  // Fetch all transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/v1/transactions", { headers });
      setTransactions(res.data);
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

  // Handle Delete
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/v1/transactions/${id}`, { headers });
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

  // Table columns
  const columns = [
    { title: "Date", dataIndex: "date", key: "date", align: "center", render: (d) => dayjs(d).format("DD MMM YYYY") },
    { title: "Type", dataIndex: "type", key: "type", align: "center", render: (t) => (t === "income" ? "💰 Income" : "💸 Expense") },
    { title: "Source", dataIndex: "personName", key: "personName", align: "center" },
    { title: "Category", dataIndex: "category", key: "category", align: "center" },
    { title: "Amount", dataIndex: "amount", key: "amount", align: "center" },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
          <Popconfirm
            title="Are you sure you want to delete this transaction?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>Delete</Button>
          </Popconfirm>
        </>
      )
    },
  ];

  return (
  <div className="flex flex-col w-full px-4 py-6">
    <h2 className="text-xl font-semibold mb-4">All Transactions</h2>

    <div className="w-full overflow-x-auto">
      <Table
        dataSource={transactions}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }} // allows horizontal scroll
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

        <Form.Item name="personName" label="Source" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
          <Input type="number" />
        </Form.Item>

        <Form.Item name="date" label="Date" rules={[{ required: true }]}>
          <DatePicker className="w-full" format="YYYY-MM-DD" />
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
