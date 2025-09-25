import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Row, Col, Table, Typography, Button } from "antd";
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const Home = () => {
    const [summary, setSummary] = useState({
        balance: 0,
        totalIncome: 0,
        totalExpenses: 0
    });
    const [transactions, setTransactions] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await axios.get('http://localhost:5000/api/v1/auth/get-profile', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                setSummary({
                    balance: userRes.data.balance,
                    totalIncome: userRes.data.totalIncome,
                    totalExpenses: userRes.data.totalExpenses
                });

                const transactionRes = await axios.get('http://localhost:5000/api/v1/transactions', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                setTransactions(transactionRes.data.slice(0, 5));
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
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

    return (
        <div className='p-6'>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
                <Title level={2} style={{ margin: "0" }}>Dashboard</Title>
                <Button type="primary" size='medium' onClick={() => navigate('/add-transaction')} style={{ marginLeft: 'auto' }}>
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
                        <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "#1d4ed8" }}>
                            Balance
                        </h2>
                        <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e3a8a" }}>
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
                        <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "#166534" }}>
                            Total Income
                        </h2>
                        <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#14532d" }}>
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
                        <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "#991b1b" }}>
                            Total Expenses
                        </h2>
                        <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#7f1d1d" }}>
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
                        onClick={() => navigate('/transactions')}
                        style={{ fontSize: '14px' }}
                    >
                        View All
                    </Button>
                }
            >
                <Table
                    dataSource={[...transactions].sort((a, b) => new Date(b.date) - new Date(a.date))}
                    columns={columns}
                    rowKey="_id"
                    pagination={false}
                    locale={{ emptyText: 'No transactions found' }}
                    scroll={{ x: "max-content" }}
                    className="min-w-full"
                />
            </Card>

        </div>


    );
};

export default Home;