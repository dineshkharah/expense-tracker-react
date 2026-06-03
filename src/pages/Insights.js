import React from "react";
import { Tabs, Typography } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { PieChartOutlined, FileTextOutlined } from "@ant-design/icons";
import Dashboard from "./Dashboard";
import Report from "./Report";

const { Title } = Typography;

// Insights merges the analytics views (Dashboard overview + monthly Report)
// into one destination with two tabs, so both are reachable on every device.
const Insights = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Allow /report and /dashboard to deep-link straight to a tab.
  const activeKey = location.pathname === "/report" ? "report" : "overview";

  const onTabChange = (key) => {
    navigate(key === "report" ? "/report" : "/dashboard", { replace: true });
  };

  return (
    <div className="p-6">
      <Title level={2} className="!m-0 !mb-4">
        Insights
      </Title>

      <Tabs
        activeKey={activeKey}
        onChange={onTabChange}
        items={[
          {
            key: "overview",
            label: (
              <span>
                <PieChartOutlined /> Overview
              </span>
            ),
            children: <Dashboard embedded />,
          },
          {
            key: "report",
            label: (
              <span>
                <FileTextOutlined /> Report
              </span>
            ),
            children: <Report embedded />,
          },
        ]}
      />
    </div>
  );
};

export default Insights;
