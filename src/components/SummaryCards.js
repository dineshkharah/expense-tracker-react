import React from "react";
import { Card, Row, Col } from "antd";

const SummaryCards = ({ totalIncome, totalExpenses, net, month }) => {
  const netPositive = net >= 0;

  return (
    <>
      {/* Desktop: 3 cards */}
      <Row gutter={16} className="hidden md:flex">
        <Col md={8} style={{ padding: "1rem" }}>
          <Card
            style={{
              background: "#dcfce7",
              borderRadius: "16px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            }}
          >
            <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#166534" }}>
              {month} Income
            </h2>
            <p
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#14532d",
              }}
            >
              ₹{totalIncome.toLocaleString()}
            </p>
          </Card>
        </Col>

        <Col md={8} style={{ padding: "1rem" }}>
          <Card
            style={{
              background: "#fee2e2",
              borderRadius: "16px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            }}
          >
            <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#991b1b" }}>
              {month} Expenses
            </h2>
            <p
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#7f1d1d",
              }}
            >
              ₹{totalExpenses.toLocaleString()}
            </p>
          </Card>
        </Col>

        <Col md={8} style={{ padding: "1rem" }}>
          <Card
            style={{
              background: netPositive ? "#e0f2fe" : "#fef9c3",
              borderRadius: "16px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            }}
          >
            <h2
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                color: netPositive ? "#1d4ed8" : "#854d0e",
              }}
            >
              {month} Net
            </h2>
            <p
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: netPositive ? "#1e3a8a" : "#713f12",
              }}
            >
              {netPositive ? "+" : ""}₹{net.toLocaleString()}
            </p>
          </Card>
        </Col>
      </Row>

      {/* Mobile: 1 card */}
      <div className="block md:hidden" style={{ padding: "1rem" }}>
        <Card
          style={{
            background: "#fee2e2",
            borderRadius: "16px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          <p
            style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "#991b1b",
              margin: 0,
            }}
          >
            Total Spending · {month}
          </p>
          <p
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#7f1d1d",
              margin: "4px 0 0 0",
            }}
          >
            ₹{totalExpenses.toLocaleString()}
          </p>
        </Card>
      </div>
    </>
  );
};

export default SummaryCards;
