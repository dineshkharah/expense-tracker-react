import React, { useState, useEffect, useCallback } from "react";
import { Card, Input, Button, List, Popconfirm, message, Empty } from "antd";
import {
  WalletOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import api from "../utils/api";

// Self-contained wallet CRUD card, dropped into the Profile page.
const WalletManager = () => {
  const [wallets, setWallets] = useState([]);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const fetchWallets = useCallback(async () => {
    try {
      const res = await api.get("/api/v1/wallets");
      setWallets(res.data);
    } catch (error) {
      console.error("Error fetching wallets:", error);
      message.error("Failed to load wallets");
    }
  }, []);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    setAdding(true);
    try {
      await api.post("/api/v1/wallets", { name });
      message.success("Wallet added");
      setNewName("");
      fetchWallets();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to add wallet");
    } finally {
      setAdding(false);
    }
  };

  const handleSaveEdit = async (id) => {
    const name = editingName.trim();
    if (!name) return;
    try {
      await api.put(`/api/v1/wallets/${id}`, { name });
      message.success("Wallet updated");
      setEditingId(null);
      setEditingName("");
      fetchWallets();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to update wallet");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/v1/wallets/${id}`);
      message.success("Wallet deleted");
      fetchWallets();
    } catch (error) {
      message.error("Failed to delete wallet");
    }
  };

  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          <WalletOutlined /> Wallets
        </span>
      }
      className="!rounded-2xl shadow-sm dark:shadow-blue-900/20 border border-gray-100 dark:border-slate-700"
    >
      <p className="text-xs text-gray-400 dark:text-slate-500 mb-3">
        Track which account or source your transactions come from (e.g. HDFC,
        Cash, Paytm).
      </p>

      {/* Add new wallet */}
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="New wallet name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onPressEnter={handleAdd}
          maxLength={30}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          loading={adding}
        >
          Add
        </Button>
      </div>

      {/* Wallet list */}
      {wallets.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No wallets yet"
        />
      ) : (
        <List
          dataSource={wallets}
          renderItem={(w) => (
            <List.Item
              className="!px-0"
              actions={
                editingId === w._id
                  ? [
                      <Button
                        type="text"
                        icon={<CheckOutlined />}
                        onClick={() => handleSaveEdit(w._id)}
                      />,
                      <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={() => {
                          setEditingId(null);
                          setEditingName("");
                        }}
                      />,
                    ]
                  : [
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => {
                          setEditingId(w._id);
                          setEditingName(w.name);
                        }}
                      />,
                      <Popconfirm
                        title="Delete this wallet?"
                        description="Transactions keep their saved wallet label."
                        onConfirm={() => handleDelete(w._id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button type="text" danger icon={<DeleteOutlined />} />
                      </Popconfirm>,
                    ]
              }
            >
              {editingId === w._id ? (
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onPressEnter={() => handleSaveEdit(w._id)}
                  maxLength={30}
                  autoFocus
                />
              ) : (
                <span className="font-medium text-gray-700 dark:text-slate-200">
                  {w.name}
                </span>
              )}
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

export default WalletManager;
