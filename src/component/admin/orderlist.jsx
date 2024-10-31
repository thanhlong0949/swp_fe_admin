import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Modal, message, Tag, Descriptions, Spin, Image } from 'antd';
import { StarFilled, StarOutlined } from '@ant-design/icons';
import moment from 'moment';

import api from '../config/axios';
import signalrservice from '../signalR/signalrservice';
const { Search } = Input;
const { Option } = Select;

const OrderList = ({ showModal }) => {
    const [filterStatus, setFilterStatus] = useState({ name: '', status: '' });
    const [filterTime, setFilterTime] = useState('');
    const [orderStatus, setOrderStatus] = useState('');
    const [ordersList, setOrdersList] = useState([]);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [recordDetail, setRecordDetail] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const columns = [
        { title: "Mã đơn hàng", dataIndex: "orderDetailId", key: "orderDetailId" },
        {
            title: "Mã chuyến vận chuyển", dataIndex: "orderId", key: "orderId", render: (value) => {
                return value == 0 ? "Chưa thêm vào chuyến vận chuyển" : value;
            }
        },
        { title: "Tên khách hàng", dataIndex: "customerName", key: "customerName" },
        { title: "Mã dịch vụ", dataIndex: "serviceId", key: "serviceId" },
        {
            title: "Tổng tiền",
            dataIndex: "totalPrice",
            render: (value) => <span>{value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>,
            key: "totalPrice"
        },
        {
            title: "Trạng thái đơn hàng", dataIndex: "status", key: "status", render: (value, record) => {
                if (value === 'Pending') {
                    return <Select
                        defaultValue={value}
                        style={{ width: 200, marginRight: '10px' }}
                        placeholder="Trạng thái đơn hàng"
                        onChange={(newValue) => {
                            record.status = newValue;
                            setOrderStatus(newValue);
                        }}
                    >
                        <Option value="Pending">Chờ xử lý</Option>
                        <Option value="Waiting">Chờ lấy hàng</Option>
                    </Select>
                }
                else {
                    return <Tag color={value === 'Delivering' || value === 'Waiting' ? 'orange' : value === 'Finish' || value === 'Delivered' ? 'green' : 'red'}>{value === 'Pending' ? 'Chờ xử lý' : value === 'Delivering' ? 'Đang vận chuyển' : value === 'Finish' ? 'Hoàn thành' : value === 'Waiting' ? 'Chờ lấy hàng' : value === 'Canceled' ? 'Đã huỷ' : 'Đã giao hàng'}</Tag>

                }
            }

        },
        { title: "Ngày đặt hàng", render: (value) => moment(value).format('DD/MM/YYYY'), key: "createdDate" },
    ];
    
    useEffect(() => {
        fetchOrdersList();

       

     
    }, []);


    const showDetailModal = (record) => {
        console.log("Record: ", record);
        setRecordDetail(record);
        setIsDetailModalVisible(true);

    }

    const handleDetailCancel = () => {
        setIsDetailModalVisible(false);
    }

    const fetchOrdersList = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/OrderDetail');
            setOrdersList(response.data);
            console.log("OrdersList: ", response.data);
        }
        catch (error) {
            console.error('Error fetching orders list:', error);
        }
        finally {
            setIsLoading(false);
        }
    };

    const updateOrderDetail = async (order) => {
        console.log("Order: ", order);
        const orderDetail = {
            orderDetailId: order.orderDetailId,
            orderId: order.orderId,
            customerName: order.customerName,
            serviceId: order.serviceId,
            price: order.totalPrice,
            status: orderStatus,
            createdDate: order.createdDate,
            startLocation: order.startLocation,
            destination: order.destination,
            receiverName: order.receiverName,
            receiverPhone: order.receiverPhone,
            rating: order.rating,
            feedback: order.feedback,
            koiStatus: order.koiStatus,
            attachedItem: order.attachedItem,
            weight: order.weight,
            quantity: order.quantity,
            serviceName: order.serviceName,
        }
        console.log("OrderDetail updated:", orderDetail);
        console.log("OrderDetail:", order);
        try {
            const response = await api.put(`/OrderDetail/${orderDetail.orderDetailId}`, orderDetail);
            console.log("OrderDetail updated:", response.data);
            message.success("Cập nhật đơn hàng thành công");
            fetchOrdersList();
        } catch (error) {
            console.error('Error updating order detail:', error);
            message.error("Cập nhật đơn hàng thất bại");
        }
    };

    let orderList = [];

    ordersList.forEach(order => {
        orderList.push({
            key: order.orderDetailId,
            orderDetailId: order.orderDetailId,
            orderId: order.orderId,
            customerName: order.customerName,
            serviceId: order.serviceId,
            serviceName: order.serviceName,
            totalPrice: order.price,
            status: order.status,
            createdDate: order.createdDate,
            startLocation: order.startLocation,
            destination: order.destination,
            receiverName: order.receiverName,
            receiverPhone: order.receiverPhone,
            rating: order.rating,
            feedback: order.feedback,
            koiStatus: order.koiStatus,
            attachedItem: order.attachedItem,
            weight: order.weight,
            quantity: order.quantity,
            serviceName: order.serviceName,
            image: order.image,
        });
    });

    return (
        <div>
            {isLoading && <Spin size="large" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }} />}
            <h1>Quản lý đơn hàng</h1>
            <div style={{ marginBottom: '20px' }}>
                <Input
                    placeholder="Tìm kiếm đơn hàng"
                    style={{ width: 200, marginRight: '10px' }}
                    onChange={(e) => {
                        console.log("e: ", e.target.value);
                        setFilterStatus({ name: e.target.value });
                    }}
                />
                <Select
                    style={{ width: 200, marginRight: '10px' }}
                    placeholder="Trạng thái đơn hàng"
                    onChange={(e) => {
                        console.log("status: ", e);
                        setFilterStatus({ status: e });
                    }}

                >
                    <Option value="">Tất cả trạng thái</Option>
                    <Option value="Pending">Chờ xử lý</Option>
                    <Option value="Waiting">Chờ lấy hàng</Option>
                    <Option value="Delivering">Đang vận chuyển</Option>
                    <Option value="Finish">Hoàn thành</Option>
                    <Option value="Cancel">Đã hủy</Option>
                </Select>

                <Button style={{ backgroundColor: 'blue', color: 'white', width: '88px' }} onClick={() => fetchOrdersList()}>Làm mới</Button>
            </div>
            <Table columns={[...columns, {
                title: 'Thao tác',
                key: 'action',
                render: (text, record) => (
                    <Button style={{ backgroundColor: 'blue', color: 'white', width: '88px' }} onClick={() => showDetailModal(record)}>Xem chi tiết</Button>
                ),
            }, {

                key: 'update',
                render: (text, record) => (
                    record.status === 'Pending' ? <Button style={{ backgroundColor: '#ff6600', color: 'white', width: '88px' }} onClick={() => updateOrderDetail(record)}>Cập nhật</Button> : null
                ),
            }]} dataSource={filterStatus.status === '' && filterStatus.name === ''
                ? orderList
                : orderList.filter(order =>
                    (filterStatus.name === '' || order.customerName.includes(filterStatus.name)) &&
                    (filterStatus.status === '' || order.status === filterStatus.status)
                )
            } />
            <div style={{ width: '80%', maxWidth: '100%' }}>
                <Modal
                    width={1000}
                    open={isDetailModalVisible}
                    onOk={handleDetailCancel}
                    onCancel={handleDetailCancel}
                    footer={[
                        <Button key="back" onClick={handleDetailCancel}>
                            Đóng
                        </Button>,
                    ]}
                >
                    <Descriptions title="Chi tiết đơn hàng" bordered column={4}>
                        <Descriptions.Item label="Mã đơn hàng" span={3}>{recordDetail.orderDetailId}</Descriptions.Item>
                        <Descriptions.Item label="Mã chuyến vận chuyển" span={3}>{recordDetail.orderId === 0 ? "Chưa thêm vào chuyến vận chuyển" : recordDetail.orderId}</Descriptions.Item>
                        <Descriptions.Item label="Tên người gửi" span={3}>{recordDetail.customerName}</Descriptions.Item>
                        <Descriptions.Item span={3} />
                        <Descriptions.Item label="Tên người nhận" span={3}>{recordDetail.receiverName}</Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại người nhận" span={3}>{recordDetail.receiverPhone}</Descriptions.Item>
                        <Descriptions.Item label="Cân nặng" span={3}>{recordDetail.weight}</Descriptions.Item>
                        <Descriptions.Item label="Mã dịch vụ" span={3}>{recordDetail.serviceId}</Descriptions.Item>
                        <Descriptions.Item label="Số lượng" span={3}>{recordDetail.quantity}</Descriptions.Item>

                        <Descriptions.Item label="Dịch vụ" span={3}>{recordDetail.serviceName === "economy" ? "Giao tiết kiệm" : recordDetail.serviceName === "express" ? "Giao hoả tốc" : "Giao nhanh"}</Descriptions.Item>
                        <Descriptions.Item label="Tổng tiền" span={3}><span>{recordDetail.totalPrice?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span></Descriptions.Item>
                        <Descriptions.Item label="Trạng thái đơn hàng" span={3}>{recordDetail.status === 'Pending' ? 'Chờ xử lý' : recordDetail.status === 'Waiting' ? 'Chờ lấy hàng' : recordDetail.status === 'Delivering' ? 'Đang vận chuyển' : recordDetail.status === 'Finish' ? 'Hoàn thành' : recordDetail.status === 'Cancel' ? 'Đã hủy' : 'Đã giao hàng'}</Descriptions.Item>
                        <Descriptions.Item span={3} />
                        <Descriptions.Item label="Ngày đặt hàng" span={3}>{moment(recordDetail.createdDate).format('DD/MM/YYYY')}</Descriptions.Item>

                        <Descriptions.Item label="Tình trạng cá" span={3}>{recordDetail.koiStatus}</Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ lấy hàng" span={3}>{recordDetail.startLocation}</Descriptions.Item>
                        <Descriptions.Item label="Vật phẩm đi kèm" span={3}>{recordDetail.attachedItem}</Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ giao hàng" span={3}>{recordDetail.destination}</Descriptions.Item>
                        <Descriptions.Item label="Hình ảnh mô tả" span={6}><Image src={recordDetail.image} width={100} height={100} /></Descriptions.Item>
                        {recordDetail.rating === null ? '' :
                            <Descriptions.Item label="Đánh giá" span={3}>
                                {Array.from({ length: 5 }, (_, index) => (
                                    index < recordDetail.rating ? <StarFilled key={index} type="star" name='star' value={recordDetail.rating} /> : <StarOutlined key={index} type="star" name='star' value={recordDetail.rating} />
                                ))}
                            </Descriptions.Item>
                        }
                        {recordDetail.feedback === null ? '' :
                            <Descriptions.Item label="Phản hồi" span={3}>{recordDetail.feedback}</Descriptions.Item>
                        }
                    </Descriptions>
                </Modal>
            </div>
        </div>
    );
};

export default OrderList;