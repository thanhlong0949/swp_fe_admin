import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './login.css';
import { Form, Input, Button, message, Spin } from 'antd';
import api from '../component/config/axios.jsx';

function LoginAdmin() {
  const navigate = useNavigate(); 
  const [loginError, setLoginError] = useState(null);
  const [loading, setLoading] = useState(false);
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await api.post('auth/loginstaff', values);
      const {token} = response.data;
      

      localStorage.setItem('token', token);
      
      localStorage.setItem('user', JSON.stringify(response.data));
      message.success("Đăng nhập thành công")
      await api.post('OrderDetail/update');
      navigate('/admin');
    } catch (error) {
      console.error('Error during login:', error.response ? error.response.data : error.message);
      setLoginError('Tài khoản hoặc mật khẩu không đúng!'); 
      message.error('Tài khoản hoặc mật khẩu không đúng!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src="/assets/logo.jpg" alt="Logo" className="logo" />
        <h2>KOI Shipping ADMIN</h2>
        <h3>Đăng Nhập</h3>
        {loading && <Spin size="large" />}
        <Form
          name="login"
          labelCol={{ span: 24 }}
          initialValues={{ remember: true }}
          onFinish={onFinish} 
        
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Vui lòng nhập email!' }, 
              { type: 'email', message:<span>Email không đúng định dạng!<br /> VD: abc@gmail.com </span> }]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>

          <Form.Item>
            <Button type="submit" htmlType="submit" className="login-button">
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        {loginError && <div className="error-message">{loginError}</div>}

        
      </div>
    </div>
  );
}

export default LoginAdmin;