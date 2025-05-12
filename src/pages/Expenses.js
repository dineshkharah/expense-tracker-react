import React, { useState, useEffect, useRef } from "react";
import { Button, Form, Select, Switch, DatePicker, Input, message, Tabs, Modal } from "antd";
import axios from "axios";

const { TextArea } = Input;
const { TabPane } = Tabs;

const token = localStorage.getItem("token");
const headers = {
    Authorization: `Bearer ${token}`
};

const FinanceTracker = () => {
    // const [form] = Form.useForm();
    const [incomeForm] = Form.useForm();
    const [recurringExpenseForm] = Form.useForm();
    const [investmentForm] = Form.useForm();
    const [savingsForm] = Form.useForm();
    const [debtForm] = Form.useForm();

    const [activeTab, setActiveTab] = useState("income");
    const [categories, setCategories] = useState([]); // Start with an empty list
    const [newCategory, setNewCategory] = useState(""); // Track user input for new category
    const [isModalVisible, setIsModalVisible] = useState(false); // Track modal visibility
    // Track switch state for recurring fields
    const [isRecurringIncome, setIsRecurringIncome] = useState(false);
    const [isRecurringExpense, setIsRecurringExpense] = useState(false);
    // Track remaining balance for debts
    const [remainingBalance, setRemainingBalance] = useState(0);

    // Handle saving the new category
    const saveNewCategory = async () => {
        try {
            // Prevent duplicate request
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

            // Refetch categories from backend to keep data fresh
            fetchCategories();
        } catch (error) {
            message.error("Failed to save category.");
        } finally {
            setIsModalVisible(false);
            setNewCategory(""); // Reset input tracking
        }
    };

    // useEffect(() => {
    //     switch (activeTab) {
    //         case "income":
    //             incomeForm.resetFields();
    //             break;
    //         case "recurringExpense":
    //             recurringExpenseForm.resetFields();
    //             break;
    //         case "investment":
    //             investmentForm.resetFields();
    //             break;
    //         case "savings":
    //             savingsForm.resetFields();
    //             break;
    //         case "debt":
    //             debtForm.resetFields();
    //             break;
    //         default:
    //             form.resetFields();
    //     }
    // }, [activeTab]);


    const fetchCategories = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/v1/categories", { headers });
            const categoryOptions = res.data.map((c) => ({ value: c.name.toLowerCase(), label: c.name })); // Convert to lowercase
            setCategories(categoryOptions);
        } catch (error) {
            console.error("Error fetching categories", error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // const enterPressed = useRef(false);

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

    useEffect(() => {
        if (activeTab === "debt") {
            const totalAmount = debtForm.getFieldValue("totalAmount") || 0;
            const amountPaid = debtForm.getFieldValue("amountPaid") || 0;
            setRemainingBalance(totalAmount - amountPaid);
        }
    }, [activeTab, debtForm]);



    const handleSave = async (values) => {
        console.log("Submitting Data:", values); // Debugging output
        console.log("Active Tab:", activeTab); // Debugging output

        try {
            let endpoint = "";
            let payload = {};

            switch (activeTab) {
                case "income":
                    endpoint = "/api/v1/income";
                    payload = {
                        source: values.source, // Updated from previous version to match UI
                        amount: values.amount.toString(), // Convert to string for encryption
                        dateReceived: values.dateReceived ? values.dateReceived.toISOString() : null, // Convert Moment.js object to ISO string
                        category: values.category ? values.category.toLowerCase() : "", // Normalize category case
                        recurring: values.recurring ?? false, // Ensure it's a boolean
                        notes: values.notes || "", // Ensure notes field is always included
                    };

                    if (values.recurring) {
                        payload.frequency = values.frequency;
                        payload.nextDate = values.nextDate ? values.nextDate.toISOString() : null; // Convert Moment.js object to ISO string
                    }
                    break;

                case "recurringExpense":
                    console.log("Handling Recurring Expense:", values); // Debugging log
                    console.log("Recurring expense form values:", recurringExpenseForm.getFieldsValue());

                    endpoint = "/api/v1/recurring-expenses";
                    payload = {
                        name: values.name,
                        amount: values.amount.toString(),
                        dueDate: values.dueDate ? values.dueDate.toISOString() : null,
                        frequency: values.frequency,
                        autoPay: values.autoPay ?? false,
                        notificationsEnabled: false,
                        notes: values.notes || "",
                    };
                    break;

                case "investment":
                    console.log("Handling Investment:", values);

                    endpoint = "/api/v1/investments";
                    payload = {
                        name: values.name,
                        type: values.type,
                        amount: values.amount.toString(), // Convert to string for encryption
                        purchaseDate: values.purchaseDate ? values.purchaseDate.toISOString() : null,
                        currentValue: values.currentValue.toString(),
                        profitLoss: values.profitLoss.toString(),
                        notes: values.notes || "",
                    };
                    break;
                case "savings":
                    endpoint = "/api/v1/savings";
                    payload = {
                        goalName: values.goal,
                        targetAmount: values.targetAmount,
                        savedAmount: values.currentAmount,
                        deadline: values.deadline || new Date().toISOString(),  // Ensure deadline is not undefined
                        progress: ((values.currentAmount / values.targetAmount) * 100).toFixed(2), // Ensure progress exists
                        notes: values.notes || "" // Default to empty string if undefined
                    };
                    break;

                case "debt":
                    endpoint = "/api/v1/debts";
                    payload = {
                        lender: values.lender,
                        totalAmount: values.totalAmount ? values.totalAmount.toString() : "0",
                        paidAmount: values.paidAmount ? values.paidAmount.toString() : "0",
                        dueDate: values.dueDate ? values.dueDate.toISOString() : new Date().toISOString(),
                        interestRate: values.interestRate ? values.interestRate.toString() : "0",
                        notes: values.notes || "",
                    };
                    break;
                default:
                    return;
            }

            console.log("Formatted Payload:", payload); // Debugging output

            await axios.post(`http://localhost:5000${endpoint}`, payload, { headers });
            message.success(`${activeTab} saved successfully!`);
            if (activeTab === "income") {
                incomeForm.resetFields();
            } else if (activeTab === "recurringExpense") {
                recurringExpenseForm.resetFields();
            } else if (activeTab === "investments") {
                investmentForm.resetFields();
            } else if (activeTab === "savings") {
                savingsForm.resetFields();
            } else if (activeTab === "debts") {
                debtForm.resetFields();
            }
            setIsRecurringIncome(false);
            setIsRecurringExpense(false);
        } catch (error) {
            console.error("Error Response:", error.response?.data || error.message);
            message.error("Error saving data.");
        }
    };

    const handleTabChange = (key) => {
        console.log("Switching Tab To:", key);
        setActiveTab(key);
    };

    return (
        <div style={{ maxWidth: "700px", margin: "0 auto", padding: "20px" }}>
            <h2>Financial Tracker</h2>

            <Tabs activeKey={activeTab} onChange={handleTabChange}>
                {/* INCOME TAB */}
                <TabPane TabPane tab="Income" key="income">
                    <Form form={incomeForm} layout="vertical" onFinish={handleSave}>
                        <Form.Item name="source" label="Source" rules={[{ required: true }]}>
                            <Input placeholder="Salary, Business, etc." />
                        </Form.Item>
                        <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
                            <Input type="number" />
                        </Form.Item>
                        <Form.Item name="dateReceived" label="Date Received" rules={[{ required: true }]}>
                            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                        </Form.Item>

                        <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                            <Select
                                showSearch
                                allowClear
                                placeholder="Select or type a category"
                                options={categories}
                                onSearch={handleCategoryChange}  // Detect user input
                                onBlur={handleCategoryBlur}      // Show modal when focus leaves
                                onSelect={handleCategorySelect}  // Handle selection or Enter press
                                onInputKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault(); // Prevent form submission
                                        handleCategoryBlur(); // Trigger modal check
                                    }
                                }}
                                filterOption={(input, option) =>
                                    option.label.toLowerCase().includes(input.toLowerCase())
                                }
                            />
                        </Form.Item>

                        <Form.Item label="Recurring?">
                            <Switch onChange={(checked) => setIsRecurringIncome(checked)} />
                        </Form.Item>
                        {isRecurringIncome && (
                            <>
                                <Form.Item name="frequency" label="Frequency" rules={[{ required: true }]}>
                                    <Select options={[
                                        { value: "daily", label: "Daily" },
                                        { value: "weekly", label: "Weekly" },
                                        { value: "monthly", label: "Monthly" },
                                        { value: "yearly", label: "Yearly" }
                                    ]} />
                                </Form.Item>
                                <Form.Item name="nextDate" label="Next Payment Date">
                                    <DatePicker style={{ width: "100%" }} />
                                </Form.Item>
                            </>
                        )}
                        <Form.Item name="notes" label="Notes">
                            <TextArea rows={3} />
                        </Form.Item>
                        <Button type="primary" htmlType="submit">Save Income</Button>
                    </Form>
                </TabPane>

                {/* RECURRING EXPENSES TAB */}
                <TabPane tab="Recurring Expenses" key="recurringExpense">
                    <Form form={recurringExpenseForm} layout="vertical" onFinish={handleSave}>

                        <Form.Item name="name" label="Expense Name" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
                            <Input type="number" />
                        </Form.Item>
                        <Form.Item name="dueDate" label="Due Date" rules={[{ required: true }]}>
                            <DatePicker style={{ width: "100%" }} />
                        </Form.Item>
                        <Form.Item name="frequency" label="Frequency" rules={[{ required: true }]}>
                            <Select options={[
                                { value: "daily", label: "Daily" },
                                { value: "weekly", label: "Weekly" },
                                { value: "monthly", label: "Monthly" },
                                { value: "yearly", label: "Yearly" }
                            ]} />
                        </Form.Item>
                        <Form.Item name="autoPay" label="Auto Pay" valuePropName="checked">
                            <Switch />
                        </Form.Item>
                        <Form.Item name="notes" label="Notes">
                            <TextArea rows={3} />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" >
                            Save Expense
                        </Button>

                    </Form>
                </TabPane>

                {/* INVESTMENTS TAB */}
                <TabPane tab="Investments" key="investment">
                    <Form form={investmentForm} layout="vertical" onFinish={handleSave}>
                        <Form.Item name="name" label="Investment Name" rules={[{ required: true }]}>
                            <Input placeholder="e.g. Apple Stocks, Bitcoin" />
                        </Form.Item>
                        <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                            <Select options={[
                                { value: "Stock", label: "Stock" },
                                { value: "Mutual Fund", label: "Mutual Fund" },
                                { value: "Crypto", label: "Crypto" },
                                { value: "Real Estate", label: "Real Estate" },
                                { value: "Others", label: "Others" }
                            ]} />
                        </Form.Item>
                        <Form.Item name="amount" label="Purchase Amount" rules={[{ required: true }]}>
                            <Input type="number" placeholder="Enter amount invested (e.g. 5000)" />
                        </Form.Item>
                        <Form.Item name="purchaseDate" label="Purchase Date">
                            <DatePicker style={{ width: "100%" }} />
                        </Form.Item>
                        <Form.Item name="currentValue" label="Current Value">
                            <Input type="number" />
                        </Form.Item>
                        <Form.Item name="profitLoss" label="Profit/Loss">
                            <Input type="number" />
                        </Form.Item>
                        <Form.Item name="notes" label="Notes">
                            <TextArea rows={3} placeholder="Additional details about this investment (optional)" />
                        </Form.Item>
                        <Button type="primary" htmlType="submit">Save Investment</Button>
                    </Form>
                </TabPane>


                {/* SAVINGS TAB */}
                <TabPane tab="Savings" key="savings">
                    <Form form={savingsForm} layout="vertical" onFinish={handleSave}>
                        <Form.Item name="goal" label="Savings Goal" rules={[{ required: true }]} >
                            <Input placeholder="E.g., Buy a car, Vacation fund" />
                        </Form.Item>
                        <Form.Item name="targetAmount" label="Target Amount" rules={[{ required: true }]} >
                            <Input type="number" placeholder="E.g., 5000" />
                        </Form.Item>
                        <Form.Item name="currentAmount" label="Current Amount">
                            <Input type="number" placeholder="E.g., 2000" />
                        </Form.Item>
                        <Form.Item name="deadline" label="Deadline">
                            <DatePicker style={{ width: "100%" }} placeholder="Select deadline" />
                        </Form.Item>
                        <Form.Item name="notes" label="Notes">
                            <TextArea rows={3} placeholder="Additional details" />
                        </Form.Item>
                        <Button type="primary" htmlType="submit">Save</Button>
                    </Form>
                </TabPane>

                {/* DEBTS TAB */}
                <TabPane tab="Debts" key="debt">
                    <Form form={debtForm} layout="vertical" onFinish={handleSave} initialValues={{
                        amountPaid: 0,
                        remainingBalance: 0,
                    }}>
                        <Form.Item name="lender" label="Lender" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="totalAmount" label="Total Debt Amount" rules={[{ required: true }]}>
                            <Input type="number" onChange={() => setRemainingBalance(debtForm.getFieldValue("totalAmount") - debtForm.getFieldValue("amountPaid"))} />
                        </Form.Item>
                        <Form.Item name="amountPaid" label="Amount Paid">
                            <Input type="number" onChange={() => setRemainingBalance(debtForm.getFieldValue("totalAmount") - debtForm.getFieldValue("amountPaid"))} />
                        </Form.Item>
                        <Form.Item name="remainingBalance" label="Remaining Balance">
                            <Input type="number" value={remainingBalance} readOnly />
                        </Form.Item>
                        <Form.Item name="dueDate" label="Due Date">
                            <DatePicker style={{ width: "100%" }} />
                        </Form.Item>
                        <Form.Item name="notes" label="Notes">
                            <TextArea rows={3} />
                        </Form.Item>
                        <Button type="primary" htmlType="submit">Save Debt</Button>
                    </Form>
                </TabPane>
            </Tabs>

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
        </div >
    );
};

export default FinanceTracker;
