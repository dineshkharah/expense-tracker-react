import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, Dropdown, Avatar, Space, Drawer } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LogoutOutlined,
  UserOutlined,
  LoginOutlined,
  HomeOutlined,
  PlusOutlined,
  TableOutlined,
  BarChartOutlined,
  MenuOutlined,
} from "@ant-design/icons";

const { Header } = Layout;

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const updateUser = () => {
      const storedUser = localStorage.getItem("user");
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    updateUser();

    window.addEventListener("storage", updateUser);

    return () => {
      window.removeEventListener("storage", updateUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
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
      label: <Link to="/transactions">Transactions</Link>,
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
            <Dropdown menu={{ items: profileMenu }} placement="bottomRight">
              <Space style={{ cursor: "pointer", color: "white" }}>
                <Avatar
                  icon={<UserOutlined />}
                  style={{ backgroundColor: "#1677ff" }}
                />
                {user.name}
              </Space>
            </Dropdown>
          ) : (
            <Link to="/login">
              <Button type="primary" icon={<LoginOutlined />}>
                Login
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile */}
        <div className="flex w-full items-center justify-between md:hidden">
          {/* Hamburger left */}
          <Button
            type="text"
            icon={<MenuOutlined style={{ fontSize: "20px", color: "white" }} />}
            onClick={() => setDrawerVisible(true)}
          />

          {/* Profile/Login right */}
          {user ? (
            <Dropdown menu={{ items: profileMenu }} placement="bottomRight">
              <Avatar
                icon={<UserOutlined />}
                style={{ backgroundColor: "#1677ff", cursor: "pointer" }}
              />
            </Dropdown>
          ) : (
            <Link to="/login">
              <Button type="primary" size="small" icon={<LoginOutlined />}>
                Login
              </Button>
            </Link>
          )}
        </div>
      </Header>

      {/* Drawer for Mobile Menu */}
      <Drawer
        title="Menu"
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={navItems}
          onClick={() => setDrawerVisible(false)}
        />
      </Drawer>
    </>
  );
};

export default Navbar;
