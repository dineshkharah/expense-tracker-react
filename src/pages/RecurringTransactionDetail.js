import React, { useState } from 'react'
import { Modal, Tag, Button, Table, message } from 'antd'
import axios from 'axios'
import dayjs from 'dayjs'

const token = localStorage.getItem("token")
const headers = { Authorization: `Bearer ${token}` }

const RecurringTransactionDetail = ({ visible, onClose, recurring, refreshList }) => {
    const [loading, setLoading] = useState(false)

    if (!recurring) return null

    const handleAction = async (action) => {
        try {
            setLoading(true);
            await axios.post(
                `http://localhost:5000/api/v1/recurring-transactions/${recurring._id}/execute`,
                { action },
                { headers }
            )
            message.success("Action executed successfully.")
            refreshList()
            onClose()
        } catch (error) {
            console.error("Error:", error)
            message.error("An error occurred.")
        } finally {
            setLoading(false)
        }

    }

    const historyColumns = [
        { title: 'Date', dataIndex: 'date', key: 'date', render: d => dayjs(d).format('DD MMM YYYY') },
        { title: 'Amount', dataIndex: 'amount', key: 'amount', render: a => `$${a.toFixed(2)}` },
        {
            title: 'Status', dataIndex: 'status', key: 'status', render: status => (
                <Tag color={status === 'paid' ? 'green' : status === 'skipped' ? 'orange' : 'blue'}>
                    {status.toUpperCase()}
                </Tag>
            )
        },
        {
            title: "Snoozed Until", dataIndex: "snoozedUntil", key: "snoozedUntil",
            render: d => d ? dayjs(d).format("DD MMM YYYY") : "-"
        }

    ]

    return (
        <Modal
            title={`${recurring.source}`}
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="skip" onClick={() => handleAction("skipped")} disabled={loading}>
                    Skip
                </Button>,
                <Button key="snooze" onClick={() => handleAction("snoozed")} disabled={loading}>
                    Snooze
                </Button>,
                <Button key="paid" type="primary" onClick={() => handleAction("paid")} loading={loading}>
                    Mark Paid
                </Button>
            ]}
            width={800}
        >
            <p><b>Category:</b> {recurring.category}</p>
            <p><b>Amount:</b> ₹{recurring.latestAmount}</p>
            <p><b>Frequency:</b> {recurring.frequency}</p>
            <p><b>Next Date:</b> {dayjs(recurring.nextDate).format("DD MMM YYYY")}</p>
            <p><b>Notes:</b> {recurring.notes || "-"}</p>

            <h3 style={{ marginTop: "20px" }}>History</h3>
            <Table
                columns={historyColumns}
                dataSource={recurring.history}
                rowKey="_id"
                pagination={{ pageSize: 5 }}
                size="small"
            />
        </Modal>
    );
};

export default RecurringTransactionDetail;