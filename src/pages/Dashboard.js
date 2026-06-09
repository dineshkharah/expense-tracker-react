import React, { useEffect, useState, useCallback } from "react";
import api from "../utils/api";
import { Card, Row, Col } from "antd";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import PageHeader from "../components/PageHeader";
import SummaryCards from "../components/SummaryCards";
import { useNavigate } from "react-router-dom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

const Dashboard = ({ embedded = false }) => {
  const navigate = useNavigate();

  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    net: 0,
    month: "",
  });
  const [transactions, setTransactions] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const [summaryRes, transactionsRes] = await Promise.all([
        api.get("/api/v1/transactions/monthly-summary"),
        api.get("/api/v1/transactions"),
      ]);

      setSummary({
        totalIncome: summaryRes.data.totalIncome,
        totalExpenses: summaryRes.data.totalExpenses,
        net: summaryRes.data.net,
        month: summaryRes.data.month,
      });

      setTransactions(transactionsRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  //  Last 6 months bar chart data
  const getLast6MonthsData = () => {
    const months = [];
    const incomeData = [];
    const expenseData = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear();
      const monthIndex = date.getMonth();

      months.push(month);

      const monthTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === monthIndex && tDate.getFullYear() === year;
      });

      incomeData.push(
        monthTransactions
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + parseFloat(t.amount), 0),
      );

      expenseData.push(
        monthTransactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + parseFloat(t.amount), 0),
      );
    }

    return { months, incomeData, expenseData };
  };

  //  Category donut chart data
  const getCategoryData = () => {
    const categoryMap = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const cat = t.category || "Uncategorized";
        categoryMap[cat] = (categoryMap[cat] || 0) + parseFloat(t.amount);
      });

    const sorted = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    return {
      labels: sorted.map(([cat]) => cat),
      amounts: sorted.map(([, amt]) => amt),
    };
  };

  const { months, incomeData, expenseData } = getLast6MonthsData();
  const categoryData = getCategoryData();

  const barData = {
    labels: months,
    datasets: [
      {
        label: "Income",
        data: incomeData,
        backgroundColor: "rgba(34, 197, 94, 0.7)",
        borderRadius: 6,
      },
      {
        label: "Expenses",
        data: expenseData,
        backgroundColor: "rgba(239, 68, 68, 0.7)",
        borderRadius: 6,
      },
    ],
  };

  const doughnutData = {
    labels: categoryData.labels,
    datasets: [
      {
        data: categoryData.amounts,
        backgroundColor: [
          "#6366f1",
          "#f59e0b",
          "#10b981",
          "#ef4444",
          "#3b82f6",
          "#ec4899",
        ],
        borderWidth: 2,
      },
    ],
  };

  const lineData = {
    labels: months,
    datasets: [
      {
        label: "Income",
        data: incomeData,
        borderColor: "rgba(34, 197, 94, 1)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Expenses",
        data: expenseData,
        borderColor: "rgba(239, 68, 68, 1)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
    },
  };

  return (
    <div className={embedded ? "" : "p-6"}>
      {!embedded && (
        <PageHeader
          title="Dashboard"
          onAdd={() => navigate("/add-transaction")}
        />
      )}

      <SummaryCards
        totalIncome={summary.totalIncome}
        totalExpenses={summary.totalExpenses}
        net={summary.net}
        month={summary.month}
      />

      <Row gutter={[16, 16]} className="mt-6">
        {/* Doughnut Chart */}
        <Col xs={24} lg={12} className="flex items-stretch">
          <Card title="Spending by Category" className="w-full">
            <div className="h-72">
              <Doughnut
                data={doughnutData}
                options={{ ...chartOptions, maintainAspectRatio: false }}
              />
            </div>
          </Card>
        </Col>

        {/* Bar Chart */}
        <Col xs={24} lg={12} className="flex">
          <Card title="Income vs Expenses - Last 6 Months" className="w-full">
            <div className="h-72">
              <Bar
                data={barData}
                options={{ ...chartOptions, maintainAspectRatio: false }}
              />
            </div>
          </Card>
        </Col>

        {/* Line Chart */}
        <Col xs={24} lg={24} className="flex">
          <Card title="Monthly Trend" className="w-full">
            <div className="h-72">
              <Line
                data={lineData}
                options={{ ...chartOptions, maintainAspectRatio: false }}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
