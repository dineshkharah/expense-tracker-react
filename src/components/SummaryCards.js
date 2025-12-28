import React from "react";
import { Card, Row, Col } from "antd";

const SummaryCards = ({ balance, totalIncome, totalExpenses }) => {
    return (
        <Row gutter={16}>
            <Col xs={24} md={8} style={{ padding: "1rem" }}>
                <Card
                    style={{
                        background: "#e0f2fe",
                        borderRadius: "16px",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    }}
                >
                    <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#1d4ed8" }}>
                        Balance
                    </h2>
                    <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e3a8a" }}>
                        ₹{balance}
                    </p>
                </Card>
            </Col>

            <Col xs={24} md={8} style={{ padding: "1rem" }}>
                <Card
                    style={{
                        background: "#dcfce7",
                        borderRadius: "16px",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    }}
                >
                    <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#166534" }}>
                        Total Income
                    </h2>
                    <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#14532d" }}>
                        ₹{totalIncome}
                    </p>
                </Card>
            </Col>

            <Col xs={24} md={8} style={{ padding: "1rem" }}>
                <Card
                    style={{
                        background: "#fee2e2",
                        borderRadius: "16px",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    }}
                >
                    <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#991b1b" }}>
                        Total Expenses
                    </h2>
                    <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#7f1d1d" }}>
                        ₹{totalExpenses}
                    </p>
                </Card>
            </Col>
        </Row>
    );
};

export default SummaryCards;
