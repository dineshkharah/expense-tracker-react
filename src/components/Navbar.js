import React from 'react';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';

const items = [
    { label: <Link to="/">Home</Link>, key: '/' },
    { label: <Link to="/expenses">Expenses</Link>, key: '/expenses' },
    { label: <Link to="/report">Report</Link>, key: '/report' },
];

const Navbar = () => (
    <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['/']} items={items} style={{ display: "flex", justifyContent: "center", gap: "1rem" }} />
);

export default Navbar;
