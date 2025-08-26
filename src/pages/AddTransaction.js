import React, { useState, useEffect } from "react";
import { Button, Form, Select, Switch, DatePicker, Input, message, Modal } from "antd";
import axios from "axios";

const { TextArea } = Input;

const token = localStorage.getItem("token");
const headers = {
  Authorization: `Bearer ${token}`
};

const FinanceTracker = () => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/v1/categories", { headers });
      const categoryOptions = res.data.map((c) => ({
        value: c.name.toLowerCase(),
        label: c.name
      }));
      setCategories(categoryOptions);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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
    if (!categories.some((cat) => cat.value === lowerNewCategory) && !isModalVisible) {
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
      await axios.post(
        "http://localhost:5000/api/v1/categories",
        { name: newCategory },
        { headers }
      );
      message.success("Category saved successfully!");
      fetchCategories();
    } catch (error) {
      message.error("Failed to save category.");
    } finally {
      setIsModalVisible(false);
      setNewCategory("");
    }
  };

  // Handle save form
  const handleSave = async (values) => {
    try {
      const payload = {
        source: values.source,
        category: values.category ? values.category.toLowerCase() : "",
        amount: values.amount.toString(),
        type: values.type,
        date: values.date ? values.date.toISOString() : null,
        recurring: isRecurring,
        frequency: isRecurring ? values.frequency : null,
        nextDate:
          isRecurring && values.nextDate
            ? values.nextDate.toISOString()
            : null,
        notes: values.notes || ""
      };

      console.log("Formatted Payload:", payload);

      await axios.post("http://localhost:5000/api/v1/transactions", payload, { headers });

      message.success(`${values.type} saved successfully!`);
      form.resetFields();
      setIsRecurring(false);
    } catch (error) {
      console.error("Error Response:", error.response?.data || error.message);
      message.error("Error saving data.");
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "20px" }}>

      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Form.Item name="type" label="Type" rules={[{ required: true }]}>
          <Select
            options={[
              { value: "income", label: "Income" },
              { value: "expense", label: "Expense" }
            ]}
          />
        </Form.Item>

        <Form.Item name="source" label="Person / Source Name" rules={[{ required: true }]}>
          <Input placeholder="e.g. Salary, Grocery Store" />
        </Form.Item>

        <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
          <Input type="number" />
        </Form.Item>

        <Form.Item name="date" label="Date" rules={[{ required: true }]}>
          <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item name="category" label="Category" rules={[{ required: true }]}>
          <Select
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

        <Form.Item label="Recurring?">
          <Switch onChange={(checked) => setIsRecurring(checked)} />
        </Form.Item>

        {isRecurring && (
          <>
            <Form.Item name="frequency" label="Frequency" rules={[{ required: true }]}>
              <Select
                options={[
                  { value: "daily", label: "Daily" },
                  { value: "weekly", label: "Weekly" },
                  { value: "monthly", label: "Monthly" },
                  { value: "yearly", label: "Yearly" }
                ]}
              />
            </Form.Item>
            <Form.Item name="nextDate" label="Next Payment Date">
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </>
        )}

        <Form.Item name="notes" label="Notes">
          <TextArea rows={3} />
        </Form.Item>

        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </Form>

      {/* Modal for confirming new category */}
      <Modal
        title="Save New Category"
        visible={isModalVisible}
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
