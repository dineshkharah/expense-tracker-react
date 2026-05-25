import { theme } from "antd";

export const getAntdTheme = (isDark) => ({
  algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
  token: isDark
    ? {
        colorPrimary: "#3b82f6",
        colorBgBase: "#0f172a",
        colorBgContainer: "#1e3a5f",
        colorBgElevated: "#1e3a5f",
        colorBorder: "#334155",
        colorText: "#f1f5f9",
        colorTextSecondary: "#94a3b8",
      }
    : {
        colorPrimary: "#3b82f6",
      },
});
