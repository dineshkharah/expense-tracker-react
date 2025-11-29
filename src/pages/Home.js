import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Row, Col, Table, Typography, Button } from "antd";
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import RecurringTransactionDetail from '../components/RecurringTransactionDetail';

const { Title } = Typography;

const Home = () => {
    const [summary, setSummary] = useState({
        balance: 0,
        totalIncome: 0,
        totalExpenses: 0
    });
    const [transactions, setTransactions] = useState([]);
    const [upcomingRecurrings, setUpcomingRecurrings] = useState([]);
    const [recurringModalVisible, setRecurringModalVisible] = useState(false);
    const [selectedRecurring, setSelectedRecurring] = useState(null);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = {
                Authorization: `Bearer ${token}`
            };

            const userRes = await axios.get('http://localhost:5000/api/v1/auth/get-profile',
                { headers }
            );

            setSummary({
                balance: userRes.data.balance,
                totalIncome: userRes.data.totalIncome,
                totalExpenses: userRes.data.totalExpenses
            });

            const transactionRes = await axios.get('http://localhost:5000/api/v1/transactions',
                { headers }
            );

            const sorted = transactionRes.data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setTransactions(sorted.slice(0, 5));

            const recurringRes = await axios.get('http://localhost:5000/api/v1/recurring-transactions',
                { headers }
            );

            const today = new Date();
            const upcoming = recurringRes.data
                .filter((r) => r.isActive && new Date(r.nextDate) >= today)
                .sort(
                    (a, b) => new Date(a.nextDate) - new Date(b.nextDate)
                )
                .slice(0, 3); // show only next 3 upcoming
            setUpcomingRecurrings(upcoming);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Table Columns
    const columns = [
        {
            title: "Source",
            dataIndex: "source",
            key: "source"
        },
        {
            title: "Category",
            dataIndex: "category",
            key: "category"
        },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            render: (text, record) => (
                <span style={{ color: record.type === "income" ? "green" : "red", fontWeight: "bold" }}>
                    ₹{text}
                </span>
            ),
        },
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
            render: (type) => (
                <span style={{ color: type === "income" ? "green" : "red", fontWeight: "bold" }}>
                    {type}
                </span>
            ),
        },
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
            render: (date) => (
                <span>
                    {new Date(date).toLocaleDateString()}
                </span>
            )
        }
    ]

    const handleOpenRecurringModal = (recurring) => {
        setSelectedRecurring(recurring);
        setRecurringModalVisible(true);
    }

    const handleCloseRecurringModal = () => {
        setRecurringModalVisible(false);
        setSelectedRecurring(null);
        fetchData();
    }

    return (
        <div className="p-6">
            {/* Header + Add Transaction */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                }}
            >
                <Title level={2} style={{ margin: "0" }}>
                    Dashboard
                </Title>
                <Button
                    type="primary"
                    size="medium"
                    onClick={() => navigate("/add-transaction")}
                    style={{ marginLeft: "auto" }}
                >
                    + Add Transaction
                </Button>
            </div>

            {/* Summary Cards */}
            <Row gutter={16}>
                <Col xs={24} md={8} style={{ padding: "1rem" }}>
                    <Card
                        style={{
                            background: "#e0f2fe",
                            borderRadius: "16px",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                        }}
                    >
                        <h2
                            style={{
                                fontSize: "1rem",
                                fontWeight: "600",
                                color: "#1d4ed8",
                            }}
                        >
                            Balance
                        </h2>
                        <p
                            style={{
                                fontSize: "1.5rem",
                                fontWeight: "bold",
                                color: "#1e3a8a",
                            }}
                        >
                            ₹{summary.balance}
                        </p>
                    </Card>
                </Col>

                <Col xs={24} md={8} style={{ padding: "1rem" }}>
                    <Card
                        style={{
                            background: "#dcfce7",
                            borderRadius: "16px",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                        }}
                    >
                        <h2
                            style={{
                                fontSize: "1rem",
                                fontWeight: "600",
                                color: "#166534",
                            }}
                        >
                            Total Income
                        </h2>
                        <p
                            style={{
                                fontSize: "1.5rem",
                                fontWeight: "bold",
                                color: "#14532d",
                            }}
                        >
                            ₹{summary.totalIncome}
                        </p>
                    </Card>
                </Col>

                <Col xs={24} md={8} style={{ padding: "1rem" }}>
                    <Card
                        style={{
                            background: "#fee2e2",
                            borderRadius: "16px",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                        }}
                    >
                        <h2
                            style={{
                                fontSize: "1rem",
                                fontWeight: "600",
                                color: "#991b1b",
                            }}
                        >
                            Total Expenses
                        </h2>
                        <p
                            style={{
                                fontSize: "1.5rem",
                                fontWeight: "bold",
                                color: "#7f1d1d",
                            }}
                        >
                            ₹{summary.totalExpenses}
                        </p>
                    </Card>
                </Col>
            </Row>

            {/* Recent Transactions */}
            <Card
                title="Recent Transactions"
                className="mt-6"
                extra={
                    <Button
                        type="link"
                        onClick={() => navigate("/transactions")}
                        style={{ fontSize: "14px" }}
                    >
                        View All
                    </Button>
                }
            >
                <Table
                    dataSource={transactions}
                    columns={columns}
                    rowKey="_id"
                    pagination={false}
                    locale={{ emptyText: "No transactions found" }}
                    scroll={{ x: "max-content" }}
                    className="min-w-full"
                />
            </Card>

            {/* Upcoming Recurring Payments & Income */}
            <Card
                title="Upcoming Recurring Payments & Income"
                className="mt-6"
                extra={
                    <Button
                        type="link"
                        onClick={() => navigate("/recurring-transactions")}
                        style={{ fontSize: "14px" }}
                    >
                        Manage Recurring
                    </Button>
                }
            >
                {upcomingRecurrings.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                        No upcoming recurring payments in the next cycles.
                    </p>
                ) : (
                    <Row gutter={[16, 16]}>
                        {upcomingRecurrings.map((r) => (
                            <Col xs={24} md={8} key={r._id}>
                                <Card
                                    size="small"
                                    style={{
                                        borderRadius: "12px",
                                        boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            marginBottom: 4,
                                        }}
                                    >
                                        <span style={{ fontWeight: 600 }}>{r.source}</span>
                                        <span
                                            style={{
                                                fontSize: "0.75rem",
                                                fontWeight: 600,
                                                color: r.type === "income" ? "#16a34a" : "#b91c1c",
                                            }}
                                        >
                                            {r.type === "income" ? "INCOME" : "EXPENSE"}
                                        </span>
                                    </div>

                                    <p
                                        style={{
                                            fontSize: "0.8rem",
                                            color: "#6b7280",
                                            marginBottom: 4,
                                        }}
                                    >
                                        {r.category}
                                    </p>

                                    <p
                                        style={{
                                            fontSize: "0.9rem",
                                            fontWeight: 600,
                                            marginBottom: 2,
                                        }}
                                    >
                                        ₹
                                        {r.latestAmount ??
                                            (r.amounts &&
                                                r.amounts.length &&
                                                typeof r.amounts[r.amounts.length - 1].amount ===
                                                "number"
                                                ? r.amounts[r.amounts.length - 1].amount
                                                : "-")}
                                    </p>

                                    <p
                                        style={{
                                            fontSize: "0.75rem",
                                            color: "#6b7280",
                                            marginBottom: 8,
                                        }}
                                    >
                                        Next on {dayjs(r.nextDate).format("DD MMM YYYY")}
                                    </p>

                                    <Button
                                        size="small"
                                        type="link"
                                        onClick={() => handleOpenRecurringModal(r)}
                                        style={{ padding: 0 }}
                                    >
                                        View / Take Action
                                    </Button>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Card>

            {/* Recurring detail modal (reused) */}
            {selectedRecurring && recurringModalVisible && (
                <RecurringTransactionDetail
                    visible={recurringModalVisible}
                    onClose={handleCloseRecurringModal}
                    recurring={selectedRecurring}
                    refreshList={fetchData}
                />
            )}
        </div>
    );
};

export default Home;