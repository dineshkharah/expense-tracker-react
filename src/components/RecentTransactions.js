import React from "react";
import { Card, Table, Button } from "antd";

const RecentTransactions = ({ transactions, columns, onViewAll }) => {
    return (
        <Card
            title="Recent Transactions"
            className="mt-6"
            extra={
                <Button type="link" onClick={onViewAll} style={{ fontSize: "14px" }}>
                    View All
                </Button>
            }
        >
            <Table
                dataSource={transactions}
                columns={columns}
                rowKey="_id"
                pagination={false}
                locale={{ emptyText: "No transactions found" }}
                scroll={{ x: "max-content" }}
            />
        </Card>
    );
};

export default RecentTransactions;
