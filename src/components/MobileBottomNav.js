import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HomeOutlined,
  TableOutlined,
  PlusOutlined,
  BellOutlined,
  UserOutlined,
} from "@ant-design/icons";

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { key: "/", icon: <HomeOutlined />, label: "Home" },
    { key: "/transactions", icon: <TableOutlined />, label: "Transactions" },
    {
      key: "/add-transaction",
      icon: <PlusOutlined />,
      label: "Add",
      isCenter: true,
    },
    { key: "/notifications", icon: <BellOutlined />, label: "Alerts" },
    { key: "/profile", icon: <UserOutlined />, label: "Profile" },
  ];

  return (
    <div className="md:hidden fixed bottom-4 left-0 right-0 flex justify-center z-50">
      <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-full px-4 py-2 flex items-center justify-between w-[90%] max-w-md">
        {navItems.map((item) => {
          const isActive = location.pathname === item.key;

          if (item.isCenter) {
            return (
              <div
                key={item.key}
                onClick={() => navigate(item.key)}
                className="relative -top-6"
              >
                <div className="w-14 h-14 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition">
                  {item.icon}
                </div>
              </div>
            );
          }

          return (
            <div
              key={item.key}
              onClick={() => navigate(item.key)}
              className={`flex flex-col items-center justify-center text-xs cursor-pointer 
                transition-all duration-300 ease-in-out transform
                ${
                  isActive
                    ? "text-blue-600 scale-110"
                    : "text-gray-500 scale-100 hover:scale-105"
                }`}
            >
              <div className="text-xl transition-all duration-300">
                {item.icon}
              </div>
              <span className="transition-all duration-300">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
