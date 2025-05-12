import React from 'react';
import { Card, Button, Table, Row, Col, Typography, Divider } from 'antd';
import { Line, Column } from '@ant-design/plots';

const { Title } = Typography;

const Report = () => {
    // Mock data for the summary table
    const expenseData = [
        { key: 1, person: 'Alice', amount: 50, type: 'Outgoing' },
        { key: 2, person: 'Bob', amount: 30, type: 'Incoming' },
        // Add more rows as needed
    ];

    // Updated table columns for summary section
    const columns = [
        { title: 'Person', dataIndex: 'person', key: 'person' },
        { title: 'Amount', dataIndex: 'amount', key: 'amount' },
        { title: 'Type', dataIndex: 'type', key: 'type' },
    ];

    // Mock data for Monthly Balance Trends
    const monthlyBalanceData = [
        { month: 'January', balance: 100 },
        { month: 'February', balance: -50 },
        { month: 'March', balance: 120 },
        // Add more data as needed
    ];

    // Config for Monthly Balance Trends chart
    const monthlyBalanceConfig = {
        data: monthlyBalanceData,
        xField: 'month',
        yField: 'balance',
        point: { size: 5, shape: 'diamond' },
        lineStyle: { lineWidth: 2 },
    };

    // Mock data for Frequent Interactions
    const interactionData = [
        { person: 'Alice', interactions: 10 },
        { person: 'Bob', interactions: 5 },
        { person: 'Charlie', interactions: 7 },
        // Add more data as needed
    ];

    // Config for Frequent Interactions chart
    const interactionsConfig = {
        data: interactionData,
        xField: 'person',
        yField: 'interactions',
        columnStyle: { radius: [5, 5, 0, 0] },
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
            <Title level={2}>Expense Report</Title>

            <Divider />

            {/* Summary Section */}
            <Card title="Summary" style={{ marginBottom: 20 }}>
                <Table columns={columns} dataSource={expenseData} pagination={false} />
            </Card>

            {/* Monthly Balance Trends */}
            <Card title="Monthly Balance Trends" style={{ marginBottom: 20 }}>
                <Line {...monthlyBalanceConfig} />
            </Card>

            {/* Frequent Interactions */}
            <Card title="Frequent Interactions">
                <Column {...interactionsConfig} />
            </Card>

            <Divider />

            {/* Export Options */}
            <Row gutter={16}>
                <Col span={12}>
                    <Button type="default" style={{ width: '100%' }}>
                        Export as PDF
                    </Button>
                </Col>
                <Col span={12}>
                    <Button type="default" style={{ width: '100%' }}>
                        Export as CSV
                    </Button>
                </Col>
            </Row>
        </div>
    );
};

export default Report;
