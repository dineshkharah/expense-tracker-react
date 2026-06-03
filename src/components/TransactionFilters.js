import React from "react";
import { Select, Input, DatePicker, Button } from "antd";
import {
  FileExcelOutlined,
  FilePdfOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import TransactionSearch from "./TransactionSearch";

const { Option } = Select;
const { RangePicker } = DatePicker;

const TransactionFilters = ({
  filters,
  setFilters,
  transactions,
  onExportCSV,
  onExportPDF,
  onClearFilters,
}) => {
  return (
    <div className="mb-5 rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-4">
      {/* Filter Row */}
      <div className="flex flex-wrap gap-3 w-full">
        {/* Search */}
        <TransactionSearch
          value={filters.search}
          onChange={(value) => setFilters({ ...filters, search: value })}
        />

        {/* Type */}
        <Select
          placeholder="Type"
          allowClear
          value={filters.type || undefined}
          onChange={(value) => setFilters({ ...filters, type: value })}
          className="w-full sm:w-[160px]"
        >
          <Option value="income">Income</Option>
          <Option value="expense">Expense</Option>
        </Select>

        {/* Category */}
        <Input
          placeholder="Category"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="w-full sm:w-[180px]"
        />

        {/* Date range */}
        <RangePicker
          value={filters.dateRange}
          onChange={(dates) =>
            setFilters({ ...filters, dateRange: dates || [] })
          }
          className="flex-1 min-w-[260px]"
          format="DD-MM-YYYY"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mt-3">
        <Button
          onClick={() => onExportCSV(transactions)}
          type="primary"
          icon={<FileExcelOutlined />}
        >
          Export CSV
        </Button>

        <Button
          onClick={() => onExportPDF(transactions)}
          icon={<FilePdfOutlined />}
        >
          Export PDF
        </Button>

        <Button
          onClick={onClearFilters}
          icon={<ClearOutlined />}
          className="sm:ml-auto"
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
};

export default TransactionFilters;
