import React, { useEffect, useState } from "react";
import { Card, Button, message, Spin, Row, Col, Tag } from "antd";
import axios from "axios";
import dayjs from "dayjs";

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

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
            message.success("Marked as read");
            fetchNotifications();
        } catch (err) {
            message.error("Failed to mark notification");
        }
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

    useEffect(() => {
        fetchNotifications();
    }, []);

    if (loading) return <Spin style={{ marginTop: "20px" }} />;

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>
            <Row gutter={[16, 16]}>
                {notifications.map((n) => (
                    <Col xs={24} md={12} lg={8} key={n._id}>
                        <Card
                            title={n.type === "recurring" ? "Recurring Reminder" : "Notification"}
                            extra={
                                !n.read ? <Tag color="red">Unread</Tag> : <Tag color="green">Read</Tag>
                            }
                            style={{ borderRadius: "12px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}
                        >
                            <p>{n.message}</p>
                            <p style={{ fontSize: "0.85rem", color: "gray" }}>
                                {dayjs(n.date).format("DD MMM YYYY, hh:mm A")}
                            </p>
                            <div style={{ marginTop: "10px", display: "flex", gap: "20px" }}>
                                {!n.read && (
                                    <Button size="small" type="primary" onClick={() => markAsRead(n._id)} style={{ height: "30px" }}>
                                        Mark as Read
                                    </Button>
                                )}
                                <Button size="small" danger onClick={() => deleteNotification(n._id)} style={{ height: "30px" }}>
                                    Delete
                                </Button>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default Notifications;
