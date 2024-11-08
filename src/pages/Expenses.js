import React, { useState } from 'react';
import { Button, Modal, Form, Select, Switch, DatePicker, Input, message } from 'antd';

const { TextArea } = Input;

const Expenses = () => {
    const [form] = Form.useForm();
    const [isNameModalVisible, setIsNameModalVisible] = useState(false);
    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
    const [personName, setPersonName] = useState('');
    const [category, setCategory] = useState('');
    const [isIncoming, setIsIncoming] = useState(false);
    const [date, setDate] = useState(null);
    const [notes, setNotes] = useState('');
    const [existingNames, setExistingNames] = useState(['Alice', 'Bob']);
    const [existingCategories, setExistingCategories] = useState(['Food', 'Prints']);

    const [tempPersonName, setTempPersonName] = useState('');
    const [tempCategory, setTempCategory] = useState('');

    // Handle adding new person name to the list
    const handleAddName = () => {
        setExistingNames([...existingNames, tempPersonName]);
        setIsNameModalVisible(false);
        message.success(`Name "${tempPersonName}" added successfully!`);
        setTempPersonName('');  // Clear temporary value
        setPersonName('');       // Reset form field
    };

    // Handle adding new category to the list
    const handleAddCategory = () => {
        setExistingCategories([...existingCategories, tempCategory]);
        setIsCategoryModalVisible(false);
        message.success(`Category "${tempCategory}" added successfully!`);
        setTempCategory('');     // Clear temporary value
        setCategory('');         // Reset form field
    };

    // Clear tempPersonName when name modal is canceled
    const handleCancelNameModal = () => {
        setIsNameModalVisible(false);
        setTempPersonName(''); // Clear temporary value to prevent addition to dropdown
    };

    // Clear tempCategory when category modal is canceled
    const handleCancelCategoryModal = () => {
        setIsCategoryModalVisible(false);
        setTempCategory(''); // Clear temporary value to prevent addition to dropdown
    };

    // Save expense form data and clear fields
    const handleSaveExpense = () => {
        form.validateFields().then((values) => {
            console.log('Saved Expense:', {
                person: values.personName,
                category: values.category,
                isIncoming
            });
            message.success('Expense saved successfully!');
            form.resetFields();
            setPersonName('');
            setCategory('');
            setIsIncoming(false);
        }).catch(() => {
            message.error('Please complete all required fields.');
        });
    };

    // Show modal if typed name is not in existingNames (onBlur or Enter press)
    const handleNameBlur = () => {
        if (personName && !existingNames.includes(personName)) {
            setTempPersonName(personName); // Set temp value for modal
            setIsNameModalVisible(true);
        }
    };

    // Show modal if typed category is not in existingCategories (onBlur or Enter press)
    const handleCategoryBlur = () => {
        if (category && !existingCategories.includes(category)) {
            setTempCategory(category); // Set temp value for modal
            setIsCategoryModalVisible(true);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <h2>Track Expenses</h2>
            <Form layout="vertical" form={form}>
                <Form.Item
                    label="Person's Name"
                    name="personName"
                    rules={[{ required: true, message: 'Please enter a name or select an existing one!' }]}
                >
                    <Select
                        showSearch
                        placeholder="Enter or select a name"
                        value={personName || undefined}
                        onChange={(value) => setPersonName(value)}
                        onSearch={(value) => setPersonName(value)}
                        onBlur={handleNameBlur}
                        onInputKeyDown={(e) => e.key === 'Enter' && handleNameBlur()}  // Handle Enter key for Name
                        options={existingNames.map((name) => ({ value: name, label: name }))}
                        dropdownStyle={{ maxHeight: 150, overflowY: 'scroll' }}
                    />
                </Form.Item>

                <Form.Item
                    label="Expense Category"
                    name="category"
                    rules={[{ required: true, message: 'Please enter a category or select an existing one!' }]}
                >
                    <Select
                        showSearch
                        placeholder="Enter or select a category"
                        value={category || undefined}
                        onChange={(value) => setCategory(value)}
                        onSearch={(value) => setCategory(value)}
                        onBlur={handleCategoryBlur}
                        onInputKeyDown={(e) => e.key === 'Enter' && handleCategoryBlur()}  // Handle Enter key for Category
                        options={existingCategories.map((cat) => ({ value: cat, label: cat }))}
                        dropdownStyle={{ maxHeight: 150, overflowY: 'scroll' }}
                    />
                </Form.Item>

                {/* Date Picker */}
                <Form.Item
                    label="Expense Date"
                    name="date"
                    rules={[{ required: true, message: 'Please select a date for the expense!' }]}
                >
                    <DatePicker
                        style={{ width: '100%' }}
                        onChange={(date, dateString) => setDate(dateString)}
                    />
                </Form.Item>

                <Form.Item
                    label="Notes"
                    name="notes"
                >
                    <TextArea
                        rows={3}
                        placeholder="Optional: Add any details about this expense"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </Form.Item>

                <Form.Item label="Transaction Type">
                    <Switch
                        checkedChildren="Incoming"
                        unCheckedChildren="Outgoing"
                        checked={isIncoming}
                        onChange={setIsIncoming}
                    />
                </Form.Item>

                <Button type="primary" onClick={handleSaveExpense} style={{ width: '100%' }}>
                    Save Expense
                </Button>
            </Form>

            <Modal
                title="Save New Name"
                visible={isNameModalVisible}
                onOk={handleAddName}
                onCancel={handleCancelNameModal}
            >
                <p>Do you want to save "{tempPersonName}" for future use?</p>
            </Modal>

            <Modal
                title="Save New Category"
                visible={isCategoryModalVisible}
                onOk={handleAddCategory}
                onCancel={handleCancelCategoryModal}
            >
                <p>Do you want to save "{tempCategory}" as a new category?</p>
            </Modal>
        </div>
    );
};

export default Expenses;