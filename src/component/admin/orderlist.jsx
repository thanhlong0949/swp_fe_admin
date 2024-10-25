import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Modal, message, Tag, Descriptions, Spin } from 'antd';
import { StarFilled, StarOutlined } from '@ant-design/icons';
import moment from 'moment';
import CurrencyFormat from 'react-currency-format';
import api from '../config/axios';
import signalrservice from '../signalR/signalrservice';


const { Search } = Input;
const { Option } = Select;

const OrderList = ({ showModal }) => {
    const [filterStatus, setFilterStatus] = useState('');
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
            render: (value) => <CurrencyFormat value={value} displayType={'text'} thousandSeparator={true} prefix={'₫ '} />,
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
                    return <Tag color={value === 'Delivering' || value === 'Waiting' ? 'orange' : value === 'Finish' || value === 'Delivered' ? 'green' : 'red'}>{value === 'Pending' ? 'Chờ xử lý' : value === 'Delivering' ? 'Đang vận chuyển' : value === 'Finish' ? 'Hoàn thành' : value === 'Waiting' ? 'Chờ lấy hàng' : 'Đã hủy'}</Tag>

                }
            }

        },
        { title: "Ngày đặt hàng", render: (value) => moment(value).format('DD/MM/YYYY'), key: "createdDate" },
    ];
    const startSignalR = async () => {
        const connectionState = signalrservice.connection.state;

        if (connectionState === 'Disconnected') {
            await signalrservice.start();
            signalrservice.onOrderDetailCreated();
        } else if (connectionState === 'Disconnecting') {
            console.warn('SignalR connection is currently disconnecting. Waiting for it to complete...');
            await new Promise(resolve => {
                const checkState = setInterval(() => {
                    if (signalrservice.connection.state === 'Disconnected') {
                        clearInterval(checkState);
                    
                        resolve();

                    }
                }, 1000); // Check every second
            });
            await startSignalR(); // Try starting again after it disconnects
        } else if (connectionState === 'Connecting') {
            console.warn('SignalR connection is currently connecting. Please wait...');
        } else {
            console.warn('SignalR connection is in an unexpected state:', connectionState);
        }
    };
    useEffect(() => {
        fetchOrdersList();

        startSignalR();

        return () =>
            signalrservice.connection.stop();
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
        });
    });

    return (
        <div>
            {isLoading && <Spin size="large" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }} />}
            <h1>Quản lý đơn hàng</h1>
            <div style={{ marginBottom: '20px' }}>
                <Search
                    placeholder="Tìm kiếm đơn hàng"
                    style={{ width: 200, marginRight: '10px' }}
                />
                <Select
                    style={{ width: 200, marginRight: '10px' }}
                    placeholder="Trạng thái đơn hàng"
                    onChange={(e) => setFilterStatus({ status: e })}
                    
                >
                    <Option value="">Tất cả trạng thái</Option>
                    <Option value="Pending">Chờ xử lý</Option>
                    <Option value="Waiting">Chờ lấy hàng</Option>
                    <Option value="Delivering">Đang vận chuyển</Option>
                    <Option value="Finish">Hoàn thành</Option>
                    <Option value="Cancel">Đã hủy</Option>
                </Select>
                <Select
                    style={{ width: 200 }}
                    placeholder="Thời gian đặt hàng"
                    onChange={(value) => setFilterTime(value)}
                >
                    <Option value="">Tất cả thời gian</Option>
                    <Option value="7">7 ngày qua</Option>
                    <Option value="30">30 ngày qua</Option>
                    <Option value="90">90 ngày qua</Option>
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
            }]} dataSource={orderList.filter(order => Object.keys(filterStatus).every(key => order[key] === filterStatus[key]))} />
            <div style={{ width: '80%', maxWidth: '100%' }}>
                <Modal
                    open={isDetailModalVisible}
                    onOk={handleDetailCancel}
                    onCancel={handleDetailCancel}
                    footer={[
                        <Button key="back" onClick={handleDetailCancel}>
                            Đóng
                        </Button>,
                    ]}
                >
                    <Descriptions title="Chi tiết đơn hàng" bordered style={{ width: '100%' }}>
                        <Descriptions.Item label="Mã đơn hàng" span={3}>{recordDetail.orderDetailId}</Descriptions.Item>
                        <Descriptions.Item label="Mã chuyến vận chuyển" span={3}>{recordDetail.orderId}</Descriptions.Item>
                        <Descriptions.Item label="Tên khách hàng" span={3}>{recordDetail.customerName}</Descriptions.Item>
                        <Descriptions.Item label="Mã dịch vụ" span={3}>{recordDetail.serviceId}</Descriptions.Item>
                        <Descriptions.Item label="Cân nặng" span={3}>{recordDetail.weight}</Descriptions.Item>
                        <Descriptions.Item label="Số lượng" span={3}>{recordDetail.quantity}</Descriptions.Item>
                        <Descriptions.Item label="Tổng tiền" span={3}><CurrencyFormat value={recordDetail.totalPrice} displayType={'text'} thousandSeparator={true} prefix={'₫ '} /></Descriptions.Item>
                        <Descriptions.Item label="Tình trạng cá" span={3}>{recordDetail.koiStatus}</Descriptions.Item>
                        <Descriptions.Item label="Vật phẩm đi kèm" span={3}>{recordDetail.attachedItem}</Descriptions.Item>
                        <Descriptions.Item label="Trạng thái đơn hàng" span={3}>{recordDetail.status}</Descriptions.Item>
                        <Descriptions.Item label="Ngày đặt hàng" span={3}>{moment(recordDetail.createdDate).format('DD/MM/YYYY')}</Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ lấy hàng" span={3}>{recordDetail.startLocation}</Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ giao hàng" span={3}>{recordDetail.destination}</Descriptions.Item>
                        <Descriptions.Item label="Tên người nhận" span={3}>{recordDetail.receiverName}</Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại người nhận" span={3}>{recordDetail.receiverPhone}</Descriptions.Item>
                        <Descriptions.Item label="Đánh giá" span={3}>
                            {recordDetail.rating === 0 ? 'Không có đánh giá' : Array.from({ length: 5 }, (_, index) => (
                                index < recordDetail.rating ? <StarFilled key={index} type="star" name='star' value={recordDetail.rating} /> : <StarOutlined key={index} type="star" name='star' value={recordDetail.rating} />
                            ))}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phản hồi" span={3}>{recordDetail.feedback === null ? 'Không có phản hồi' : recordDetail.feedback}</Descriptions.Item>
                    </Descriptions>
                </Modal>
            </div>
        </div>
    );
};

export default OrderList;