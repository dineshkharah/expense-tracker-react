import React, { useState } from "react";
import dayjs from "dayjs";
import { Calendar } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

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

const SpendingCalendar = ({
  transactions,
  upcomingRecurrings,
  selectedDate,
  setSelectedDate,
}) => {
  const [calendarKey, setCalendarKey] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);

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
    setCalendarKey((prev) => prev + 1);
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || touchStartX === null) return;

    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX;

    setDragX(diff);
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

    setDragX(0);
    setIsDragging(false);
    setTouchStartX(null);

    setTimeout(() => {
      setCalendarKey((prev) => prev + 1);
    }, 0);
  };

  const prevMonth = selectedDate.subtract(1, "month");
  const nextMonth = selectedDate.add(1, "month");

  const currentYear = selectedDate.year();
  const thisYear = dayjs().year();

  const monthShort = selectedDate.format("MMM");
  const monthFull = selectedDate.format("MMMM");

  const displayText =
    currentYear === thisYear ? monthShort : `${monthFull} ${currentYear}`;

  return (
    <div>
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
            width: "300%",
            transform: `translateX(calc(-33.3333% + ${dragX}px))`,
            transition: isDragging
              ? "none"
              : "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {/* PREV */}
          <div style={{ width: "100%" }}>
            <Calendar
              fullscreen={false}
              value={prevMonth}
              fullCellRender={dateCellRender}
              headerRender={() => null}
            />
          </div>

          {/* CURRENT */}
          <div style={{ width: "100%" }}>
            <Calendar
              key={calendarKey}
              fullscreen={false}
              value={selectedDate}
              onSelect={setSelectedDate}
              fullCellRender={dateCellRender}
              headerRender={() => null}
            />
          </div>

          {/* NEXT */}
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
    </div>
  );
};

export default SpendingCalendar;
