import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Avatar,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  Tag,
  Divider,
  message,
} from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  EditOutlined,
  LockOutlined,
  BellOutlined,
  DeleteOutlined,
  WarningOutlined,
  DownOutlined,
  SunOutlined,
  MoonOutlined,
} from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../utils/api";

const Profile = () => {
  const { user, logout, login, token } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);
  const [clearTransactionsModalOpen, setClearTransactionsModalOpen] =
    useState(false);
  const [notifPrefs, setNotifPrefs] = useState({
    recurringReminders: true,
    paymentDueAlerts: true,
  });
  const [activeRecurringCount, setActiveRecurringCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [editForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const [recurringExpanded, setRecurringExpanded] = useState(false);
  const [activeRecurrings, setActiveRecurrings] = useState([]);

  const { isDark, toggleTheme } = useTheme();

  const fetchProfileData = useCallback(async () => {
    try {
      const [profileRes, recurringRes, prefsRes] = await Promise.all([
        api.get("/api/v1/auth/get-profile"),
        api.get("/api/v1/recurring-transactions"),
        api.get("/api/v1/notifications/preferences"),
      ]);
      setProfileData(profileRes.data);
      setActiveRecurringCount(
        recurringRes.data.filter((r) => r.isActive).length,
      );
      setNotifPrefs(prefsRes.data);

      const actives = recurringRes.data.filter((r) => r.isActive);
      setActiveRecurringCount(actives.length);
      setActiveRecurrings(actives);
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const values = await editForm.validateFields();
      const res = await api.put("/api/v1/auth/update-profile", values);
      login(token, { name: res.data.name, email: res.data.email });
      message.success("Profile updated successfully!");
      setEditModalOpen(false);
      fetchProfileData();
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to update profile",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setLoading(true);
      const values = await passwordForm.validateFields();
      if (values.newPassword !== values.confirmPassword) {
        message.error("New passwords do not match");
        return;
      }
      await api.put("/api/v1/auth/change-password", {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      message.success("Password changed successfully!");
      setPasswordModalOpen(false);
      passwordForm.resetFields();
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to change password",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNotifPrefChange = async (key, value) => {
    try {
      const updated = { ...notifPrefs, [key]: value };
      setNotifPrefs(updated);
      await api.put("/api/v1/notifications/preferences", updated);
      message.success("Preferences updated");
    } catch (error) {
      message.error("Failed to update preferences");
    }
  };

  const handleClearTransactions = async () => {
    try {
      setLoading(true);
      await api.delete("/api/v1/transactions");
      message.success("All transactions cleared");
      setClearTransactionsModalOpen(false);
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to clear transactions",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      await api.delete("/api/v1/auth/delete");
      message.success("Account deleted");
      logout();
      navigate("/login");
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to delete account",
      );
    } finally {
      setLoading(false);
    }
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

  const memberSince = profileData?.createdAt
    ? new Date(profileData.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-4">
      {/* Profile Card */}
      <Card className="!rounded-2xl shadow-lg dark:shadow-blue-900/30 border border-gray-100 dark:border-slate-700 overflow-hidden !p-0">
        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-xl" />

        {/* Avatar overlapping banner */}
        <div className="flex flex-col items-center -mt-12 pb-6 px-6">
          <Avatar
            size={90}
            icon={<UserOutlined />}
            className="!bg-gradient-to-br !from-blue-400 !to-indigo-600 border-4 border-white dark:border-slate-800 shadow-md"
          />
          <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 mt-3">
            {user.name}
          </h2>
          {user.email && (
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {user.email}
            </p>
          )}
          {memberSince && (
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
              Member since {memberSince}
            </p>
          )}

          {/* Stats Row */}
          <div className="mt-4 w-full bg-indigo-50 dark:bg-slate-700/50 rounded-xl overflow-hidden">
            <div
              onClick={() => setRecurringExpanded(!recurringExpanded)}
              className="px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors"
            >
              <span className="text-sm text-gray-600 dark:text-slate-300">
                Active Recurring Transactions
              </span>
              <div className="flex items-center gap-2">
                <span className="bg-indigo-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {activeRecurringCount}
                </span>
                <DownOutlined
                  className="text-xs text-gray-400 transition-transform duration-300"
                  style={{
                    transform: recurringExpanded
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  }}
                />
              </div>
            </div>

            <div
              className={`px-4 flex flex-col gap-2 overflow-hidden transition-all duration-300 ease-in-out ${
                recurringExpanded
                  ? "max-h-96 pb-3 opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              {activeRecurrings.slice(0, 3).map((r) => (
                <div
                  key={r._id}
                  className="flex justify-between items-center text-sm text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-lg px-3 py-2"
                >
                  <span className="font-medium">{r.source}</span>
                  <span className="text-gray-400 text-xs">
                    ₹{r.latestAmount} · {r.frequency}
                  </span>
                </div>
              ))}
              {activeRecurringCount > 3 && (
                <Link
                  to="/recurring-transactions"
                  className="text-xs text-blue-500 text-right mt-1"
                >
                  +{activeRecurringCount - 3} more →
                </Link>
              )}
              {activeRecurringCount === 0 && (
                <p className="text-xs text-gray-400 text-center py-1">
                  No active recurring transactions
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-5 w-full">
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                editForm.setFieldsValue({ name: user.name, email: user.email });
                setEditModalOpen(true);
              }}
              className="flex-1 !h-10"
            >
              Edit Profile
            </Button>
            <Button
              icon={<LockOutlined />}
              onClick={() => setPasswordModalOpen(true)}
              className="flex-1 !h-10"
            >
              Change Password
            </Button>
          </div>

          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            block
            className="!rounded-lg !h-10 mt-3"
          >
            Logout
          </Button>
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card
        title={
          <span className="flex items-center gap-2">
            <BellOutlined /> Notification Preferences
          </span>
        }
        className="!rounded-2xl shadow-sm dark:shadow-blue-900/20 border border-gray-100 dark:border-slate-700"
      >
        <div className="flex justify-between items-center py-2">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-slate-200">
              Recurring Reminders
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500">
              Get notified when recurring payments are due
            </p>
          </div>
          <Switch
            checked={notifPrefs.recurringReminders}
            onChange={(val) => handleNotifPrefChange("recurringReminders", val)}
          />
        </div>
        <Divider className="!my-2" />
        <div className="flex justify-between items-center py-2">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-slate-200">
              Payment Due Alerts
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500">
              Get alerted before payment deadlines
            </p>
          </div>
          <Switch
            checked={notifPrefs.paymentDueAlerts}
            onChange={(val) => handleNotifPrefChange("paymentDueAlerts", val)}
          />
        </div>
      </Card>

      {/* 2FA Placeholder */}
      <Card
        title={
          <span className="flex items-center gap-2">
            <LockOutlined /> Security
          </span>
        }
        className="!rounded-2xl shadow-sm dark:shadow-blue-900/20 border border-gray-100 dark:border-slate-700"
      >
        <div className="flex justify-between items-center py-2">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-slate-200 flex items-center gap-2">
              Two-Factor Authentication
              <Tag color="orange">Coming Soon</Tag>
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500">
              Add an extra layer of security to your account
            </p>
          </div>
          <Switch disabled />
        </div>
      </Card>

      {/* Theme Toggle - Mobile Only */}
      <Card className="!rounded-2xl shadow-sm dark:shadow-blue-900/20 border border-gray-100 dark:border-slate-700 md:hidden">
        <div className="flex justify-between items-center py-2">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-slate-200 flex items-center gap-2">
              {isDark ? <MoonOutlined /> : <SunOutlined />}
              {isDark ? "Dark Mode" : "Light Mode"}
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500">
              Switch between light and dark theme
            </p>
          </div>
          <Switch
            checked={isDark}
            onChange={toggleTheme}
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
          />
        </div>
      </Card>

      {/* Danger Zone */}
      <Card
        title={
          <span className="flex items-center gap-2 text-red-500">
            <WarningOutlined /> Danger Zone
          </span>
        }
        className="!rounded-2xl border border-red-200 dark:border-red-900/50 shadow-sm"
      >
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-slate-200">
                Clear All Transactions
              </p>
              <p className="text-xs text-gray-400 dark:text-slate-500">
                Permanently delete all your transaction history
              </p>
            </div>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => setClearTransactionsModalOpen(true)}
            >
              Clear
            </Button>
          </div>
          <Divider className="!my-1" />
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-slate-200">
                Delete Account
              </p>
              <p className="text-xs text-gray-400 dark:text-slate-500">
                Permanently delete your account and all data
              </p>
            </div>
            <Button
              danger
              type="primary"
              icon={<DeleteOutlined />}
              onClick={() => setDeleteAccountModalOpen(true)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Card>

      {/* Edit Profile Modal */}
      <Modal
        title="Edit Profile"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={handleUpdateProfile}
        okText="Save"
        confirmLoading={loading}
      >
        <Form form={editForm} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                type: "email",
                message: "Please enter a valid email",
              },
            ]}
          >
            <Input size="large" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        title="Change Password"
        open={passwordModalOpen}
        onCancel={() => {
          setPasswordModalOpen(false);
          passwordForm.resetFields();
        }}
        onOk={handleChangePassword}
        okText="Update Password"
        confirmLoading={loading}
      >
        <Form form={passwordForm} layout="vertical" className="mt-4">
          <Form.Item
            name="oldPassword"
            label="Current Password"
            rules={[
              { required: true, message: "Please enter your current password" },
            ]}
          >
            <Input.Password size="large" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              {
                required: true,
                min: 6,
                message: "Password must be at least 6 characters",
              },
            ]}
          >
            <Input.Password size="large" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            rules={[
              { required: true, message: "Please confirm your new password" },
            ]}
          >
            <Input.Password size="large" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Clear Transactions Modal */}
      <Modal
        title="Clear All Transactions?"
        open={clearTransactionsModalOpen}
        onCancel={() => setClearTransactionsModalOpen(false)}
        onOk={handleClearTransactions}
        okText="Yes, Clear All"
        okButtonProps={{ danger: true }}
        confirmLoading={loading}
      >
        <p>
          This will permanently delete all your transactions and reset your
          balance. This cannot be undone.
        </p>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        title="Delete Account?"
        open={deleteAccountModalOpen}
        onCancel={() => setDeleteAccountModalOpen(false)}
        onOk={handleDeleteAccount}
        okText="Yes, Delete My Account"
        okButtonProps={{ danger: true }}
        confirmLoading={loading}
      >
        <p>
          This will permanently delete your account and all associated data
          including transactions, recurring payments and notifications. This
          cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default Profile;
