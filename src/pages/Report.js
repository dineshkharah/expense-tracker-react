import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  Row,
  Col,
  DatePicker,
  Table,
  Button,
  Modal,
  Checkbox,
  message,
  Typography,
} from "antd";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import dayjs from "dayjs";
import api from "../utils/api";
import { exportCSV, exportPDF } from "../utils/exportUtils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const { Title: PageTitle } = Typography;

const Report = () => {
  const barChartRef = useRef(null);

  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    net: 0,
  });
  const [loading, setLoading] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    summary: true,
    charts: true,
    table: true,
  });

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/v1/transactions");
      setTransactions(res.data);
    } catch (error) {
      console.error("Error fetching transactions", error);
      message.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Filter transactions by selected month
  useEffect(() => {
    const filtered = transactions.filter(
      (t) =>
        dayjs(t.date).month() === selectedMonth.month() &&
        dayjs(t.date).year() === selectedMonth.year(),
    );
    setFilteredTransactions(filtered);

    const totalIncome = filtered
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalExpenses = filtered
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    setSummary({
      totalIncome,
      totalExpenses,
      net: totalIncome - totalExpenses,
    });
  }, [transactions, selectedMonth]);

  //  Bar chart: category breakdown
  const getCategoryChartData = () => {
    const categoryMap = {};
    filteredTransactions.forEach((t) => {
      const cat = t.category || "Uncategorized";
      if (!categoryMap[cat]) categoryMap[cat] = { income: 0, expense: 0 };
      if (t.type === "income") categoryMap[cat].income += parseFloat(t.amount);
      else categoryMap[cat].expense += parseFloat(t.amount);
    });

    const labels = Object.keys(categoryMap);
    return {
      labels,
      datasets: [
        {
          label: "Income",
          data: labels.map((l) => categoryMap[l].income),
          backgroundColor: "rgba(34, 197, 94, 0.7)",
          borderRadius: 6,
        },
        {
          label: "Expenses",
          data: labels.map((l) => categoryMap[l].expense),
          backgroundColor: "rgba(239, 68, 68, 0.7)",
          borderRadius: 6,
        },
      ],
    };
  };

  //  Line chart: 6 month trend
  const getTrendData = () => {
    const months = [];
    const incomeData = [];
    const expenseData = [];

    for (let i = 5; i >= 0; i--) {
      const date = dayjs().subtract(i, "month");
      months.push(date.format("MMM YYYY"));

      const monthTx = transactions.filter(
        (t) =>
          dayjs(t.date).month() === date.month() &&
          dayjs(t.date).year() === date.year(),
      );

      incomeData.push(
        monthTx
          .filter((t) => t.type === "income")
          .reduce((s, t) => s + parseFloat(t.amount), 0),
      );
      expenseData.push(
        monthTx
          .filter((t) => t.type === "expense")
          .reduce((s, t) => s + parseFloat(t.amount), 0),
      );
    }

    return {
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
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" } },
  };

  // Table columns
  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (d) => dayjs(d).format("DD MMM YYYY"),
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
    { title: "Source", dataIndex: "source", key: "source" },
    { title: "Category", dataIndex: "category", key: "category" },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amt, record) => (
        <span
          className={`font-bold ${record.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
        >
          ₹{parseFloat(amt).toLocaleString()}
        </span>
      ),
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      render: (n) => n || "-",
    },
  ];

  const handleExportPDF = () => {
    if (
      !exportOptions.summary &&
      !exportOptions.charts &&
      !exportOptions.table
    ) {
      message.warning("Please select at least one option to export");
      return;
    }
    const chartImage = barChartRef.current?.toBase64Image();
    exportPDF({
      transactions: filteredTransactions,
      summary,
      chartImage: exportOptions.charts ? chartImage : null,
      options: exportOptions,
      month: selectedMonth.format("MMMM YYYY"),
    });
    setExportModalVisible(false);
  };

  const netPositive = summary.net >= 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <PageTitle level={2} className="!m-0 !mb-4">
          Report
        </PageTitle>
        <DatePicker
          picker="month"
          value={selectedMonth}
          onChange={(date) => setSelectedMonth(date || dayjs())}
          format="MMMM YYYY"
          allowClear={false}
          inputReadOnly
          className="cursor-pointer"
          disabledDate={(current) =>
            current && current > dayjs().endOf("month")
          }
        />
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={8}>
          <Card className="text-center !bg-green-50 dark:!bg-green-950 !rounded-2xl border-0 shadow-md">
            <p className="text-sm font-semibold text-green-800 dark:text-green-300">
              Total Income
            </p>
            <p className="text-2xl font-bold text-green-900 dark:text-green-200">
              ₹{summary.totalIncome.toLocaleString()}
            </p>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="text-center !bg-red-50 dark:!bg-red-950 !rounded-2xl border-0 shadow-md">
            <p className="text-sm font-semibold text-red-800 dark:text-red-300">
              Total Expenses
            </p>
            <p className="text-2xl font-bold text-red-900 dark:text-red-200">
              ₹{summary.totalExpenses.toLocaleString()}
            </p>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            className={`text-center !rounded-2xl border-0 shadow-md ${netPositive ? "!bg-blue-50 dark:!bg-blue-950" : "!bg-yellow-50 dark:!bg-yellow-950"}`}
          >
            <p
              className={`text-sm font-semibold ${netPositive ? "text-blue-700 dark:text-blue-300" : "text-yellow-700 dark:text-yellow-300"}`}
            >
              Net
            </p>
            <p
              className={`text-2xl font-bold ${netPositive ? "text-blue-900 dark:text-blue-200" : "text-yellow-900 dark:text-yellow-200"}`}
            >
              {netPositive ? "+" : ""}₹{summary.net.toLocaleString()}
            </p>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12} className="flex">
          <Card title="Spending by Category" className="w-full">
            <div className="h-72">
              <Bar
                ref={barChartRef}
                data={getCategoryChartData()}
                options={chartOptions}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12} className="flex">
          <Card title="6 Month Trend" className="w-full">
            <div className="h-72">
              <Line data={getTrendData()} options={chartOptions} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Transactions Table */}
      <Card
        title={`Transactions — ${selectedMonth.format("MMMM YYYY")}`}
        className="mb-6"
      >
        <Table
          columns={columns}
          dataSource={filteredTransactions}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      </Card>

      {/* Export Buttons */}
      <div className="flex gap-4">
        <Button type="primary" onClick={() => setExportModalVisible(true)}>
          Export as PDF
        </Button>
        <Button onClick={() => exportCSV(filteredTransactions)}>
          Export as CSV
        </Button>
      </div>

      {/* PDF Export Modal */}
      <Modal
        title="Export PDF Options"
        open={exportModalVisible}
        onOk={handleExportPDF}
        onCancel={() => setExportModalVisible(false)}
        okText="Export"
        cancelText="Cancel"
      >
        <p className="mb-4 text-gray-500">Select what to include in the PDF:</p>
        <div className="flex flex-col gap-3">
          <Checkbox
            checked={exportOptions.summary}
            onChange={(e) =>
              setExportOptions((prev) => ({
                ...prev,
                summary: e.target.checked,
              }))
            }
          >
            Summary (Income, Expenses, Net)
          </Checkbox>
          <Checkbox
            checked={exportOptions.charts}
            onChange={(e) =>
              setExportOptions((prev) => ({
                ...prev,
                charts: e.target.checked,
              }))
            }
          >
            Charts
          </Checkbox>
          <Checkbox
            checked={exportOptions.table}
            onChange={(e) =>
              setExportOptions((prev) => ({ ...prev, table: e.target.checked }))
            }
          >
            Transactions Table
          </Checkbox>
        </div>
      </Modal>
    </div>
  );
};

export default Report;
