import React from "react";
import { Typography, Button } from "antd";

const { Title } = Typography;

const PageHeader = ({ title, onAdd }) => {
  return (
    <div className="flex justify-between items-center flex-wrap mb-4">
      <Title level={2} className="!m-0">
        {title}
      </Title>
      <Button type="primary" onClick={onAdd} className="ml-auto">
        + Add Transaction
      </Button>
    </div>
  );
};

export default PageHeader;
