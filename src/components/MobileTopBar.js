import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "antd";
import { BellOutlined } from "@ant-design/icons";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

// Slim top bar shown on mobile only: app name + notifications bell.
// (The bell used to live in the bottom dock; it moved here to make room
// for the Insights tab.)
const MobileTopBar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get("/api/v1/notifications");
      const data = res.data;
      setNotifications(
        Array.isArray(data) ? data : data?.notifications || [],
      );
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, []);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user, fetchNotifications]);

  if (!user) return null;

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-5 h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-700">
      <span
        className="text-lg font-bold text-blue-600 cursor-pointer"
        onClick={() => navigate("/")}
      >
        Trackr
      </span>
      <Badge count={unread} overflowCount={9} size="small">
        <BellOutlined
          className="text-xl text-gray-600 dark:text-slate-300 cursor-pointer"
          onClick={() => navigate("/notifications")}
        />
      </Badge>
    </header>
  );
};

export default MobileTopBar;
