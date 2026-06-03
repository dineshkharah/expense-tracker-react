import React from "react";
import { Card, Row, Col, Button } from "antd";
import dayjs from "dayjs";

const UpcomingRecurrings = ({ recurrings, onSelectRecurring, onManage }) => {
  return (
    <Card
      title="Upcoming Recurring Payments & Income"
      className="mt-6 !rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm"
      extra={
        <Button type="link" onClick={onManage} className="!text-sm !p-0">
          Manage Recurring
        </Button>
      }
    >
      {recurrings.length === 0 ? (
        <p className="text-gray-500 dark:text-slate-400 text-sm">
          No upcoming recurring payments in the next cycles.
        </p>
      ) : (
        <Row gutter={[16, 16]}>
          {recurrings.map((r) => (
            <Col xs={24} md={8} key={r._id}>
              <Card
                size="small"
                className="!rounded-xl shadow-md dark:shadow-blue-900/60 border border-gray-100 dark:border-slate-600 !bg-white dark:!bg-slate-700"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-gray-800 dark:text-slate-100">
                    {r.source}
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      r.type === "income"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-700 dark:text-red-400"
                    }`}
                  >
                    {r.type === "income" ? "INCOME" : "EXPENSE"}
                  </span>
                </div>

                <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">
                  {r.category}
                </p>

                <p className="text-sm font-semibold text-gray-800 dark:text-slate-100 mb-1">
                  ₹{r.latestAmount ?? "-"}
                </p>

                <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">
                  Next on {dayjs(r.nextDate).format("DD MMM YYYY")}
                </p>

                <Button
                  size="small"
                  type="link"
                  onClick={() => onSelectRecurring(r)}
                  className="!p-0"
                >
                  View / Take Action
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Card>
  );
};

export default UpcomingRecurrings;
