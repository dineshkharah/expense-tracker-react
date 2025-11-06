import React, { useEffect, useState } from "react";
import { Card, Button, message, Spin, Row, Col, Tag, Empty, Space, Tooltip, Modal } from "antd";
import { ReloadOutlined, CheckOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import RecurringTransactionDetail from "../components/RecurringTransactionDetail";

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedRecurring, setSelectedRecurring] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const [confirmMarkAllOpen, setConfirmMarkAllOpen] = useState(false);
    const [confirmClearAll, setConfirmClearAll] = useState(false);

    const baseBtnStyle = {
        height: "30px",
        fontWeight: 500,
        transition: "all 0.2s ease",
        transform: "scale(1)",
        boxShadow: "none",
    }

    const hoverEffect = (color) => ({
        onMouseEnter: (e) => {
            if (window.innerWidth < 768) return;
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = `0 0 8px rgba(${color}, 0.35)`;
        },
        onMouseLeave: (e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
        },
    });

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await axios.get("http://localhost:5000/api/v1/notifications", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setNotifications(res.data || []);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
            message.error("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/v1/notifications/${id}/mark-read`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setNotifications((prevNotifications) =>
                prevNotifications.map((n) =>
                    n._id === id ? { ...n, read: true } : n
                )
            );
            message.success("Marked as read");
            fetchNotifications();
        } catch (err) {
            message.error("Failed to mark notification");
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put(
                "http://localhost:5000/api/v1/notifications/mark-read",
                {},
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
            message.success("All notifications marked as read");
            fetchNotifications();
        } catch {
            message.error("Failed to update notifications");
        }
        setConfirmMarkAllOpen(false);
    };

    const deleteNotification = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/v1/notifications/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            message.success("Notification deleted");
            fetchNotifications();
        } catch (err) {
            message.error("Failed to delete notification");
        }
    };

    const clearAllNotifications = async () => {
        try {
            await Promise.all(
                notifications.map((n) =>
                    axios.delete(`http://localhost:5000/api/v1/notifications/${n._id}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                    })
                )
            );
            message.success("Notifications cleared");
            fetchNotifications();
        } catch {
            message.error("Failed to clear notifications");
        }
        setConfirmClearAll(false);
    };

    const handleActionClick = async (recurringId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/v1/recurring-transactions/${recurringId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });

            setSelectedRecurring(res.data);
            setModalVisible(true);
        } catch (error) {
            message.error("Failed to load details");
        }

    }

    useEffect(() => {
        fetchNotifications();
    }, []);

    if (loading) return <Spin style={{ marginTop: "20px" }} />;

    return (
        <div className="p-6">
            {/* Header Controls */}
            <div className="flex justify-between items-center mb-4">
                {/* <h2 className="text-xl font-semibold">Notifications</h2> */}
                <Space>
                    <Tooltip title="Refresh">
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={fetchNotifications}
                            style={{ borderColor: "#1677ff", color: "#1677ff" }}
                            {...hoverEffect("rgba(22, 119, 255, 0.4)")}
                        />
                    </Tooltip>
                    <Tooltip title="Mark All as Read">
                        <Button
                            icon={<CheckOutlined />}
                            onClick={() => setConfirmMarkAllOpen(true)}
                            style={{ borderColor: "#52c41a", color: "#52c41a" }}
                            {...hoverEffect("rgba(82, 196, 26, 0.4)")}
                        />
                    </Tooltip>
                    <Tooltip title="Clear All">
                        <Button
                            icon={<DeleteOutlined />}
                            onClick={() => setConfirmClearAll(true)}
                            style={{ borderColor: "#ff4d4f", color: "#ff4d4f" }}
                            {...hoverEffect("rgba(255, 77, 79, 0.4)")}
                        />
                    </Tooltip>
                </Space>
            </div>

            {/* Empty State */}
            {notifications.length === 0 ? (
                <div className="flex flex-col items-center text-center mt-16">
                    <Empty description={false} />
                    <p className="text-gray-500 text-lg mt-3">No notifications yet</p>
                    <p className="text-gray-400 text-sm">You’ll see reminders here when recurring payments are due.</p>
                </div>
            ) : (
                <Row gutter={[16, 16]}>
                    {notifications.map((n) => (
                        <Col xs={24} md={12} lg={8} key={n._id}>
                            <Card
                                title={n.type === "recurring" ? "Recurring Reminder" : "Notification"}
                                extra={!n.read ? <Tag color="red">Unread</Tag> : <Tag color="green">Read</Tag>}
                                style={{
                                    borderRadius: "12px",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                }}
                            >
                                <p className="font-medium">{n.message}</p>
                                <p className="text-xs text-gray-500 mt-1 mb-4">
                                    {dayjs(n.date).format("DD MMM YYYY, hh:mm A")}
                                </p>

                                <div className="flex flex-wrap gap-3 mt-3">

                                    {!n.read && (
                                        <Button
                                            size="small"
                                            type="primary"
                                            onClick={() => markAsRead(n._id)}
                                            style={baseBtnStyle}
                                            {...hoverEffect("22,119,255")}
                                        >
                                            Mark Read
                                        </Button>
                                    )}

                                    {n.recurringId && (
                                        <Button
                                            size="small"
                                            onClick={() => handleActionClick(n.recurringId)}
                                            style={{
                                                ...baseBtnStyle,
                                                borderColor: "#1677ff",
                                                color: "#1677ff",
                                            }}
                                            {...hoverEffect("22,119,255")}
                                        >
                                            Take Action
                                        </Button>
                                    )}

                                    <Button
                                        size="small"
                                        danger
                                        onClick={() => deleteNotification(n._id)}
                                        style={{
                                            ...baseBtnStyle,
                                            borderColor: "#ff4d4f",
                                            color: "#ff4d4f",
                                        }}
                                        {...hoverEffect("255,77,79")}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {/* Mark all as read modal */}
            <Modal
                title="Mark all notifications as read?"
                open={confirmMarkAllOpen}
                onCancel={() => setConfirmMarkAllOpen(false)}
                onOk={markAllAsRead}
                okText="Mark All Read"
            />

            {/* Clear all notifications modal */}
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

            {/* Recurring Action modal */}
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