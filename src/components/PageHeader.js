import React from "react";
import { Typography, Button } from "antd";

const { Title } = Typography;

const PageHeader = ({ title, onAdd }) => {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
            }}
        >
            <Title level={2} style={{ margin: 0 }}>
                {title}
            </Title>

            <Button
                type="primary"
                size="medium"
                onClick={onAdd}
                style={{ marginLeft: "auto" }}
            >
                + Add Transaction
            </Button>
        </div>
    );
};

export default PageHeader;
