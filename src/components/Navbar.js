import React, { useState, useEffect, useCallback } from "react";
import { Menu, Button, Dropdown, Avatar, Space, Badge } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LogoutOutlined,
  UserOutlined,
  LoginOutlined,
  HomeOutlined,
  PlusOutlined,
  TableOutlined,
  BarChartOutlined,
  BellOutlined,
  SunOutlined,
  MoonOutlined,
} from "@ant-design/icons";

import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get("/api/v1/notifications");

      const data = response.data;

      if (Array.isArray(data)) {
        setNotifications(data);
      } else if (Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      } else {
        console.error("Unexpected notifications format:", data);
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const profileMenu = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: <Link to="/profile">Profile</Link>,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: <span onClick={handleLogout}>Logout</span>,
    },
  ];

  const navItems = [
    {
      label: <Link to="/">Home</Link>,
      key: "/",
      icon: <HomeOutlined />,
    },
    {
      label: <Link to="/add-transaction">Add Transaction</Link>,
      key: "/add-transaction",
      icon: <PlusOutlined />,
    },
    {
      label: <Link to="/transactions">History</Link>,
      key: "/transactions",
      icon: <TableOutlined />,
    },
    {
      label: <Link to="/insights">Insights</Link>,
      key: "/insights",
      icon: <BarChartOutlined />,
    },
  ];

  return (
    <header className="flex items-center px-5 h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
      <div className="flex flex-1 justify-center items-center gap-6">
        {/* Nav Menu */}
        <Menu
          mode="horizontal"
          selectedKeys={[
            ["/insights", "/dashboard", "/report"].includes(location.pathname)
              ? "/insights"
              : location.pathname,
          ]}
          items={navItems}
          className="flex-1 border-none bg-transparent dark:bg-transparent"
          theme={isDark ? "dark" : "light"}
        />

        {/* Right side */}
        {/* Dark mode toggle */}
        <Button
          type="text"
          icon={isDark ? <SunOutlined /> : <MoonOutlined />}
          onClick={toggleTheme}
          className="text-gray-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-800"
        />

        {user ? (
          <Space size="large">
            <Badge
              count={notifications.filter((n) => !n.read).length}
              overflowCount={9}
            >
              <BellOutlined
                className="text-xl text-gray-600 dark:text-slate-300 cursor-pointer hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                onClick={() => navigate("/notifications")}
              />
            </Badge>

            <Dropdown menu={{ items: profileMenu }} placement="bottomRight">
              <Space className="cursor-pointer text-gray-700 dark:text-slate-200">
                <Avatar icon={<UserOutlined />} className="bg-blue-500" />
                {user.name}
              </Space>
            </Dropdown>
          </Space>
        ) : (
          <Link to="/login">
            <Button type="primary" icon={<LoginOutlined />}>
              Login
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
