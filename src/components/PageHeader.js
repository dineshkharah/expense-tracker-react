import React from "react";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const PageHeader = ({ title, subtitle, onAdd, addLabel = "Add Transaction" }) => {
  return (
    <div className="flex justify-between items-start flex-wrap gap-3 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-slate-100 m-0">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 mb-0">
            {subtitle}
          </p>
        )}
      </div>
      {onAdd && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAdd}
          className="!rounded-xl !h-10 !px-5 shadow-sm"
        >
          {addLabel}
        </Button>
      )}
    </div>
  );
};

export default PageHeader;
