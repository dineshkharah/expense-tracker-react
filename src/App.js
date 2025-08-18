// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Layout } from 'antd';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import AddTransaction from './pages/AddTransaction';
import Transaction from './pages/Transaction';
import Report from './pages/Report';
import Login from './pages/Login';
import Register from './pages/Register';

const { Header, Content, Footer: AntFooter } = Layout;

function App() {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Header>
          <Navbar />
        </Header>
        <Content style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add-transaction" element={<AddTransaction />} />
            <Route path="/transactions" element={<Transaction />} />
            <Route path="/report" element={<Report />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </Content>
        <AntFooter style={{ textAlign: 'center' }}>
          <Footer />
        </AntFooter>
      </Layout>
    </Router>
  );
}

export default App;
