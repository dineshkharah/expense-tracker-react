import React from "react";
import { Input } from "antd";

const TransactionSearch = ({ value, onChange }) => {
  return (
    <Input
      placeholder="Search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full sm:w-[220px]"
      allowClear
    />
  );
};

export default TransactionSearch;
