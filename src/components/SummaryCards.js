import React from "react";
import { Card, Row, Col } from "antd";

const SummaryCards = ({ totalIncome, totalExpenses, net, month }) => {
  const netPositive = net >= 0;

  return (
    <>
      {/* Desktop: 3 cards */}
      <Row gutter={16} className="hidden md:flex">
        <Col md={8} className="p-4">
          <Card className="!bg-green-50 dark:!bg-green-950 !rounded-2xl shadow-md border-0">
            <h2 className="text-sm font-semibold text-green-800 dark:text-green-300">
              {month} Income
            </h2>
            <p className="text-2xl font-bold text-green-900 dark:text-green-200 mt-1">
              ₹{totalIncome.toLocaleString()}
            </p>
          </Card>
        </Col>

        <Col md={8} className="p-4">
          <Card className="!bg-red-50 dark:!bg-red-950 !rounded-2xl shadow-md border-0">
            <h2 className="text-sm font-semibold text-red-800 dark:text-red-300">
              {month} Expenses
            </h2>
            <p className="text-2xl font-bold text-red-900 dark:text-red-200 mt-1">
              ₹{totalExpenses.toLocaleString()}
            </p>
          </Card>
        </Col>

        <Col md={8} className="p-4">
          <Card
            className={`!rounded-2xl shadow-md border-0 ${
              netPositive
                ? "!bg-blue-50 dark:!bg-blue-950"
                : "!bg-yellow-50 dark:!bg-yellow-950"
            }`}
          >
            <h2
              className={`text-sm font-semibold ${
                netPositive
                  ? "text-blue-700 dark:text-blue-300"
                  : "text-yellow-700 dark:text-yellow-300"
              }`}
            >
              {month} Net
            </h2>
            <p
              className={`text-2xl font-bold mt-1 ${
                netPositive
                  ? "text-blue-900 dark:text-blue-200"
                  : "text-yellow-900 dark:text-yellow-200"
              }`}
            >
              {netPositive ? "+" : ""}₹{net.toLocaleString()}
            </p>
          </Card>
        </Col>
      </Row>

      {/* Mobile: 1 card */}
      <div className="block md:hidden p-4">
        <Card className="!bg-red-50 dark:!bg-red-950 !rounded-2xl shadow-md border-0">
          <p className="text-sm font-semibold text-red-800 dark:text-red-300 m-0">
            Total Spending · {month}
          </p>
          <p className="text-4xl font-bold text-red-900 dark:text-red-200 mt-1 mb-0">
            ₹{totalExpenses.toLocaleString()}
          </p>
        </Card>
      </div>
    </>
  );
};

export default SummaryCards;
