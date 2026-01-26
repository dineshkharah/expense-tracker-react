import React, { useState, useEffect } from 'react'
import axios from 'axios';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Table, Calendar } from "antd";

import PageHeader from "../components/PageHeader";
import SummaryCards from "../components/SummaryCards";
import RecentTransactions from "../components/RecentTransactions";
import UpcomingRecurrings from "../components/UpcomingRecurrings";
import RecurringTransactionDetail from '../components/RecurringTransactionDetail';

const Home = () => {
    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
    });
    const [transactions, setTransactions] = useState([]);
    const [upcomingRecurrings, setUpcomingRecurrings] = useState([]);
    const [recurringModalVisible, setRecurringModalVisible] = useState(false);
    const [selectedRecurring, setSelectedRecurring] = useState(null);

    const [selectedDate, setSelectedDate] = useState(dayjs());

    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = {
                Authorization: `Bearer ${token}`,
            };

            const userRes = await axios.get(
                'http://localhost:5000/api/v1/auth/get-profile',
                { headers }
            )

            setSummary({
                balance: userRes.data.balance,
                totalIncome: userRes.data.totalIncome,
                totalExpenses: userRes.data.totalExpenses,
            })

            const transactionsRes = await axios.get(
                'http://localhost:5000/api/v1/transactions',
                { headers }
            );

            const sortedTransactions = transactionsRes.data.sort(
                (a, b) => new Date(b.date) - new Date(a.date)
            )
            setTransactions(sortedTransactions);

            const recurringRes = await axios.get(
                'http://localhost:5000/api/v1/recurring-transactions',
                { headers }
            );

            const today = new Date();
            const upcoming = recurringRes.data
                .filter((recurring) => recurring.isActive && new Date(recurring.nextDate) >= today)
                .sort((a, b) => new Date(a.nextDate) - new Date(b.nextDate))
                .slice(0, 5); // Get only the next 5 upcoming
            setUpcomingRecurrings(upcoming);

        } catch (error) {
            console.error('Error fetching data:', error);
        }

    };

    useEffect(() => {
        fetchData();
    }, []);

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
                <span
                    style={{
                        color: record.type === "income" ? "green" : "red",
                        fontWeight: "bold"
                    }}
                >
                    ₹{text}
                </span>
            )
        },
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
            render: (type) => (
                <span
                    style={{
                        color: type === "income" ? "green" : "red",
                        fontWeight: "bold"
                    }}
                >
                    {type}
                </span>
            )
        },
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
            render: (date) => (
                <span>{new Date(date).toLocaleDateString()}</span>
            )
        }
    ];
    const dayColumns = [
        {
            title: "Title",
            dataIndex: "source",
            key: "source",
            render: text => <b>{text}</b>
        },
        {
            title: "Amount",
            dataIndex: "amount",
            key: "amount",
            render: (text, record) => (
                <span style={{ color: record.type === "income" ? "green" : "red", fontWeight: 600 }}>
                    ₹{text}
                </span>
            )
        },
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
            render: type => (
                <span style={{ color: type === "income" ? "green" : "red" }}>
                    {type.toUpperCase()}
                </span>
            )
        }
    ];


    const getTransactionsForDate = (date) => {
        return transactions.filter((txn) =>
            dayjs(txn.date).isSame(date, 'day')
        );
    };

    const dateCellRender = (current) => {
        const dayTransactions = getTransactionsForDate(current);
        const hasIncome = dayTransactions.some(t => t.type === "income");
        const hasExpense = dayTransactions.some(t => t.type === "expense");
        const hasRecurring = upcomingRecurrings.some(r =>
            dayjs(r.nextDate).isSame(current, "day")
        );

        const isSelected = current.isSame(selectedDate, 'day');
        const isToday = current.isSame(dayjs(), 'day');

        return (
            <div
                className={isSelected ? "ant-picker-cell-selected" : ""}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 2px",
                    padding: "4px 0",
                    borderRadius: 6,
                    border: isToday ? "1px solid #1677ff" : "1px solid transparent",
                    backgroundColor: isSelected ? "#1677ff" : "transparent",
                    color: isSelected ? "#fff" : "inherit",
                    cursor: "pointer",
                    transition: "all 0.2s",
                }}

                onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)";
                }}
                onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                }}
            >
                <div style={{
                    fontSize: "16px",
                    fontWeight: isSelected ? "600" : "400",
                    marginBottom: "4px"
                }}>
                    {current.date()}
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                    {hasIncome && (
                        <div style={{
                            width: 6, height: 6, borderRadius: "50%",
                            backgroundColor: isSelected ? "#52c41a" : "green",
                            border: isSelected ? "1px solid #fff" : "none"
                        }} />
                    )}
                    {hasExpense && (
                        <div style={{
                            width: 6, height: 6, borderRadius: "50%",
                            backgroundColor: isSelected ? "#ff4d4f" : "red",
                            border: isSelected ? "1px solid #fff" : "none"
                        }} />
                    )}
                    {hasRecurring && (
                        <div style={{
                            width: 6, height: 6, borderRadius: "50%",
                            backgroundColor: isSelected ? "#1890ff" : "blue",
                            border: isSelected ? "1px solid #fff" : "none"
                        }} />
                    )}
                </div>
            </div>
        );
    };


    return (
        <div className="p-6">
            <PageHeader title="Home" onAdd={() => navigate("/add-transaction")} />

            <SummaryCards
                balance={summary.balance}
                totalIncome={summary.totalIncome}
                totalExpenses={summary.totalExpenses}
            />

            <Card title="Spending Calendar" className="mt-6">
                <Row gutter={16}>
                    <Col xs={24} lg={14}>
                        <Calendar
                            fullscreen={false}
                            value={selectedDate}
                            onSelect={setSelectedDate}
                            fullCellRender={dateCellRender}
                        />
                    </Col>
                    <Col xs={24} lg={10}>
                        {getTransactionsForDate(selectedDate).length === 0 ? (
                            <div
                                style={{
                                    height: 180,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    color: "#6b7280",
                                    textAlign: "center"
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
                        ) : (
                            <Table
                                dataSource={getTransactionsForDate(selectedDate)}
                                columns={dayColumns}
                                rowKey="_id"
                                pagination={false}
                                size="small"
                            />
                        )}

                    </Col>
                </Row>
            </Card>

            <RecentTransactions
                transactions={transactions.slice(0, 5)}
                columns={columns}
                onViewAll={() => navigate("/transactions")}
            />

            <UpcomingRecurrings
                recurrings={upcomingRecurrings}
                onSelectRecurring={(r) => { setSelectedRecurring(r); setRecurringModalVisible(true); }}
                onManage={() => navigate("/recurring-transactions")}
            />

            {selectedRecurring && recurringModalVisible && (
                <RecurringTransactionDetail
                    visible
                    onClose={() => setRecurringModalVisible(false)}
                    recurring={selectedRecurring}
                    refreshList={fetchData}
                />
            )}
        </div>
    );
};

export default Home;