// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Layout } from 'antd';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Expenses from './pages/Expenses';
import Report from './pages/Report';

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
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/report" element={<Report />} />
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
