import React, { useState, useEffect } from 'react';
import { Menu, Button } from 'antd';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const updateUser = () => {
            const storedUser = localStorage.getItem('user');
            setUser(storedUser ? JSON.parse(storedUser) : null);
        }

        updateUser();

        window.addEventListener('storage', updateUser);

        return () => {
            window.removeEventListener('storage', updateUser);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    const menuItems = [
        { label: <Link to="/">Home</Link>, key: '/' },
        { label: <Link to="/add-transaction">Add Transaction</Link>, key: '/add-transaction' },
        { label: <Link to="/report">Report</Link>, key: '/report' },
        user
            ? {
                label: (
                    <Button type="primary" danger onClick={handleLogout}>
                        Logout
                    </Button>
                ),
                key: 'logout',
            }
            : {
                label: <Link to="/login"><Button type="primary">Login / Register</Button></Link>,
                key: 'login',
            },
    ];

    return (
        <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['/']}
            items={menuItems}
            style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}
        />
    );
};

export default Navbar;