import React from "react";
import { Card, Table, Button } from "antd";

const RecentTransactions = ({ transactions, columns, onViewAll }) => {
  return (
    <Card
      title="Recent Transactions"
      className="mt-6 !rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm"
      extra={
        <Button type="link" onClick={onViewAll} className="!text-sm">
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
