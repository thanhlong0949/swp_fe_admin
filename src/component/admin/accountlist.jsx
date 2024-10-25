import React, { useState } from 'react';
import { Table, Button, Input, Select, Modal, Form, Tag, Typography, message } from 'antd';
import api from '../config/axios';
import { useEffect } from 'react';
import moment from 'moment';
const { Option } = Select;
const { Search } = Input;
const { Text } = Typography;
const AccountList = ({}) => {
    const [filterRole, setFilterRole] = useState('');
    const [filterJoinDate, setFilterJoinDate] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [accountsList, setAccountsList] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [recordDetail, setRecordDetail] = useState({});
    const columns = [
        { title: 'Tên', dataIndex: 'name', key: 'name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
        { title: 'Trạng thái', dataIndex: 'status', key: 'status' , render: (value) => <Tag color={value === "Active" ? "green" : "red"}>{value === "Active" ? "Đang hoạt động" : "Không hoạt động"}</Tag>},
        { title: 'Vai trò', dataIndex: 'role', key: 'role', render: (value) => <Text>{value === "customer" ? "Khách hàng" : value === "Manager" ? "Quản lý" : value === "Sale Staff" ? "Nhân viên bán hàng" : "Nhân viên giao hàng"}</Text>},

    ];



    useEffect(() => {
        fetchAccountsList();
        fetchAccountStaff();
    }, []);


    const fetchAccountStaff = async () => {
        try {
            const response = await api.get('/Staff');
            setStaffList(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching accounts list:', error);
        }
    };

    const fetchAccountsList = async () => {
        try {
            const response = await api.get('/Customer');
            setAccountsList(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching accounts list:', error);
        }
    };


    let userList = [];

    accountsList.forEach(account => {
        userList.push({
            key: account.customerId + account.name,
            customerId: account.customerId,
            name: account.name,
            email: account.email,
            phone: account.phone,
            address: account.address,
            registerDate: account.registrationDate,
            status: 'Active',
            role: "customer",
        });
    });


    staffList.forEach(staff => {
        userList.push({
            key: staff.staffId + staff.staffName,
            staffId: staff.staffId,
            name: staff.staffName,
            email: staff.email,
            phone: staff.phone,
            status: staff.status,
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

    const handleOk = () => {
        setIsModalVisible(false);
        // Handle form submission logic here
    };

    const handleCancel = () => {
        setIsModalVisible(false);
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h1>Danh sách tài khoản</h1>
                <Button style={{width: '200px'}} type="primary" onClick={showModal}>Thêm tài khoản mới</Button>
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
            <Table columns={[...columns, {
                title: 'Thao tác',
                key: 'action',
                render: (text, record) => (

                    <Button type="primary" onClick={() => showDetailModal(record)}>Chi tiết</Button>


                ),
            }]} dataSource={filterRole.role === '' ? userList : userList.filter(user => Object.keys(filterRole).every(key => user[key] === filterRole[key]))} />

            <Modal
                title="Chi tiết tài khoản"
                open={isDetailModalVisible}
                onCancel={handleDetailCancel}
                onOk={handleDetailOk}
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
                title="Thêm tài khoản mới"
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form layout="vertical">
                    <Form.Item label="Tên">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Email">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Địa chỉ">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Vai trò">
                        <Select>
                            <Option value="Manager">Quản lý</Option>
                            <Option value="Sale Staff">Nhân viên bán hàng</Option>
                            <Option value="Delivering Staff">Nhân viên giao hàng</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AccountList;