import React from "react";
import { Card, Row, Col, Button } from "antd";
import dayjs from "dayjs";

const UpcomingRecurrings = ({ recurrings, onSelectRecurring, onManage }) => {
    return (
        <Card
            title="Upcoming Recurring Payments & Income"
            className="mt-6"
            extra={
                <Button type="link" onClick={onManage} style={{ fontSize: "14px" }}>
                    Manage Recurring
                </Button>
            }
        >
            {recurrings.length === 0 ? (
                <p className="text-gray-500 text-sm">
                    No upcoming recurring payments in the next cycles.
                </p>
            ) : (
                <Row gutter={[16, 16]}>
                    {recurrings.map((r) => (
                        <Col xs={24} md={8} key={r._id}>
                            <Card
                                size="small"
                                style={{
                                    borderRadius: "12px",
                                    boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: 4,
                                    }}
                                >
                                    <span style={{ fontWeight: 600 }}>{r.source}</span>
                                    <span
                                        style={{
                                            fontSize: "0.75rem",
                                            fontWeight: 600,
                                            color: r.type === "income" ? "#16a34a" : "#b91c1c",
                                        }}
                                    >
                                        {r.type === "income" ? "INCOME" : "EXPENSE"}
                                    </span>
                                </div>

                                <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                                    {r.category}
                                </p>

                                <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                                    ₹{r.latestAmount ?? "-"}
                                </p>

                                <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                                    Next on {dayjs(r.nextDate).format("DD MMM YYYY")}
                                </p>

                                <Button
                                    size="small"
                                    type="link"
                                    onClick={() => onSelectRecurring(r)}
                                    style={{ padding: 0 }}
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
