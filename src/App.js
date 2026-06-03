import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { ConfigProvider } from "antd";
import Navbar from "./components/Navbar";
import MobileBottomNav from "./components/MobileBottomNav";
import MobileTopBar from "./components/MobileTopBar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import AddTransaction from "./pages/AddTransaction";
import ScanBill from "./pages/ScanBill";
import TransactionsHub from "./pages/TransactionsHub";
import Insights from "./pages/Insights";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notification";
import ProtectedRoute from "./components/ProtectedRoutes";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { getAntdTheme } from "./config/antdTheme";

const PublicRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? <Navigate to="/" replace /> : children;
};

const ThemedApp = () => {
  const { isDark } = useTheme();

  return (
    <ConfigProvider theme={getAntdTheme(isDark)}>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300 flex flex-col">
          <div className="hidden md:block">
            <Navbar />
          </div>

          <MobileTopBar />

          <div className="px-5 pb-24 pt-5 flex-1">
            <Routes>
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-transaction"
                element={
                  <ProtectedRoute>
                    <AddTransaction />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/scan-bill"
                element={
                  <ProtectedRoute>
                    <ScanBill />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions"
                element={
                  <ProtectedRoute>
                    <TransactionsHub />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/insights"
                element={
                  <ProtectedRoute>
                    <Insights />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/report"
                element={
                  <ProtectedRoute>
                    <Insights />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recurring-transactions"
                element={
                  <ProtectedRoute>
                    <TransactionsHub />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Insights />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>

          <MobileBottomNav />

          <div className="hidden md:block">
            <footer className="text-center py-4 text-sm text-gray-500 dark:text-slate-400 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <Footer />
            </footer>
          </div>
        </div>
      </Router>
    </ConfigProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
