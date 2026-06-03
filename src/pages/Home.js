import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "../utils/api";
import dayjs from "dayjs";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, Row, Col } from "antd";

import PageHeader from "../components/PageHeader";
import SummaryCards from "../components/SummaryCards";
import RecentTransactions from "../components/RecentTransactions";
import UpcomingRecurrings from "../components/UpcomingRecurrings";
import RecurringTransactionDetail from "../components/RecurringTransactionDetail";
import SpendingCalendar from "../components/SpendingCalendar";
import DayTransactionsPanel from "../components/DayTransactionsPanel";
import OnboardingTour from "../components/OnboardingTour";

const TOUR_FLAG = "trackr_tour_done";

const Home = () => {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    net: 0,
    month: "",
  });
  const [transactions, setTransactions] = useState([]);
  const [upcomingRecurrings, setUpcomingRecurrings] = useState([]);
  const [recurringModalVisible, setRecurringModalVisible] = useState(false);
  const [selectedRecurring, setSelectedRecurring] = useState(null);

  const [selectedDate, setSelectedDate] = useState(dayjs());

  const navigate = useNavigate();
  const location = useLocation();

  // Onboarding tour
  const [tourOpen, setTourOpen] = useState(false);
  const summaryRef = useRef(null);
  const calendarRef = useRef(null);

  useEffect(() => {
    // Replay requested from Profile (via router state), or first-time visit.
    const replay = location.state?.startTour;
    const firstTime = !localStorage.getItem(TOUR_FLAG);
    if (!replay && !firstTime) return;

    if (replay) {
      navigate(location.pathname, { replace: true, state: {} });
    }

    // Let the page lay out before opening so the spotlights land correctly.
    const t = setTimeout(() => setTourOpen(true), 400);
    return () => clearTimeout(t);
  }, [location.state, location.pathname, navigate]);

  const closeTour = () => {
    setTourOpen(false);
    localStorage.setItem(TOUR_FLAG, "1");
  };

  const fetchData = useCallback(async () => {
    try {
      const userRes = await api.get("/api/v1/transactions/monthly-summary");

      setSummary({
        totalIncome: userRes.data.totalIncome,
        totalExpenses: userRes.data.totalExpenses,
        net: userRes.data.net,
        month: userRes.data.month,
      });

      const transactionsRes = await api.get("/api/v1/transactions");

      const sortedTransactions = transactionsRes.data.sort(
        (a, b) => new Date(b.date) - new Date(a.date),
      );
      setTransactions(sortedTransactions);

      const recurringRes = await api.get("/api/v1/recurring-transactions");

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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
          className={`font-bold ${record.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
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
          className={`font-bold ${type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
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
    <div className="max-w-6xl mx-auto px-1 sm:px-4 py-2">
      <PageHeader
        title="Overview"
        subtitle="Here's what's happening with your money this month."
        onAdd={() => navigate("/add-transaction")}
      />

      <div ref={summaryRef}>
        <SummaryCards
          totalIncome={summary.totalIncome}
          totalExpenses={summary.totalExpenses}
          net={summary.net}
          month={summary.month}
        />
      </div>

      <div ref={calendarRef}>
        <Card
          title="Spending Calendar"
          className="mt-6 !rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm"
        >
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
      </div>

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

      <OnboardingTour
        open={tourOpen}
        onClose={closeTour}
        summaryRef={summaryRef}
        calendarRef={calendarRef}
      />
    </div>
  );
};

export default Home;
