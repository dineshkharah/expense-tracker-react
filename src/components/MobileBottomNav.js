import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HomeOutlined,
  TableOutlined,
  BellOutlined,
  UserOutlined,
} from "@ant-design/icons";

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-4 left-0 right-0 flex justify-center z-50">
      {/* FLOATING DOCK */}
      <div className="relative bg-white/70 backdrop-blur-xl shadow-2xl rounded-full px-6 py-3 w-[92%] max-w-md flex items-center justify-between border border-white/40">
        {/* Home */}
        <div
          onClick={() => navigate("/")}
          className={`flex flex-col items-center cursor-pointer transition ${
            isActive("/") ? "text-blue-600 scale-110" : "text-gray-500"
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
              : "text-gray-500"
          }`}
        >
          <TableOutlined className="text-xl" />
          <span className="text-xs">History</span>
        </div>

        {/* CENTER FLOATING ACTION BUTTON */}
        <div
          onClick={() => navigate("/add-transaction")}
          className="absolute left-1/2 -translate-x-1/2 -top-6 cursor-pointer"
        >
          <div className="w-14 h-14 bg-white shadow-xl rounded-full flex items-center justify-center border-4 border-gray-100 hover:scale-110 transition">
            <span className="text-3xl text-blue-600 leading-none">+</span>
          </div>
        </div>

        {/* Alerts */}
        <div
          onClick={() => navigate("/notifications")}
          className={`flex flex-col items-center cursor-pointer transition ${
            isActive("/notifications")
              ? "text-blue-600 scale-110"
              : "text-gray-500"
          }`}
        >
          <BellOutlined className="text-xl" />
          <span className="text-xs">Alerts</span>
        </div>

        {/* Profile */}
        <div
          onClick={() => navigate("/profile")}
          className={`flex flex-col items-center cursor-pointer transition ${
            isActive("/profile") ? "text-blue-600 scale-110" : "text-gray-500"
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
