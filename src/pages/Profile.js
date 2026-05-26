import React from "react";
import { Card, Avatar, Button } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="text-center mt-24">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-slate-300 mb-4">
          No user logged in
        </h3>
        <Button type="primary" onClick={() => navigate("/login")}>
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-center px-4 py-8">
      <Card className="w-full max-w-sm text-center !rounded-2xl shadow-lg dark:shadow-blue-900/30 border border-gray-100 dark:border-slate-700 dark:!bg-slate-800">
        <Avatar
          size={100}
          icon={<UserOutlined />}
          className="!bg-blue-500 mb-5"
        />
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-1">
          {user.name}
        </h2>
        {user.email && (
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
            {user.email}
          </p>
        )}
        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          block
          className="!rounded-lg !h-10"
        >
          Logout
        </Button>
      </Card>
    </div>
  );
};

export default Profile;
