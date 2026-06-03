import React from "react";
import { Row, Col } from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  WalletOutlined,
} from "@ant-design/icons";

const StatCard = ({ icon, label, value, accent }) => (
  <div
    className={`relative overflow-hidden rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 transition-transform duration-200 hover:-translate-y-1 hover:shadow-md`}
  >
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-500 dark:text-slate-400">
        {label}
      </span>
      <span
        className={`flex items-center justify-center w-9 h-9 rounded-full ${accent.iconBg} ${accent.iconText}`}
      >
        {icon}
      </span>
    </div>
    <p className={`text-2xl font-bold mt-3 mb-0 ${accent.value}`}>{value}</p>
    {/* accent strip */}
    <div className={`absolute left-0 top-0 h-full w-1 ${accent.strip}`} />
  </div>
);

const SummaryCards = ({ totalIncome, totalExpenses, net, month }) => {
  const netPositive = net >= 0;

  const incomeAccent = {
    iconBg: "bg-green-100 dark:bg-green-900/40",
    iconText: "text-green-600 dark:text-green-400",
    value: "text-green-700 dark:text-green-300",
    strip: "bg-green-500",
  };
  const expenseAccent = {
    iconBg: "bg-red-100 dark:bg-red-900/40",
    iconText: "text-red-600 dark:text-red-400",
    value: "text-red-700 dark:text-red-300",
    strip: "bg-red-500",
  };
  const netAccent = netPositive
    ? {
        iconBg: "bg-blue-100 dark:bg-blue-900/40",
        iconText: "text-blue-600 dark:text-blue-400",
        value: "text-blue-700 dark:text-blue-300",
        strip: "bg-blue-500",
      }
    : {
        iconBg: "bg-amber-100 dark:bg-amber-900/40",
        iconText: "text-amber-600 dark:text-amber-400",
        value: "text-amber-700 dark:text-amber-300",
        strip: "bg-amber-500",
      };

  return (
    <>
      {/* Desktop: 3 cards */}
      <Row gutter={[16, 16]} className="hidden md:flex">
        <Col md={8}>
          <StatCard
            icon={<ArrowUpOutlined />}
            label={`${month} Income`}
            value={`₹${totalIncome.toLocaleString()}`}
            accent={incomeAccent}
          />
        </Col>
        <Col md={8}>
          <StatCard
            icon={<ArrowDownOutlined />}
            label={`${month} Expenses`}
            value={`₹${totalExpenses.toLocaleString()}`}
            accent={expenseAccent}
          />
        </Col>
        <Col md={8}>
          <StatCard
            icon={<WalletOutlined />}
            label={`${month} Net`}
            value={`${netPositive ? "+" : ""}₹${net.toLocaleString()}`}
            accent={netAccent}
          />
        </Col>
      </Row>

      {/* Mobile: 1 hero card */}
      <div className="block md:hidden">
        <div className="relative overflow-hidden rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-50">
              Total Spending · {month}
            </span>
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white/20">
              <WalletOutlined />
            </span>
          </div>
          <p className="text-4xl font-bold mt-2 mb-0">
            ₹{totalExpenses.toLocaleString()}
          </p>
          <p className="text-xs text-blue-100 mt-2 mb-0">
            Income ₹{totalIncome.toLocaleString()} · Net{" "}
            {netPositive ? "+" : ""}₹{net.toLocaleString()}
          </p>
        </div>
      </div>
    </>
  );
};

export default SummaryCards;
