import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import PageHeader from "../components/PageHeader";
import SummaryCards from "../components/SummaryCards";
import RecentTransactions from "../components/RecentTransactions";
import UpcomingRecurrings from "../components/UpcomingRecurrings";
import RecurringTransactionDetail from '../components/RecurringTransactionDetail';

// const { Title } = Typography;

const DashBoard = () => {
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

    // const handleOpenRecurringModal = (recurring) => {
    //     setSelectedRecurring(recurring);
    //     setRecurringModalVisible(true);
    // }

    // const handleCloseRecurringModal = () => {
    //     setRecurringModalVisible(false);
    //     setSelectedRecurring(null);
    //     fetchData();
    // }

    return (
        <div className="p-6">
            <PageHeader title="Dashboard" onAdd={() => navigate("/add-transaction")} />

            <SummaryCards
                balance={summary.balance}
                totalIncome={summary.totalIncome}
                totalExpenses={summary.totalExpenses}
            />

            <RecentTransactions
                transactions={transactions}
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

export default DashBoard;