import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  Button,
  message,
  Spin,
  Row,
  Col,
  Tag,
  Empty,
  Space,
  Tooltip,
  Modal,
} from "antd";
import {
  ReloadOutlined,
  CheckOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import api from "../utils/api";
import dayjs from "dayjs";
import RecurringTransactionDetail from "../components/RecurringTransactionDetail";
import { useAuth } from "../context/AuthContext";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecurring, setSelectedRecurring] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmMarkAllOpen, setConfirmMarkAllOpen] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const { token } = useAuth();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/v1/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data || []);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
      message.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const markAsRead = async (id) => {
    try {
      await api.put(
        `/api/v1/notifications/${id}/mark-read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
      message.success("Marked as read");
      fetchNotifications();
    } catch (error) {
      message.error("Failed to mark notification");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put(
        "/api/v1/notifications/mark-read",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      message.success("All notifications marked as read");
      fetchNotifications();
    } catch (error) {
      message.error("Failed to update notifications");
    }
    setConfirmMarkAllOpen(false);
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/api/v1/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Notification deleted");
      fetchNotifications();
    } catch (error) {
      message.error("Failed to delete notification");
    }
  };

  const clearAllNotifications = async () => {
    try {
      await Promise.all(
        notifications.map((n) =>
          api.delete(`/api/v1/notifications/${n._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ),
      );
      message.success("Notifications cleared");
      fetchNotifications();
    } catch (error) {
      message.error("Failed to clear notifications");
    }
    setConfirmClearAll(false);
  };

  const handleActionClick = async (recurringId) => {
    try {
      const res = await api.get(
        `/api/v1/recurring-transactions/${recurringId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setSelectedRecurring(res.data);
      setModalVisible(true);
    } catch (error) {
      message.error("Failed to load details");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  if (loading) return <Spin className="mt-5 block" />;

  return (
    <div className="p-6">
      {/* Header Controls */}
      <div className="flex justify-between items-center mb-4">
        <Space>
          <Tooltip title="Refresh">
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchNotifications}
              className="!border-blue-500 !text-blue-500 hover:!bg-blue-50 dark:hover:!bg-blue-900/30 transition-all"
            />
          </Tooltip>
          <Tooltip title="Mark All as Read">
            <Button
              icon={<CheckOutlined />}
              onClick={() => setConfirmMarkAllOpen(true)}
              className="!border-green-500 !text-green-500 hover:!bg-green-50 dark:hover:!bg-green-900/30 transition-all"
            />
          </Tooltip>
          <Tooltip title="Clear All">
            <Button
              icon={<DeleteOutlined />}
              onClick={() => setConfirmClearAll(true)}
              className="!border-red-500 !text-red-500 hover:!bg-red-50 dark:hover:!bg-red-900/30 transition-all"
            />
          </Tooltip>
        </Space>
      </div>

      {/* Empty State */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center text-center mt-16">
          <Empty description={false} />
          <p className="text-gray-500 dark:text-slate-400 text-lg mt-3">
            No notifications yet
          </p>
          <p className="text-gray-400 dark:text-slate-500 text-sm">
            You'll see reminders here when recurring payments are due.
          </p>
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {notifications.map((n) => (
            <Col xs={24} md={12} lg={8} key={n._id}>
              <Card
                title={
                  n.type === "recurring" ? "Recurring Reminder" : "Notification"
                }
                extra={
                  !n.read ? (
                    <Tag color="red">Unread</Tag>
                  ) : (
                    <Tag color="green">Read</Tag>
                  )
                }
                className="!rounded-xl shadow-md dark:shadow-blue-900/30 border border-gray-100 dark:border-slate-700"
              >
                <p className="font-medium text-gray-800 dark:text-slate-100">
                  {n.message}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 mb-4">
                  {dayjs(n.date).format("DD MMM YYYY, hh:mm A")}
                </p>

                <div className="flex flex-wrap gap-2 mt-3">
                  {!n.read && (
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => markAsRead(n._id)}
                      className="hover:scale-105 transition-transform"
                    >
                      Mark Read
                    </Button>
                  )}
                  {n.recurringId && (
                    <Button
                      size="small"
                      onClick={() => handleActionClick(n.recurringId)}
                      className="!border-blue-500 !text-blue-500 hover:!bg-blue-50 dark:hover:!bg-blue-900/30 hover:scale-105 transition-all"
                    >
                      Take Action
                    </Button>
                  )}
                  <Button
                    size="small"
                    danger
                    onClick={() => deleteNotification(n._id)}
                    className="hover:scale-105 transition-transform !shadow-none"
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title="Mark all notifications as read?"
        open={confirmMarkAllOpen}
        onCancel={() => setConfirmMarkAllOpen(false)}
        onOk={markAllAsRead}
        okText="Mark All Read"
      />
      <Modal
        title="Clear all notifications?"
        open={confirmClearAll}
        onCancel={() => setConfirmClearAll(false)}
        onOk={clearAllNotifications}
        okText="Delete All"
        okButtonProps={{ danger: true }}
      >
        <p>This action cannot be undone.</p>
      </Modal>

      {selectedRecurring && modalVisible && (
        <RecurringTransactionDetail
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          recurring={selectedRecurring}
          refreshList={fetchNotifications}
        />
      )}
    </div>
  );
};

export default Notifications;
