import React, { useState, useRef } from "react";
import { Card, Button, message, Spin, Modal } from "antd";
import { CameraOutlined, FileImageOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const ScanBill = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [failModalOpen, setFailModalOpen] = useState(false);

  const acceptFile = (selected) => {
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      message.error("Please select an image file");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      message.error("Image must be under 5 MB");
      return;
    }

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleFileChange = (e) => {
    acceptFile(e.target.files?.[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  const handleScan = async () => {
    if (!file) {
      message.warning("Please select a bill image first");
      return;
    }

    setScanning(true);
    try {
      const formData = new FormData();
      formData.append("bill", file);

      const res = await api.post("/api/v1/transactions/scan", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { amount, source, category, date } = res.data || {};
      const gotSomething =
        amount != null || source != null || category != null || date != null;

      if (!gotSomething) {
        // Nothing usable was extracted - let the user decide what to do
        setFailModalOpen(true);
        return;
      }

      message.success("Bill scanned - please review the details");
      navigate("/add-transaction", { state: { scanned: res.data } });
    } catch (error) {
      console.error("Scan failed", error);
      message.error(error.response?.data?.message || "Could not scan the bill");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-5">
        <CameraOutlined className="text-2xl text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100 m-0">
          Scan Bill
        </h1>
      </div>

      <Card className="!rounded-2xl shadow-md dark:shadow-blue-900/20 border border-gray-100 dark:border-slate-700">
        {/* Hidden native input - no capture attr so phones offer camera AND gallery */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {!previewUrl ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-3 py-16 border-2 border-dashed rounded-2xl cursor-pointer transition ${
              isDragging
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500"
            }`}
          >
            <FileImageOutlined className="text-5xl text-gray-400 dark:text-slate-500" />
            <p className="text-gray-600 dark:text-slate-300 font-medium m-0">
              Tap to take a photo or choose an image
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500 m-0">
              or drag and drop · JPG or PNG, up to 5 MB
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <img
              src={previewUrl}
              alt="Bill preview"
              className="max-h-80 rounded-xl border border-gray-200 dark:border-slate-700 object-contain"
            />
            <Button onClick={() => fileInputRef.current?.click()}>
              Choose a different image
            </Button>
          </div>
        )}

        {scanning ? (
          <div className="flex flex-col items-center gap-2 mt-6">
            <Spin />
            <p className="text-sm text-gray-500 dark:text-slate-400 m-0">
              Reading your bill…
            </p>
          </div>
        ) : (
          <Button
            type="primary"
            size="large"
            block
            icon={<CameraOutlined />}
            onClick={handleScan}
            disabled={!file}
            className="mt-6"
          >
            Scan Bill
          </Button>
        )}

        <Button type="link" block onClick={() => navigate("/add-transaction")}>
          Enter manually instead
        </Button>
      </Card>

      {/* Shown when the scan extracted nothing usable */}
      <Modal
        open={failModalOpen}
        title="Couldn't read the bill"
        onCancel={() => setFailModalOpen(false)}
        footer={[
          <Button key="retry" onClick={() => setFailModalOpen(false)}>
            Try another image
          </Button>,
          <Button
            key="manual"
            type="primary"
            onClick={() => navigate("/add-transaction")}
          >
            Add manually
          </Button>,
        ]}
      >
        <p>
          We couldn't read the details from this image. Try a clearer photo, or
          add the transaction manually.
        </p>
      </Modal>
    </div>
  );
};

export default ScanBill;
