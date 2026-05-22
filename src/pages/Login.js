import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { login } = useAuth();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const response = await api.post("/api/v1/auth/login", values);
      const { token, name, email } = response.data;

      login(token, { name, email });

      message.success("Login successful");
      navigate("/");
    } catch (error) {
      message.error(error.response?.data?.message || "Something went wrong"); //the reason for ? is to prevent error if response is undefined
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "5rem auto",
        padding: "2rem",
        borderRadius: "2rem",
        boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
      }}
    >
      <h2>Login</h2>
      <Form layout="vertical" onFinish={handleLogin}>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            {
              required: true,
              type: "email",
              message: "Please enter your email",
            },
          ]}
        >
          <Input placeholder="Email" />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please enter your password" }]}
        >
          <Input.Password placeholder="Password" />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Login
        </Button>
      </Form>
    </div>
  );
};

export default Login;
