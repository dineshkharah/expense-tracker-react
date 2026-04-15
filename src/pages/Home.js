import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Table, Calendar } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

import PageHeader from "../components/PageHeader";
import SummaryCards from "../components/SummaryCards";
import RecentTransactions from "../components/RecentTransactions";
import UpcomingRecurrings from "../components/UpcomingRecurrings";
import RecurringTransactionDetail from "../components/RecurringTransactionDetail";

const NavButton = ({ onClick, children }) => {
  return (
    <div
      onClick={onClick}
      className="
        w-8 h-8
        flex items-center justify-center
        rounded-full
        cursor-pointer
        transition-all duration-200
        hover:bg-gray-100 hover:scale-110
      "
    >
      {children}
    </div>
  );
};

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

  const [calendarKey, setCalendarKey] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);

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
  const dayColumns = [
    {
      title: "Title",
      dataIndex: "source",
      key: "source",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text, record) => (
        <span
          style={{
            color: record.type === "income" ? "green" : "red",
            fontWeight: 600,
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
        <span style={{ color: type === "income" ? "green" : "red" }}>
          {type.toUpperCase()}
        </span>
      ),
    },
  ];

  const getTransactionsForDate = (date) => {
    return transactions.filter((txn) => dayjs(txn.date).isSame(date, "day"));
  };

  const dateCellRender = (current) => {
    const dayTransactions = getTransactionsForDate(current);
    const hasIncome = dayTransactions.some((t) => t.type === "income");
    const hasExpense = dayTransactions.some((t) => t.type === "expense");
    const hasRecurring = upcomingRecurrings.some((r) =>
      dayjs(r.nextDate).isSame(current, "day"),
    );

    const isSelected = current.isSame(selectedDate, "day");
    const isToday = current.isSame(dayjs(), "day");

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
          if (!isSelected)
            e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)";
        }}
        onMouseLeave={(e) => {
          if (!isSelected)
            e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <div
          style={{
            fontSize: "16px",
            fontWeight: isSelected ? "600" : "400",
            marginBottom: "4px",
          }}
        >
          {current.date()}
        </div>

        <div style={{ display: "flex", gap: "6px" }}>
          {hasIncome && (
            <div
              className={`
                w-1.5 h-1.5 rounded-full
                transition-all duration-300
                ${isSelected ? "bg-green-400 scale-110" : "bg-green-600 scale-90"}
                animate-pulse
              `}
            />
          )}
          {hasExpense && (
            <div
              className={`
                w-1.5 h-1.5 rounded-full
                transition-all duration-300
                ${isSelected ? "bg-red-400 scale-110" : "bg-red-600 scale-90"}
                animate-pulse
              `}
            />
          )}
          {hasRecurring && (
            <div
              className={`
              w-1.5 h-1.5 rounded-full
              transition-all duration-300
              ${isSelected ? "bg-blue-400 scale-110" : "bg-blue-600 scale-90"}
              animate-pulse
            `}
            />
          )}
        </div>
      </div>
    );
  };

  const handleMonthChange = (direction) => {
    let newDate;

    if (direction === "prev") {
      setSwipeDirection("right");
      newDate = selectedDate.subtract(1, "month").date(1);
    } else {
      setSwipeDirection("left");
      newDate = selectedDate.add(1, "month").date(1);
    }

    setSelectedDate(newDate);
    setCalendarKey((prev) => prev + 1); // keep animation
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || touchStartX === null) return;

    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX;

    setDragX(diff); // 🔥 move with finger
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const threshold = 80;

    if (dragX < -threshold) {
      setSwipeDirection("left");
      handleMonthChange("next");
    } else if (dragX > threshold) {
      setSwipeDirection("right");
      handleMonthChange("prev");
    }

    // reset with animation
    setDragX(0);
    setIsDragging(false);
    setTouchStartX(null);

    setTimeout(() => {
      setCalendarKey((prev) => prev + 1);
    }, 0);
  };

  const prevMonth = selectedDate.subtract(1, "month");
  const nextMonth = selectedDate.add(1, "month");

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
            {/* FIXED HEADER (does NOT move on swipe) */}
            {(() => {
              const currentYear = selectedDate.year();
              const thisYear = dayjs().year();

              const monthShort = selectedDate.format("MMM");
              const monthFull = selectedDate.format("MMMM");

              const displayText =
                currentYear === thisYear
                  ? monthShort
                  : `${monthFull} ${currentYear}`;

              return (
                <div className="flex items-center justify-center gap-4 mb-3">
                  <NavButton onClick={() => handleMonthChange("prev")}>
                    <LeftOutlined />
                  </NavButton>

                  <div
                    key={selectedDate.format("YYYY-MM")}
                    className={`
                        font-semibold
                      transition-all duration-300 ease-in-out
                      ${
                        swipeDirection === "left"
                          ? "animate-slide-left"
                          : swipeDirection === "right"
                            ? "animate-slide-right"
                            : ""
                      }
                    `}
                  >
                    {displayText}
                  </div>

                  <NavButton onClick={() => handleMonthChange("next")}>
                    <RightOutlined />
                  </NavButton>
                </div>
              );
            })()}
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: "300%", // prev | current | next
                  transform: `translateX(calc(-33.3333% + ${dragX}px))`,
                  transition: isDragging
                    ? "none"
                    : "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                {/* PREVIOUS MONTH */}
                <div style={{ width: "100%" }}>
                  <Calendar
                    fullscreen={false}
                    value={prevMonth}
                    fullCellRender={dateCellRender}
                    headerRender={() => null} // hide header
                  />
                </div>

                {/* CURRENT MONTH */}
                <div style={{ width: "100%" }}>
                  <Calendar
                    key={calendarKey}
                    fullscreen={false}
                    value={selectedDate}
                    onSelect={setSelectedDate}
                    fullCellRender={dateCellRender}
                    headerRender={() => null}
                    // headerRender={({ value }) => {
                    //   const current = value.clone();
                    //   const currentYear = current.year();
                    //   const thisYear = dayjs().year();

                    //   const monthShort = current.format("MMM");
                    //   const monthFull = current.format("MMMM");

                    //   const displayText =
                    //     currentYear === thisYear
                    //       ? monthShort
                    //       : `${monthFull} ${currentYear}`;

                    //   return (
                    //     <div className="flex items-center justify-center gap-4 mb-3">
                    //       <NavButton onClick={() => handleMonthChange("prev")}>
                    //         <LeftOutlined />
                    //       </NavButton>

                    //       <div style={{ fontWeight: 600 }}>{displayText}</div>

                    //       <NavButton onClick={() => handleMonthChange("next")}>
                    //         <RightOutlined />
                    //       </NavButton>
                    //     </div>
                    //   );
                    // }}
                  />
                </div>

                {/* NEXT MONTH */}
                <div style={{ width: "100%" }}>
                  <Calendar
                    fullscreen={false}
                    value={nextMonth}
                    fullCellRender={dateCellRender}
                    headerRender={() => null}
                  />
                </div>
              </div>
            </div>
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
                  textAlign: "center",
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
