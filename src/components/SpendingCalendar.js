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
        dark:hover:bg-slate-700/50  text-gray-600
        dark:text-slate-300
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
        className={`flex flex-col items-center justify-center mx-0.5 py-1 rounded-md cursor-pointer transition-all duration-200 ${
          isSelected
            ? "bg-blue-500 text-white"
            : isToday
              ? "border border-blue-500 hover:bg-black/5 dark:hover:bg-white/10"
              : "border border-transparent hover:bg-black/5 dark:hover:bg-white/10"
        }`}
      >
        <div
          className={`text-base mb-1 ${isSelected ? "font-semibold" : "font-normal"}`}
        >
          {current.date()}
        </div>

        <div className="flex gap-1.5">
          {hasIncome && (
            <div
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 animate-pulse ${isSelected ? "bg-green-300" : "bg-green-600"}`}
            />
          )}
          {hasExpense && (
            <div
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 animate-pulse ${isSelected ? "bg-red-300" : "bg-red-600"}`}
            />
          )}
          {hasRecurring && (
            <div
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 animate-pulse ${isSelected ? "bg-blue-200" : "bg-blue-600"}`}
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
        className="overflow-hidden relative"
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
          <div className="w-full">
            <Calendar
              fullscreen={false}
              value={prevMonth}
              fullCellRender={dateCellRender}
              headerRender={() => null}
            />
          </div>

          {/* CURRENT */}
          <div className="w-full">
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
          <div className="w-full">
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
