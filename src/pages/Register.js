import React, { useState } from 'react'
import { Form, Input, Button, message } from 'antd'
// import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Register = () => {
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleRegister = async (values) => {
        setLoading(true)
        try {
            // const response = await axios.post('http://localhost:5000/api/v1/auth/register', values)

            message.success('Registration successful')
            navigate('/login')
        } catch (error) {
            message.error(error.response?.data?.message || 'Something went wrong') //the reason for ? is to prevent error if response is undefined
            console.log("Error: ", error)
        } finally {
            setLoading(false)
        }

    }


    return (
        <div style={{ maxWidth: '400px', margin: '3rem auto', padding: '2rem', borderRadius: "2rem", boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px" }}>
            <h2>Register</h2>
            <Form layout='vertical' onFinish={handleRegister}>
                <Form.Item
                    label='Name'
                    name='name'
                    rules={[{ required: true, message: 'Please enter your name' }]}
                >
                    <Input placeholder='Name' />
                </Form.Item>
                <Form.Item
                    label='Email'
                    name='email'
                    rules={[{ required: true, type: 'email', message: 'Please enter your email' }]}
                >
                    <Input placeholder='Email' />
                </Form.Item>
                <Form.Item
                    label='Password'
                    name='password'
                    rules={[{ required: true, message: 'Please enter your password' }]}
                >
                    <Input.Password placeholder='Password' />
                </Form.Item>
                <Button type='primary' htmlType='submit' loading={loading}>Register</Button>

            </Form>
        </div>
    )
}

export default Register