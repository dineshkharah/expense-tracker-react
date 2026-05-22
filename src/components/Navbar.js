import React, { useState, useEffect, useCallback } from "react";
import { Layout, Menu, Button, Dropdown, Avatar, Space, Badge } from "antd";
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
} from "@ant-design/icons";

import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const { Header } = Layout;

const Navbar = () => {
  const { user, logout, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get("/api/v1/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
  }, [token]);

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
      label: <Link to="/report">Report</Link>,
      key: "/report",
      icon: <BarChartOutlined />,
    },
  ];

  return (
    <>
      <Header
        className="flex items-center px-5"
        style={{ justifyContent: "center" }}
      >
        {/* Desktop */}
        <div className="hidden md:flex flex-1 justify-center items-center gap-6">
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={navItems}
          />
          {/* Profile on desktop */}
          {user ? (
            <Space size="large">
              <Badge
                count={notifications.filter((n) => !n.read).length}
                overflowCount={9}
              >
                <BellOutlined
                  style={{
                    fontSize: "20px",
                    color: "white",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate("/notifications")}
                />
              </Badge>

              <Dropdown menu={{ items: profileMenu }} placement="bottomRight">
                <Space style={{ cursor: "pointer", color: "white" }}>
                  <Avatar
                    icon={<UserOutlined />}
                    style={{ backgroundColor: "#1677ff", paddingLeft: "0.5px" }}
                  />
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
      </Header>
    </>
  );
};

export default Navbar;
