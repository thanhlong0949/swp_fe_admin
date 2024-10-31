import { Form, Input, Button, message } from 'antd';
import api from '../config/axios';
import React, { useState } from 'react';

const ChangePassword = () => {
    const [password, setPassword] = useState({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [refresh, setRefresh] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));
    const handleSubmit = async () => {
        password.oldPassword = password.oldPassword.trim();
        password.newPassword = password.newPassword.trim();
        password.confirmNewPassword = password.confirmNewPassword.trim();
        if (password.newPassword !== password.confirmNewPassword) {
            message.error('Mật khẩu mới không khớp');
        } else {
            try {
                const response = await api.post(`/Password/staff/change-password/${user.staffId}`, {
                    oldPassword: password.oldPassword,
                    newPassword: password.newPassword,
                });
                console.log(response);
                message.success('Đổi mật khẩu thành công');

                setPassword({
                    oldPassword: '',
                    newPassword: '',
                    confirmNewPassword: ''
                });
                setRefresh(prev => !prev);
            } catch (error) {
                console.log(error);
                error.response.data === 'Old password is incorrect.' ? message.error('Mật khẩu cũ không đúng') : message.error('Đổi mật khẩu thất bại');
            }
        }
    }
    return (
        <div key={refresh} style={{ padding: '20px', maxWidth: '600px', margin: 'auto', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
            <h1>Đổi mật khẩu</h1>
            <Form layout="vertical" onFinish={handleSubmit}>
                <Form.Item label="Mật khẩu cũ" name="oldPassword" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ của bạn' }]}>
                    <Input.Password placeholder="Mật khẩu cũ"  onChange={(e) => setPassword({ ...password, oldPassword: e.target.value })} />
                </Form.Item>
                <Form.Item label="Mật khẩu mới" name="newPassword" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới của bạn' }]}>
                    <Input.Password placeholder="Mật khẩu mới"  onChange={(e) => setPassword({ ...password, newPassword: e.target.value })} />
                </Form.Item>
                <Form.Item label="Xác nhận mật khẩu mới" name="confirmNewPassword" rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu mới của bạn' }]}>
                    <Input.Password placeholder="Xác nhận mật khẩu mới"  onChange={(e) => setPassword({ ...password, confirmNewPassword: e.target.value })} />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                        Đổi mật khẩu
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default ChangePassword;