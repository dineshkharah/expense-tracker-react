import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { Layout } from "antd";
import Navbar from "./components/Navbar";
import MobileBottomNav from "./components/MobileBottomNav";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import AddTransaction from "./pages/AddTransaction";
import Transaction from "./pages/Transaction";
import Report from "./pages/Report";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import RecurringTransactions from "./pages/RecurringTransaction";
import Notifications from "./pages/Notification";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoutes";

const { Content, Footer: AntFooter } = Layout;
const token = localStorage.getItem("token");

function App() {
  return (
    <Router>
      <Layout style={{ minHeight: "100vh" }}>
        <div className="hidden md:block">
          <Navbar />
        </div>

        <Content style={{ padding: "20px", paddingBottom: "90px" }}>
          <Routes>
            <Route
              path="/login"
              element={token ? <Navigate to="/" replace /> : <Login />}
            />
            <Route
              path="/register"
              element={token ? <Navigate to="/" replace /> : <Register />}
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
              path="/transactions"
              element={
                <ProtectedRoute>
                  <Transaction />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report"
              element={
                <ProtectedRoute>
                  <Report />
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
                  <RecurringTransactions />
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
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Content>
        <MobileBottomNav />
        <AntFooter style={{ textAlign: "center" }}>
          <Footer />
        </AntFooter>
      </Layout>
    </Router>
  );
}

export default App;
