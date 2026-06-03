import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Popover } from "antd";
import {
  HomeOutlined,
  TableOutlined,
  UserOutlined,
  EditOutlined,
  CameraOutlined,
  BarChartOutlined,
} from "@ant-design/icons";

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [addOpen, setAddOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  const isInsights = ["/insights", "/dashboard", "/report"].includes(
    location.pathname,
  );

  const goTo = (path) => {
    setAddOpen(false);
    navigate(path);
  };

  const addMenu = (
    <div className="flex flex-col w-44">
      <button
        onClick={() => goTo("/scan-bill")}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700/60 transition"
      >
        <CameraOutlined className="text-lg text-blue-600" />
        <span className="text-sm font-medium">Scan Bill</span>
      </button>
      <button
        onClick={() => goTo("/add-transaction")}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700/60 transition"
      >
        <EditOutlined className="text-lg text-blue-600" />
        <span className="text-sm font-medium">Add Manually</span>
      </button>
    </div>
  );

  return (
    <div className="md:hidden fixed bottom-4 left-0 right-0 flex justify-center z-50">
      {/* FLOATING DOCK */}
      <div className="relative bg-white/70 dark:bg-slate-800/80 backdrop-blur-xl shadow-2xl rounded-full px-6 py-3 w-[92%] max-w-md flex items-center justify-between border border-white/40 dark:border-slate-700/60">
        {/* Home */}
        <div
          onClick={() => navigate("/")}
          className={`flex flex-col items-center cursor-pointer transition ${
            isActive("/")
              ? "text-blue-600 scale-110"
              : "text-gray-500 dark:text-slate-400"
          }`}
        >
          <HomeOutlined className="text-xl" />
          <span className="text-xs">Home</span>
        </div>

        {/* Transactions */}
        <div
          onClick={() => navigate("/transactions")}
          className={`flex flex-col items-center cursor-pointer transition ${
            isActive("/transactions")
              ? "text-blue-600 scale-110"
              : "text-gray-500 dark:text-slate-400"
          }`}
        >
          <TableOutlined className="text-xl" />
          <span className="text-xs">History</span>
        </div>

        {/* CENTER FLOATING ACTION BUTTON */}
        <Popover
          content={addMenu}
          trigger="click"
          open={addOpen}
          onOpenChange={setAddOpen}
          placement="top"
          arrow
        >
          <div className="absolute left-1/2 -translate-x-1/2 -top-6 cursor-pointer">
            <div
              className={`w-14 h-14 bg-white dark:bg-slate-700 shadow-xl rounded-full flex items-center justify-center border-4 border-gray-100 dark:border-slate-600 hover:scale-110 transition ${
                addOpen ? "scale-110" : ""
              }`}
            >
              <span
                className={`text-3xl text-blue-600 leading-none transition-transform ${
                  addOpen ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </div>
          </div>
        </Popover>

        {/* Insights */}
        <div
          onClick={() => navigate("/insights")}
          className={`flex flex-col items-center cursor-pointer transition ${
            isInsights
              ? "text-blue-600 scale-110"
              : "text-gray-500 dark:text-slate-400"
          }`}
        >
          <BarChartOutlined className="text-xl" />
          <span className="text-xs">Insights</span>
        </div>

        {/* Profile */}
        <div
          onClick={() => navigate("/profile")}
          className={`flex flex-col items-center cursor-pointer transition ${
            isActive("/profile")
              ? "text-blue-600 scale-110"
              : "text-gray-500 dark:text-slate-400"
          }`}
        >
          <UserOutlined className="text-xl" />
          <span className="text-xs">Profile</span>
        </div>
      </div>
    </div>
  );
};

export default MobileBottomNav;
