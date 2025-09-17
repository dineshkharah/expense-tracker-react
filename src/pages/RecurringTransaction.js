import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, Popconfirm, message, Tag, Switch } from "antd";
import axios from "axios";
import dayjs from "dayjs";

import RecurringTransactionsDetail from "./../components/RecurringTransactionDetail";

const { Option } = Select;

const token = localStorage.getItem("token");
const headers = { Authorization: `Bearer ${token}` };

const RecurringTransactions = () => {
    const [recurrings, setRecurrings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(null);
    const [detail, setDetail] = useState(null);
    const [form] = Form.useForm();

    const fetchRecurrings = async () => {
        try {
            setLoading(true);
            const res = await axios.get("http://localhost:5000/api/v1/recurring-transactions", { headers });
            setRecurrings(res.data);
        } catch (error) {
            console.error("Error fetching recurring transactions:", error);
            message.error("Failed to fetch recurring transactions.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecurrings();
    }, []);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/v1/recurring-transactions/${id}`, { headers });
            message.success("Recurring transaction deleted!");
            fetchRecurrings();
        } catch (error) {
            console.error("Error deleting:", error);
            message.error("Failed to delete.");
        }
    };

    const handleEdit = (record) => {
        setEditing(record);
        form.setFieldsValue({
            ...record,
            amount: record.latestAmount,
            startDate: record.startDate ? dayjs(record.startDate) : null,
            nextDate: record.nextDate ? dayjs(record.nextDate) : null,
        });
    };

    const handleUpdate = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                amount: values.amount.toString(),
                effectiveFrom: values.effectiveFrom ? values.effectiveFrom.toISOString() : new Date(),
            };
            await axios.put(
                `http://localhost:5000/api/v1/recurring-transactions/${editing._id}`,
                payload,
                { headers }
            );
            message.success("Recurring transaction updated!");
            setEditing(null);
            fetchRecurrings();
        } catch (error) {
            console.error("Error updating:", error);
            message.error("Failed to update recurring transaction.");
        }
    };

    const handleToggleActive = async (record) => {
        try {
            const newStatus = !record.isActive;

            await axios.put(
                `http://localhost:5000/api/v1/recurring-transactions/${record._id}`,
                { isActive: newStatus }, // ✅ backend accepts partial update
                { headers }
            );

            message.success(`Recurring transaction ${newStatus ? "resumed" : "paused"}.`);
            fetchRecurrings(); // ✅ refresh to reflect real DB value
        } catch (error) {
            console.error("Error toggling active status:", error);
            message.error("Failed to update status.");
        }
    };

    const columns = [
        { title: "Source", dataIndex: "source", key: "source", align: "center" },
        { title: "Category", dataIndex: "category", key: "category", align: "center" },
        {
            title: "Amount",
            key: "amount",
            align: "center",
            render: (text, record) => <span>₹{record.latestAmount}</span>,
        },
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
            align: "center",
            render: (type) => (
                <Tag color={type === "income" ? "green" : "red"}>{type.toUpperCase()}</Tag>
            ),
        },
        {
            title: "Frequency",
            dataIndex: "frequency",
            key: "frequency",
            align: "center",
        },
        {
            title: "Next Date",
            dataIndex: "nextDate",
            key: "nextDate",
            align: "center",
            render: (date) => (date ? dayjs(date).format("DD MMM YYYY") : "-"),
        },
        {
            title: "Active",
            key: "isActive",
            align: "center",
            render: (text, record) => (
                <Switch checked={record.isActive} onChange={() => handleToggleActive(record)} />
            ),
        },
        {
            title: "Actions",
            key: "actions",
            align: "center",
            render: (text, record) => (
                <>
                    <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
                    <Popconfirm
                        title="Delete this recurring transaction?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="link" danger>Delete</Button>
                    </Popconfirm>
                    <Button type="link" onClick={() => setDetail(record)}>View</Button>
                </>
            ),
        },
    ];

    return (
        <div className="flex flex-col w-full px-4 py-6">
            <h2 className="text-xl font-semibold mb-4">Recurring Transactions</h2>
            <Table
                dataSource={recurrings}
                columns={columns}
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                scroll={{ x: "max-content" }}
            />

            {/* Edit Modal */}
            <Modal
                title="Edit Recurring Transaction"
                open={!!editing}
                onCancel={() => setEditing(null)}
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
                    <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="frequency" label="Frequency" rules={[{ required: true }]}>
                        <Select>
                            <Option value="daily">Daily</Option>
                            <Option value="weekly">Weekly</Option>
                            <Option value="monthly">Monthly</Option>
                            <Option value="yearly">Yearly</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="notes" label="Notes">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>
            <RecurringTransactionsDetail
                visible={!!detail}
                onClose={() => setDetail(null)}
                recurring={detail}
                refreshList={fetchRecurrings}
            />
        </div>
    );
};

export default RecurringTransactions;
