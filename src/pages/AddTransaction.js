import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Form,
  Select,
  Switch,
  DatePicker,
  Input,
  message,
  Modal,
  Card,
  Segmented,
  Alert,
} from "antd";
import { CameraOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import api from "../utils/api";

const { TextArea } = Input;

const FinanceTracker = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [type, setType] = useState("expense");
  const [saving, setSaving] = useState(false);
  const [fromScan, setFromScan] = useState(false);

  // Fetch categories from backend
  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get("/api/v1/categories");
      const categoryOptions = res.data.map((c) => ({
        value: c.name.toLowerCase(),
        label: c.name,
      }));
      setCategories(categoryOptions);
    } catch (error) {
      console.error("Error fetching categories", error);
      message.error("Failed to load categories.");
    }
  }, []);

  // Fetch wallets from backend
  const fetchWallets = useCallback(async () => {
    try {
      const res = await api.get("/api/v1/wallets");
      setWallets(res.data.map((w) => ({ value: w.name, label: w.name })));
    } catch (error) {
      console.error("Error fetching wallets", error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchWallets();
  }, [fetchCategories, fetchWallets]);

  // Prefill the form when arriving from the bill scanner
  useEffect(() => {
    const scanned = location.state?.scanned;
    if (!scanned) return;

    setFromScan(true);
    if (scanned.type) setType(scanned.type);
    form.setFieldsValue({
      amount: scanned.amount ?? undefined,
      source: scanned.source ?? undefined,
      category: scanned.category ?? undefined,
      date: scanned.date && dayjs(scanned.date).isValid() ? dayjs(scanned.date) : dayjs(),
    });

    // Clear router state so a refresh doesn't re-trigger the prefill
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, location.pathname, form, navigate]);

  // Handle category input
  const handleCategoryChange = (value) => {
    if (!value.trim()) return;
    const lowerValue = value.toLowerCase();
    if (!categories.some((cat) => cat.value === lowerValue)) {
      setNewCategory(value);
    }
  };

  const handleCategoryBlur = () => {
    if (!newCategory) return;
    const lowerNewCategory = newCategory.toLowerCase();
    if (
      !categories.some((cat) => cat.value === lowerNewCategory) &&
      !isModalVisible
    ) {
      setIsModalVisible(true);
    }
  };

  const handleCategorySelect = (value) => {
    const lowerValue = value.toLowerCase();
    if (!categories.some((cat) => cat.value === lowerValue)) {
      setNewCategory(lowerValue);
      setTimeout(() => handleCategoryBlur(), 0);
    }
  };

  // Save new category
  const saveNewCategory = async () => {
    try {
      if (categories.some((cat) => cat.value === newCategory.toLowerCase())) {
        message.info("Category already exists.");
        return;
      }
      await api.post("/api/v1/categories", { name: newCategory });
      message.success("Category saved successfully!");
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      message.error("Failed to save category.");
    } finally {
      setIsModalVisible(false);
      setNewCategory("");
    }
  };

  // Handle save form
  const handleSave = async (values) => {
    setSaving(true);
    try {
      const payload = {
        source: values.source,
        category: values.category ? values.category.toLowerCase() : "",
        amount: values.amount.toString(),
        type,
        date: values.date ? values.date.toISOString() : null,
        recurring: isRecurring,
        frequency: isRecurring ? values.frequency : null,
        nextDate:
          isRecurring && values.nextDate ? values.nextDate.toISOString() : null,
        notes: values.notes || "",
        wallet: values.wallet || null,
      };

      await api.post("/api/v1/transactions", payload);

      message.success(`${type} saved successfully!`);
      form.resetFields();
      form.setFieldsValue({ date: dayjs() });
      setType("expense");
      setIsRecurring(false);
      setFromScan(false);
    } catch (error) {
      console.error("Error saving transaction", error);
      message.error(
        error.response?.data?.message || "Failed to save transaction",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 m-0">
          Add Transaction
        </h1>
        <Button
          icon={<CameraOutlined />}
          onClick={() => navigate("/scan-bill")}
        >
          Scan Bill
        </Button>
      </div>

      {fromScan && (
        <Alert
          type="info"
          showIcon
          className="!rounded-xl mb-4"
          message="Review the scanned details"
          description="We pre-filled this form from your bill. Check the values and edit anything before saving."
          closable
          onClose={() => setFromScan(false)}
        />
      )}

      <Card className="!rounded-2xl shadow-md dark:shadow-blue-900/20 border border-gray-100 dark:border-slate-700">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{ date: dayjs() }}
        >
          {/* Income / Expense toggle */}
          <Form.Item label="Type">
            <Segmented
              block
              value={type}
              onChange={setType}
              options={[
                { value: "expense", label: "Expense" },
                { value: "income", label: "Income" },
              ]}
            />
          </Form.Item>

          {/* Amount - hero field */}
          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: "Please enter an amount" }]}
          >
            <Input
              type="number"
              prefix="₹"
              size="large"
              placeholder="0"
              className="!text-lg"
            />
          </Form.Item>

          <Form.Item
            name="source"
            label="Person / Source Name"
            rules={[{ required: true, message: "Please enter a source" }]}
          >
            <Input size="large" placeholder="e.g. Salary, Grocery Store" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: "Please select a category" }]}
          >
            <Select
              size="large"
              showSearch
              allowClear
              placeholder="Select or type a category"
              options={categories}
              onSearch={handleCategoryChange}
              onBlur={handleCategoryBlur}
              onSelect={handleCategorySelect}
              onInputKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCategoryBlur();
                }
              }}
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            name="wallet"
            label="Wallet"
            extra={
              wallets.length === 0
                ? "Add wallets in Profile to track which account this came from."
                : undefined
            }
          >
            <Select
              size="large"
              allowClear
              placeholder="Select a wallet (optional)"
              options={wallets}
              disabled={wallets.length === 0}
            />
          </Form.Item>

          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: "Please pick a date" }]}
          >
            <DatePicker size="large" className="w-full" format="YYYY-MM-DD" />
          </Form.Item>

          {/* Recurring section */}
          <div className="bg-gray-50 dark:bg-slate-700/40 rounded-xl px-4 py-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-slate-200">
                Recurring transaction
              </span>
              <Switch
                checked={isRecurring}
                onChange={(checked) => setIsRecurring(checked)}
              />
            </div>

            {isRecurring && (
              <div className="mt-4">
                <Form.Item
                  name="frequency"
                  label="Frequency"
                  rules={[
                    { required: true, message: "Please pick a frequency" },
                  ]}
                >
                  <Select
                    options={[
                      { value: "daily", label: "Daily" },
                      { value: "weekly", label: "Weekly" },
                      { value: "monthly", label: "Monthly" },
                      { value: "yearly", label: "Yearly" },
                    ]}
                  />
                </Form.Item>
                <Form.Item
                  name="nextDate"
                  label="Next Payment Date"
                  className="!mb-0"
                >
                  <DatePicker className="w-full" />
                </Form.Item>
              </div>
            )}
          </div>

          <Form.Item name="notes" label="Notes">
            <TextArea rows={3} placeholder="Optional notes" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={saving}
          >
            Save Transaction
          </Button>
        </Form>
      </Card>

      {/* Modal for confirming new category */}
      <Modal
        title="Save New Category"
        open={isModalVisible}
        onOk={saveNewCategory}
        onCancel={() => setIsModalVisible(false)}
        okText="Save"
        cancelText="Cancel"
      >
        <p>Do you want to save "{newCategory}" as a new category?</p>
      </Modal>
    </div>
  );
};

export default FinanceTracker;
