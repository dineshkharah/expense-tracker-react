import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col } from "antd";

import PageHeader from "../components/PageHeader";
import SummaryCards from "../components/SummaryCards";
import RecentTransactions from "../components/RecentTransactions";
import UpcomingRecurrings from "../components/UpcomingRecurrings";
import RecurringTransactionDetail from "../components/RecurringTransactionDetail";
import SpendingCalendar from "../components/SpendingCalendar";
import DayTransactionsPanel from "../components/DayTransactionsPanel";

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
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const userRes = await axios.get(
        "http://localhost:5000/api/v1/auth/get-profile",
        { headers },
      );

      setSummary({
        balance: userRes.data.balance,
        totalIncome: userRes.data.totalIncome,
        totalExpenses: userRes.data.totalExpenses,
      });

      const transactionsRes = await axios.get(
        "http://localhost:5000/api/v1/transactions",
        { headers },
      );

      const sortedTransactions = transactionsRes.data.sort(
        (a, b) => new Date(b.date) - new Date(a.date),
      );
      setTransactions(sortedTransactions);

      const recurringRes = await axios.get(
        "http://localhost:5000/api/v1/recurring-transactions",
        { headers },
      );

      const today = new Date();
      const upcoming = recurringRes.data
        .filter(
          (recurring) =>
            recurring.isActive && new Date(recurring.nextDate) >= today,
        )
        .sort((a, b) => new Date(a.nextDate) - new Date(b.nextDate))
        .slice(0, 5); // Get only the next 5 upcoming
      setUpcomingRecurrings(upcoming);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text, record) => (
        <span
          style={{
            color: record.type === "income" ? "green" : "red",
            fontWeight: "bold",
          }}
        >
          ₹{text}
        </span>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <span
          style={{
            color: type === "income" ? "green" : "red",
            fontWeight: "bold",
          }}
        >
          {type}
        </span>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => <span>{new Date(date).toLocaleDateString()}</span>,
    },
  ];

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
            <SpendingCalendar
              transactions={transactions}
              upcomingRecurrings={upcomingRecurrings}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          </Col>

          <Col xs={24} lg={10}>
            <DayTransactionsPanel
              selectedDate={selectedDate}
              transactions={transactions}
            />
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
        onSelectRecurring={(r) => {
          setSelectedRecurring(r);
          setRecurringModalVisible(true);
        }}
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
