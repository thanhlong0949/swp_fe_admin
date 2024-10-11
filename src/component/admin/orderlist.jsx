import React, { useState } from 'react';
import { Table, Button, Input, Select, Modal, message, Tag } from 'antd';
import { StarFilled, StarOutlined } from '@ant-design/icons';
import moment from 'moment';
import CurrencyFormat from 'react-currency-format';
import { useEffect } from 'react';
import api from '../config/axios';


const { Search } = Input;
const { Option } = Select;

const OrderList = ({ showModal }) => {
    const [filterStatus, setFilterStatus] = useState('');
    const [filterTime, setFilterTime] = useState('');
    const [orderStatus, setOrderStatus] = useState('');
    const [ordersList, setOrdersList] = useState([]);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [recordDetail, setRecordDetail] = useState({});
    const columns = [
        { title: "Mã đơn hàng", dataIndex: "orderDetailId", key: "orderDetailId"},
        { title: "Mã chuyến vận chuyển", dataIndex: "orderId", key: "orderId", render: (value) => {
            return value == 0 ? "Chưa thêm vào chuyến vận chuyển" : value;
        }},
        { title: "Tên khách hàng", dataIndex: "customerName", key: "customerName" },
        { title: "Mã dịch vụ", dataIndex: "serviceId", key: "serviceId" },
        {
            title: "Tổng tiền",
            dataIndex: "totalPrice",
            render: (value) => <CurrencyFormat value={value} displayType={'text'} thousandSeparator={true} prefix={'₫ '} />,
            key: "totalPrice"
        },
        { title: "Trạng thái đơn hàng", dataIndex: "status", key: "status", render: (value, record) => {
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
                return <Tag color={value === 'Delivering' || value === 'Waiting' ? 'orange' : value === 'Finish' || value === 'Delivered' ? 'green' : 'red'}>{value === 'Pending' ? 'Chờ xử lý' : value === 'Delivering' ? 'Đang vận chuyển' : value === 'Finish'  ? 'Hoàn thành' : value === 'Waiting' ? 'Chờ lấy hàng' : 'Đã hủy'}</Tag> 

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
        try {
            const response = await api.get('/OrderDetail');
            setOrdersList(response.data);
            console.log("OrdersList: ", response.data);
        }
        catch (error) {
            console.error('Error fetching orders list:', error);
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
            
            <div style={{ marginBottom: '20px' }}>
                <Search
                    placeholder="Tìm kiếm đơn hàng"
                    style={{ width: 200, marginRight: '10px' }}
                />
                <Select
                    style={{ width: 200, marginRight: '10px' }}
                    placeholder="Trạng thái đơn hàng"
                    onChange={(value) => setFilterStatus(value)}
                >
                    <Option value="">Tất cả trạng thái</Option>
                    <Option value="Đang xử lý">Đang xử lý</Option>
                    <Option value="Đang vận chuyển">Đang vận chuyển</Option>
                    <Option value="Đã giao hàng">Đã giao hàng</Option>
                    <Option value="Đã hủy">Đã hủy</Option>
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
            </div>
            <Table columns={[...columns, {
                title: 'Thao tác',
                key: 'action',
                render: (text, record) => (
                    <Button style={{backgroundColor: 'blue', color: 'white', width: '88px'}} onClick={() => showDetailModal(record)}>Xem chi tiết</Button>
                ),
            },{
                
                key: 'update',
                render: (text, record) => (
                    record.status === 'Pending' ? <Button style={{backgroundColor: '#ff6600', color: 'white', width: '88px'}} onClick={() => updateOrderDetail(record)}>Cập nhật</Button> : null
                ),
            }]} dataSource={orderList} />
            <Modal
                title="Chi tiết đơn hàng"

                open={isDetailModalVisible}
                onOk={handleDetailCancel}
                onCancel={handleDetailCancel}
            >
                <p>Mã đơn hàng: {recordDetail.orderDetailId}</p>
                <p>Mã chuyến vận chuyển: {recordDetail.orderId}</p>
                <p>Tên khách hàng: {recordDetail.customerName}</p>
                <p>Mã dịch vụ: {recordDetail.serviceId}</p>
                <p>Cân nặng: {recordDetail.weight}</p>
                <p>Số lượng: {recordDetail.quantity}</p>
                <p>Tổng tiền: <CurrencyFormat value={recordDetail.totalPrice} displayType={'text'} thousandSeparator={true} prefix={'₫ '} /></p>
                <p>Tình trạng cá: {recordDetail.koiStatus}</p>
                <p>Vật phẩm đi kèm: {recordDetail.attachedItem}</p>
                <p>Trạng thái đơn hàng: {recordDetail.status}</p>
                <p>Ngày đặt hàng: {moment(recordDetail.createdDate).format('DD/MM/YYYY')}</p>
                <p>Địa chỉ lấy hàng: {recordDetail.createdAddress}</p>
                <p>Địa chỉ giao hàng: {recordDetail.deliveryAddress}</p>
                <p>Tên người nhận: {recordDetail.receiverName}</p>
                <p>Số điện thoại người nhận: {recordDetail.receiverPhone}</p>
                <p>Đánh giá: {recordDetail.rating === 0 ? 'Không có đánh giá' : Array.from({ length: 5 }, (_, index) => (
                    index < recordDetail.rating ? <StarFilled key={index} type="star" name='star' value={recordDetail.rating} /> : <StarOutlined key={index} type="star" name='star' value={recordDetail.rating} />
                ))}</p>
                <p>Phản hồi: {recordDetail.feedback === null ? 'Không có phản hồi' : recordDetail.feedback}</p>
            </Modal>
        </div>
    );
};

export default OrderList;