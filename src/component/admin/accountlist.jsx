import React, { useState } from 'react';
import { Table, Button, Input, Select, Modal, Form, Tag, Typography, message, Spin } from 'antd';
import api from '../config/axios';
import { useEffect } from 'react';
import moment from 'moment';
const { Option } = Select;
const { Search } = Input;
const { Text } = Typography;
const AccountList = ({ }) => {
    const [form] = Form.useForm();
    const [filterRole, setFilterRole] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [filterJoinDate, setFilterJoinDate] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [accountsList, setAccountsList] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [recordDetail, setRecordDetail] = useState({});
    const [newAccount, setNewAccount] = useState({});
    const columns = [
        { title: 'Tên', dataIndex: 'name', key: 'name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
        { title: 'Trạng thái', dataIndex: 'deleteStatus', key: 'deleteStatus', render: (value, record) => <Tag color={value ? "red" : "green"}>{value ? "Không hoạt động" : "Đang hoạt động"}</Tag> },
        { title: 'Vai trò', dataIndex: 'role', key: 'role', render: (value) => <Text>{value === "customer" ? "Khách hàng" : value === "Manager" ? "Quản lý" : value === "Sale Staff" ? "Nhân viên bán hàng" : "Nhân viên giao hàng"}</Text> },

        {
            title: 'Thao tác',
            key: 'action',
            render: (value, record) => (

                <Button type="primary" onClick={() => showDetailModal(record)}>Chi tiết</Button>


            ),
        },
        {
            key: 'delete',
            render: (value, record) => (
                record.deleteStatus ? <Button type="primary" style={{ backgroundColor: 'green' }} onClick={() => restoreAccount(record)}>Khôi phục</Button> : <Button type="primary" style={{ backgroundColor: 'red' }} onClick={() => deleteAccount(record)}>Xoá</Button>
            ),
        }
    ];



    useEffect(() => {
        fetchAccountsList();
        fetchAccountStaff();
    }, []);

    const restoreAccount = async (record) => {
        console.log(record);
        try {
            if (record.role === "customer") {
                let customer = {
                    name: record.name,
                    email: record.email,
                    phone: record.phone,
                    address: record.address,
                    registrationDate: record.registerDate,
                    deleteStatus: false,

                }
                const response = await api.put(`/Customer/${record.customerId}`, customer);
                console.log(response);
            } else {
                let staff = {
                    staffName: record.name,
                    email: record.email,
                    phone: record.phone,
                    status: record.status,
                    deleteStatus: false,
                }
                const response = await api.put(`/Staff/${record.staffId}`, staff);
                console.log(response);
            }
            fetchAccountsList();
            fetchAccountStaff();
            message.success("Khôi phục tài khoản thành công");
        } catch (error) {
            console.error('Error deleting account:', error);
            message.error("Khôi phục tài khoản thất bại");
        }
    }
    const deleteAccount = async (record) => {
        console.log(record);
        try {
            if (record.role === "customer") {
                const response = await api.delete(`/Customer/soft/${record.customerId}`);
                console.log(response);
            } else {
                const response = await api.delete(`/Staff/soft/${record.staffId}`);
                console.log(response);
            }
            fetchAccountsList();
            fetchAccountStaff();
            message.success("Xoá tài khoản thành công");
        } catch (error) {
            console.error('Error deleting account:', error);
            message.error("Xoá tài khoản thất bại");
        }
    }
    const fetchAccountStaff = async () => {

        try {
            setIsLoading(true);
            const response = await api.get('/Staff');
            setStaffList(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching accounts list:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAccountsList = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/Customer');
            setAccountsList(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching accounts list:', error);
        } finally {
            setIsLoading(false);
        }
    };


    let userList = [];

    accountsList.forEach(account => {
        if (account.customerId !== 0) {
            userList.push({
                key: account.customerId + account.name,
                customerId: account.customerId,
                name: account.name,
                email: account.email,
                phone: account.phone,
                address: account.address,
                registerDate: account.registrationDate,
                deleteStatus: account.deleteStatus,
                role: "customer",
            });
        }
    });


    staffList.forEach(staff => {
        userList.push({
            key: staff.staffId + staff.staffName,
            staffId: staff.staffId,
            name: staff.staffName,
            email: staff.email,
            phone: staff.phone,
            status: staff.status,
            deleteStatus: staff.deleteStatus,
            role: staff.role,
        });
    });


    const showModal = () => {
        setIsModalVisible(true);
    };

    const showDetailModal = (record) => {
        console.log("Record: ", record);
        setIsDetailModalVisible(true);
        if (record.role === "customer") {
            let recordDetail = {
                customerId: record.customerId,
                name: record.name,
                email: record.email,
                phone: record.phone,
                status: record.status,
                role: record.role,
                address: record.address,
                registerDate: record.registerDate,
            }
            setRecordDetail(recordDetail);
        } else {
            let recordDetail = {
                staffId: record.staffId,
                staffName: record.name,
                email: record.email,
                phone: record.phone,
                status: record.status,
                role: record.role,
            }
            setRecordDetail(recordDetail);
        }
    };

    const handleCreateStaff = async () => {


        try {
            const response = await api.post('/Staff', {
                ...newAccount,
                status: 'Active',

                password: '12345678',
            });
            console.log(response.data);

            message.success('Thêm nhân viên thành công');
            fetchAccountStaff();
            form.resetFields();
            setIsModalVisible(false);
        } catch (error) {
            if (error.response.data.message.includes("already exists")) {
                message.error('Email đã tồn tại');
            } else {
                message.error('Thêm nhân viên thất bại');
            }
            console.error('Error creating staff:', error.response.data);
        }
    };



    const handleDetailOk = async () => {
        setIsDetailModalVisible(false);
        if (recordDetail.role !== "customer") {
            try {
                let staff = {
                    staffName: recordDetail.staffName,
                    email: recordDetail.email,
                    phone: recordDetail.phone,
                    status: recordDetail.status,
                    role: recordDetail.role,
                }
                console.log("Record detail: ", recordDetail);
                console.log("Staff: ", staff);
                const response = await api.put(`/Staff/${recordDetail.staffId}`, staff);
                console.log("Response: ", response);
                message.success("Cập nhật thành công");
                fetchAccountStaff();
            } catch (error) {
                console.error("Error updating staff: ", error);
                message.error("Cập nhật thất bại");
            }
        }
    };

    const handleDetailCancel = () => {
        setIsDetailModalVisible(false);
    };

    return (
        <div>
            {isLoading && <Spin fullscreen size="large" />}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h1>Danh sách tài khoản</h1>
                <Button style={{ width: '200px' }} type="primary" onClick={showModal}>Thêm nhân viên mới</Button>
            </div>
            <div style={{ marginBottom: '20px' }}>
                <Search
                    placeholder="Tìm kiếm tài khoản"
                    style={{ width: 200, marginRight: '10px' }}
                />
                <Select
                    style={{ width: 200, marginRight: '10px' }}
                    placeholder="Vai trò"
                    onChange={(e) => setFilterRole({ role: e })}
                >
                    <Option value="">Tất cả vai trò</Option>
                    <Option value="customer">Khách hàng</Option>
                    <Option value="Manager">Quản lý</Option>
                    <Option value="Sale Staff">Nhân viên bán hàng</Option>
                    <Option value="Delivering Staff">Nhân viên giao hàng</Option>
                </Select>

            </div>
            <Table columns={columns} dataSource={filterRole.role === '' ? userList : userList.filter(user => Object.keys(filterRole).every(key => user[key] === filterRole[key]))}
                expandable={{
                    rowExpandable: (record) => record.role === "Delivering Staff",
                    
                    expandedRowRender: (record) => {
                        return <Tag style={{width: '100px', display:'flex-end', justifyContent:'center', alignItems:'center', marginLeft: '10px' }} color={record.status === "Active" ? "green" : "red"}>{record.status === "Active" ? "Đang hoạt động" : "Đang giao hàng"}</Tag>
                    }
                }}
            />

            <Modal
                title="Chi tiết tài khoản"
                open={isDetailModalVisible}
                onCancel={handleDetailCancel}
                onOk={handleDetailOk}
                okText="Cập nhật"
                cancelText="Hủy"
            >
                {recordDetail.role === "customer" ? (
                    <>
                        <Form layout="vertical" disabled>
                            <Form.Item label="Tên">
                                <Input value={recordDetail.name} disabled />
                            </Form.Item>
                            <Form.Item label="Email">
                                <Input value={recordDetail.email} disabled />
                            </Form.Item>
                            <Form.Item label="Số điện thoại">
                                <Input value={recordDetail.phone} disabled />
                            </Form.Item>
                            <Form.Item label="Trạng thái">
                                <Input value={recordDetail.status === "Active" ? "Đang hoạt động" : "Không hoạt động"} disabled />
                            </Form.Item>
                            <Form.Item label="Vai trò">
                                <Input value={"Khách hàng"} disabled />
                            </Form.Item>
                            <Form.Item label="Địa chỉ">
                                <Input value={recordDetail.address} disabled />
                            </Form.Item>
                            <Form.Item label="Ngày tham gia">
                                <Input value={moment(recordDetail.registerDate).format('DD/MM/YYYY')} disabled />
                            </Form.Item>
                        </Form>
                    </>
                ) : (
                    <>
                        <Form layout="vertical">
                            <Form.Item label="Tên">
                                <Input value={recordDetail.staffName} onChange={(e) => setRecordDetail({ ...recordDetail, name: e.target.value })} />
                            </Form.Item>
                            <Form.Item label="Email">
                                <Input value={recordDetail.email} disabled />
                            </Form.Item>
                            <Form.Item label="Số điện thoại">
                                <Input value={recordDetail.phone} onChange={(e) => setRecordDetail({ ...recordDetail, phone: e.target.value })} />
                            </Form.Item>
                            <Form.Item label="Trạng thái">
                                <Select value={recordDetail.status} onChange={(value) => setRecordDetail({ ...recordDetail, status: value })}>
                                    <Option value="Active">Đang hoạt động</Option>
                                    <Option value="Inactive">Không hoạt động</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item label="Vai trò">
                                <Select value={recordDetail.role} onChange={(value) => setRecordDetail({ ...recordDetail, role: value })}>
                                    <Option value="Manager">Quản lý</Option>
                                    <Option value="Sale Staff">Nhân viên bán hàng</Option>
                                    <Option value="Delivering Staff">Nhân viên giao hàng</Option>
                                </Select>
                            </Form.Item>

                        </Form>
                    </>
                )}
            </Modal>
            <Modal
                title="Thêm nhân viên mới"
                open={isModalVisible}
                footer={null}
                destroyOnClose={true}
            >
                <Form
                    layout="vertical"
                    form={form}
                    onFinish={handleCreateStaff}
                    showRequiredMark={true}
                    clearOnDestroy={true}
                >
                    <Form.Item label="Tên" rules={[{ required: true, message: 'Tên không được để trống' }]}>
                        <Input placeholder="Nhập tên" onChange={(e) => setNewAccount({ ...newAccount, staffName: e.target.value })} />
                    </Form.Item>
                    <Form.Item label="Email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ', pattern: /^[^\s@]+@gmail.com/ }]}>
                        <Input type="email" placeholder="Nhập email" onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })} />
                    </Form.Item>
                    <Form.Item label="Số điện thoại" rules={[{ required: true, message: 'Số điện thoại không được để trống', pattern: /^[0-9]{10}$/ }]}>
                        <Input placeholder="Nhập số điện thoại" type="number" onChange={(e) => setNewAccount({ ...newAccount, phone: e.target.value })} />
                    </Form.Item>
                    <Form.Item label="Vai trò" rules={[{ required: true, message: 'Vai trò không được để trống' }]}>
                        <Select placeholder="Chọn vai trò" onChange={(value) => setNewAccount({ ...newAccount, role: value })}>
                            <Option value="Manager">Quản lý</Option>
                            <Option value="Sale Staff">Nhân viên bán hàng</Option>
                            <Option value="Delivering Staff">Nhân viên giao hàng</Option>
                        </Select>
                    </Form.Item>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">Thêm nhân viên</Button>
                        </Form.Item>

                        <Button type="primary" style={{ backgroundColor: '#f5f5f5', color: 'black' }} onClick={() => { form.resetFields(); setIsModalVisible(false) }}>Hủy</Button>

                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default AccountList;