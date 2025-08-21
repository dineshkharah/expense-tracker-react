import React, { useEffect, useState } from "react";
import { Card, Avatar, Button, Typography } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const Profile = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        setUser(storedUser ? JSON.parse(storedUser) : null);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login");
    };

    if (!user) {
        return (
            <div style={{ textAlign: "center", marginTop: "100px" }}>
                <Title level={3}>No user logged in</Title>
                <Button type="primary" onClick={() => navigate("/login")}>
                    Go to Login
                </Button>
            </div>
        );
    }

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                padding: "30px 15px",
            }}
        >
            <Card
                style={{
                    maxWidth: 400,
                    width: "100%",
                    textAlign: "center",
                    borderRadius: "16px",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                }}
            >
                <Avatar
                    size={100}
                    icon={<UserOutlined />}
                    style={{
                        backgroundColor: "#1677ff",
                        marginBottom: "20px",
                    }}
                />
                <Title level={3} style={{ marginBottom: "5px" }}>
                    {user.name}
                </Title>
                {user.email && (
                    <Text type="secondary" style={{ display: "block", marginBottom: "20px" }}>
                        {user.email}
                    </Text>
                )}

                <Button
                    type="primary"
                    danger
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                    block
                    style={{ borderRadius: "8px", height: "40px" }}
                >
                    Logout
                </Button>
            </Card>
        </div>
    );
};

export default Profile;