import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Modal, message, Tag, Descriptions, Spin, Image, Row, Typography, Popover, Upload } from 'antd';
import { StarFilled, StarOutlined, UploadOutlined } from '@ant-design/icons';
import moment from 'moment';
import { storage } from '../firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import api from '../config/axios';
const { Option } = Select;
const { Text } = Typography;
const OrderList = ({ showModal }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const [filterStatus, setFilterStatus] = useState(user.role === 'Delivering Staff' ? 'Delivering' : 'Pending');
    const [filterName, setFilterName] = useState('');
    const [pendingOrder, setPendingOrder] = useState(0);
    const [ordersList, setOrdersList] = useState([]);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [recordDetail, setRecordDetail] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isAddToOrderModalVisible, setIsAddToOrderModalVisible] = useState(false);
    const [listOrderDestination, setListOrderDestination] = useState([]);
    const [recordAddToOrder, setRecordAddToOrder] = useState({});
    const [fileList, setFileList] = useState([]);
    const columns = [
        { title: "Mã đơn hàng", dataIndex: "orderDetailId", key: "orderDetailId" },
        {
            title: "Mã chuyến vận chuyển", dataIndex: "orderId", key: "orderId", width: '200px',
            render: (value) => {
                return value === 0 ? "Chưa thêm vào chuyến vận chuyển" : value;
            }
        },
        { title: "Tên khách hàng", dataIndex: "customerName", key: "customerName" },
        { title: "Điểm đi", dataIndex: "startLocation", key: "startLocation", width: '100px', render: (value) => value.split('-')[2] },
        { title: "Điểm đến", dataIndex: "destination", key: "destination", width: '100px', render: (value) => value.split('-')[2] },
        {
            title: "Tổng tiền",
            dataIndex: "totalPrice",
            render: (value) => <span>{value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>,
            key: "totalPrice"
        },
        {
            title: "Trạng thái đơn hàng", dataIndex: "status", key: "status", render: (value, record) => {

                return <Tag color={value === 'Delivering' || value === 'Waiting' ? 'orange' : value === 'Finish' || value === 'Delivered' ? 'green' : value === 'Pending' ? 'blue' : 'red'}>{value === 'Pending' ? 'Chờ xử lý' : value === 'Delivering' ? 'Đang vận chuyển' : value === 'Finish' ? 'Hoàn thành' : value === 'Waiting' ? 'Chờ lấy hàng' : value === 'Canceled' ? 'Đã huỷ' : 'Đã giao hàng'}</Tag>


            }

        },
        { title: "Ngày đặt hàng", render: (value) => moment(value).format('DD/MM/YYYY'), key: "createdDate" },
        {
            title: 'Thao tác',
            key: 'action',
            render: (text, record) => (
                <Button style={{ backgroundColor: 'blue', color: 'white', width: '88px' }} onClick={() => showDetailModal(record)}>Xem chi tiết</Button>
            ),
        }, {

            key: 'update',
            render: (text, record) => (
                record.status === 'Pending' ? <Button style={{ backgroundColor: '#ff6600', color: 'white', width: '88px' }} onClick={() => updateOrderDetail(record)}>Duyệt đơn</Button>
                    : record.status === 'Waiting' && record.orderId === 0 ? <Button style={{ backgroundColor: 'green', color: 'white', width: '150px' }} onClick={() => addToOrderModal(record)}>Thêm vào chuyến</Button>
                        : null
            ),
        }
    ];
    const checkFinish = async (record) => {
        const response = await api.get(`/Order/${record.orderId}`);
        console.log("so sanh", response.data.status === 'Finish');

        return response.data.status === 'Finish';
    }
    const columnsDeli = [
        { title: "Mã đơn hàng", dataIndex: "orderDetailId", key: "orderDetailId" },
        {
            title: "Mã chuyến vận chuyển", dataIndex: "orderId", key: "orderId", width: '150px',
        },
        Table.EXPAND_COLUMN,
        { title: "Điểm đi", dataIndex: "startLocation", key: "startLocation", render: (value) => value.split('-')[2] },
        { title: "Điểm đến", dataIndex: "destination", key: "destination", render: (value) => value.split('-')[2] },
        {
            title: "Tổng tiền",
            dataIndex: "totalPrice",
            render: (value) => <span>{value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>,
            key: "totalPrice"
        },
        {
            title: "Trạng thái đơn hàng", dataIndex: "status", key: "status", render: (value, record) => {

                return <Tag color={value === 'Delivering' || value === 'Waiting' ? 'orange' : value === 'Finish' || value === 'Delivered' ? 'green' : value === 'Pending' ? 'blue' : 'red'}>{value === 'Pending' ? 'Chờ xử lý' : value === 'Delivering' ? 'Đang vận chuyển' : value === 'Finish' ? 'Hoàn thành' : value === 'Waiting' ? 'Chờ lấy hàng' : value === 'Canceled' ? 'Đã huỷ' : 'Đã giao hàng'}</Tag>


            }

        },
        { title: "Ngày đặt hàng", render: (value) => moment(value).format('DD/MM/YYYY'), key: "createdDate" },
        {
            title: 'Thao tác',
            key: 'action',
            render: (text, record) => (
                <Button style={{ backgroundColor: 'blue', color: 'white', width: '88px' }} onClick={() => showDetailModal(record)}>Xem chi tiết</Button>
            ),
        },
        {

            key: 'update',
            render: (text, record) => (
                checkFinish(record) ? record.status === 'Delivering'
                    ? <Popover
                        trigger='click'
                        title="Xác nhận giao hàng"
                        content={<div>
                            <p>Vui lòng cung cấp hình ảnh để xác nhận giao hàng</p>
                            <Upload
                                customRequest={handleUpload}
                                onChange={handleChange}
                                fileList={fileList}
                                maxCount={1}
                                listType='picture'
                                accept='image/*'
                                onRemove={() => {
                                    setFileList([]);
                                }}

                            >
                                <Button icon={<UploadOutlined />}>Chọn hình ảnh</Button>
                            </Upload>

                        </div>}
                    >
                        <Button style={{ backgroundColor: 'green', color: 'white', width: '150px' }} onClick={() => confirmDelivering(record)}>Giao hàng</Button>
                    </Popover>
                    : null : null
            ),
        }
    ];
    const columnOrderDestination = [

        { title: "Mã chuyến", dataIndex: "orderId", key: "orderId" },
        { title: "Điểm đi", dataIndex: "startLocation", key: "startLocation" },
        { title: "Điểm đến", dataIndex: "destination", key: "destination" },
        { title: "Phương thức vận chuyển", dataIndex: "transportMethod", key: "transportMethod", render: (value) => value === 'road' ? "Đường bộ" : value === 'air' ? "Đường hàng không" : "" },
        { title: "Ngày khởi hành", render: (value) => moment(value).format('DD/MM/YYYY'), key: "departureDate" },
        {
            title: "Thao tác", key: "action", render: (text, record) => (
                <Button style={{ backgroundColor: 'green', color: 'white', width: '70px' }} onClick={() => addToOrder(record)}>Thêm</Button>
            ),
        }
    ]
    const handleChange = ({ fileList: newFileList }) => {
        setFileList(newFileList)
        console.log("fileList", fileList);
    }
    const handleUpload = async (info) => {
        // Ensure the file is correctly accessed
        const file = info.file; // Use info.file directly
        if (!file) {
            message.error("No file provided.");
            return;
        }

        console.log("file", file.name); // This should now work
        console.log("fileList", fileList.length);

        try {
            const storageRef = ref(storage, `images/${file.name}`);
            // Upload the file to Firebase Storage
            const snapshot = await uploadBytes(storageRef, file);
            console.log('Upload successful:', snapshot);

            // Get the download URL
            const downloadURL = await getDownloadURL(snapshot.ref);
            console.log('File available at', downloadURL);

            // Remove the file without URL and replace with the new file with URL
            const updatedFileList = fileList.filter(file => file.uid !== info.file.uid);
            updatedFileList.push({ uid: info.file.uid, name: file.name, url: downloadURL });
            console.log("updatedFileList", updatedFileList);

            setFileList(updatedFileList);
            message.success(`${file.name} uploaded successfully!`);
        } catch (error) {
            console.error('Error uploading file:', error);
            message.error(`Upload failed: ${error.message}`);
        }
    }
    const confirmDelivering = async (record) => {
        if (fileList.length > 0) {
            record.confirmationImage = fileList[0].url;
            record.status = 'Delivered';
            console.log('record', record);
            try {
                const response = await api.put(`/OrderDetail/${record.orderDetailId}`, record);
                message.success("Giao hàng thành công");
                const response2 = await api.post('/TrackingOrderD', {
                    orderDetailId: record.orderDetailId,
                    trackingId: 4,
                })
                fetchOrdersListDelivering();
            }
            catch (error) {
                console.error('Error confirming delivering:', error);
                message.error("Giao hàng thất bại");
            }
            setFileList([]);
        }
        else {
            message.error("Vui lòng chọn hình ảnh");
        }
    }
    const addToOrderModal = async (record) => {
        try {
            const method = await api.get(`/Service/${record.serviceId}`);
            setRecordAddToOrder({
                ...record,
                transportMethod: method.data.transportMethod
            });
            record.transportMethod = method.data.transportMethod;
            fetchOrderDestination(record);
        }
        catch (error) {
            console.error('Error fetching order destination:', error);
        }
    }
    const addToOrder = async (record) => {
        console.log("Record: ", record);
        setIsLoading(true);
        try {
            const orderDetail = {
                ...recordAddToOrder,
                orderId: record.orderId,
                status: 'Delivering'
            }
            console.log("OrderDetail: ", orderDetail);

            const response = await api.put(`/OrderDetail/${orderDetail.orderDetailId}`, orderDetail);
            const response2 = await api.post('/TrackingOrderD', {
                orderDetailId: orderDetail.orderDetailId,
                trackingId: 3,
            })
            message.success("Thêm đơn hàng vào chuyến vận chuyển thành công");
            fetchOrdersList();
            handleAddToOrderCancel();
        }
        catch (error) {
            console.error('Error adding to order:', error);
            message.error("Thêm đơn hàng vào chuyến vận chuyển thất bại");
        }
        finally {
            setIsLoading(false);
        }
    }
    const createOrder = async () => {
        setIsLoading(true);
        console.log("RecordAddToOrder: ", recordAddToOrder);
        try {
            const response = await api.post('/Order', {
                startLocation: recordAddToOrder.startLocation.split('-')[2],
                destination: recordAddToOrder.destination.split('-')[2],
                transportMethod: recordAddToOrder.transportMethod,
                staffId: [],
                departureDate: moment().startOf('day').format('YYYY-MM-DDTHH:mm:ss'),
            })
            message.success("Tạo chuyến vận chuyển thành công");
            fetchOrderDestination(recordAddToOrder);

        }
        catch (error) {
            console.error('Error creating order:', error);
            message.error("Tạo chuyến vận chuyển thất bại");
        }
        finally {
            setIsLoading(false);
        }
    }
    const fetchOrderDestination = async (record) => {
        setIsLoading(true);
        try {
            const response = await api.get(`/Order/filter?startLocation=${record.startLocation.split('-')[2]}&destination=${record.destination.split('-')[2]}&transportMethod=${record.transportMethod}`);
            setListOrderDestination(response.data);
            setIsAddToOrderModalVisible(true);
        }
        catch (error) {
            console.error('Error fetching orders list:', error);
        }
        finally {
            setIsLoading(false);
        }
    }
    const showDetailModal = (record) => {
        console.log("Record: ", record);
        setRecordDetail(record);
        setIsDetailModalVisible(true);

    }

    const handleDetailCancel = () => {
        setIsDetailModalVisible(false);
    }
    const fetchOrdersListDelivering = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/OrderDetail/deliveryperson/${user.name}`);
            setOrdersList(response.data);
            console.log('ordersListDelivering', response.data);
        }
        catch (error) {
            console.error('Error fetching orders list:', error);
        }
        finally {
            setIsLoading(false);
        }
    }
    const fetchOrdersList = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/OrderDetail');

            setOrdersList(response.data);
            console.log("OrdersList: ", response.data);
            setPendingOrder(response.data.filter(order => order.status === 'Pending').length);
        }
        catch (error) {
            console.error('Error fetching orders list:', error);
        }
        finally {
            setIsLoading(false);
        }
    };

    const handleAddToOrderCancel = () => {
        setIsAddToOrderModalVisible(false);
    }
    const updateOrderDetail = async (order) => {
        console.log("Order: ", order);
        const orderDetail = {
            orderDetailId: order.orderDetailId,
            orderId: order.orderId,
            customerName: order.customerName,
            serviceId: order.serviceId,
            price: order.totalPrice,
            status: 'Waiting',
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
            deliveryPerson: order.deliveryPerson,
            confirmationImage: order.confirmationImage,
        }
        console.log("OrderDetail updated:", orderDetail);
        console.log("OrderDetail:", order);
        try {
            const response = await api.put(`/OrderDetail/${orderDetail.orderDetailId}`, orderDetail);
            console.log("OrderDetail updated:", response.data);
            message.success("Cập nhật đơn hàng thành công");
            const response2 = await api.post('/TrackingOrderD', {
                orderDetailId: orderDetail.orderDetailId,
                trackingId: 2,
            })
            console.log("TrackingOrderDetail:", response2.data);

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
            deliveryPerson: order.deliveryPerson,
            confirmationImage: order.confirmationImage,
            image: order.image,
        });
    });
    useEffect(() => {
        console.log('user', user.role);

        if (user.role === 'Delivering Staff') {


            fetchOrdersListDelivering();
        }
        else {
            fetchOrdersList();
        }



    }, []);
    return (
        <div>
            {isLoading && <Spin size="large" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }} />}
            <h1>Quản lý đơn hàng</h1>
            <div style={{ marginBottom: '20px' }}>
                {user.role === 'Delivering Staff' ? <></> : <div style={{ marginBottom: '10px' }}>
                    <Text >Số đơn hàng chờ xử lý: {pendingOrder}</Text>
                </div>}
                <Input
                    value={filterName}
                    placeholder="Tìm kiếm đơn hàng theo tên khách hàng"
                    style={{ width: 200, marginRight: '10px' }}
                    onChange={(e) => {
                        setFilterName(e.target.value);
                    }}
                />
                <Select
                    value={filterStatus}
                    style={{ width: 200, marginRight: '10px' }}
                    placeholder="Trạng thái đơn hàng"
                    onChange={(e) => {
                        setFilterStatus(e);
                    }}
                >
                    <Option value="">Tất cả trạng thái</Option>
                    <Option value="Pending">Chờ xử lý</Option>
                    <Option value="Waiting">Chờ lấy hàng</Option>
                    <Option value="Delivering">Đang vận chuyển</Option>
                    <Option value="Delivered">Đã giao hàng</Option>
                    <Option value="Finish">Hoàn thành</Option>
                    <Option value="Canceled">Đã hủy</Option>
                </Select>

                <Button style={{ backgroundColor: 'blue', color: 'white', width: '88px' }} onClick={() => {
                    setFilterStatus('');
                    setFilterName('');
                    { user.role === 'Delivering Staff' ? fetchOrdersListDelivering() : fetchOrdersList() }
                }}>Làm mới</Button>
            </div>
            <Table columns={user.role === 'Delivering Staff' ? columnsDeli : columns} dataSource={orderList.filter(order =>
                (filterName === '' || order.customerName.toLowerCase().includes(filterName.toLowerCase())) &&
                (filterStatus === '' || order.status === filterStatus)
            )
            }
                expandable={{
                    expandedRowRender: (record) => <div><p>Địa chỉ gửi: {record.startLocation}</p><p>Địa chỉ nhận: {record.destination}</p></div>,
                    rowExpandable: (record) => user.role === 'Delivering Staff',
                }}
                locale={{ emptyText: 'Không tìm thấy đơn hàng' }} />
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
                        <Descriptions.Item label="Nhân viên giao hàng" span={3}>{recordDetail.deliveryPerson}</Descriptions.Item>
                        <Descriptions.Item label="Tên người nhận" span={3}>{recordDetail.receiverName}</Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại người nhận" span={3}>{recordDetail.receiverPhone}</Descriptions.Item>
                        <Descriptions.Item label="Cân nặng" span={3}>{recordDetail.weight}</Descriptions.Item>
                        <Descriptions.Item label="Mã dịch vụ" span={3}>{recordDetail.serviceId}</Descriptions.Item>
                        <Descriptions.Item label="Số lượng" span={3}>{recordDetail.quantity}</Descriptions.Item>

                        <Descriptions.Item label="Dịch vụ" span={3}>{recordDetail.serviceName === "economy" ? "Giao tiết kiệm" : recordDetail.serviceName === "express" ? "Giao hoả tốc" : "Giao nhanh"}</Descriptions.Item>
                        <Descriptions.Item label="Tổng tiền" span={3}><span>{recordDetail.totalPrice?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span></Descriptions.Item>

                        <Descriptions.Item label="Ngày đặt hàng" span={3}>{moment(recordDetail.createdDate).format('DD/MM/YYYY')}</Descriptions.Item>

                        <Descriptions.Item label="Tình trạng cá" span={3}>{recordDetail.koiStatus}</Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ lấy hàng" span={3}>{recordDetail.startLocation}</Descriptions.Item>
                        <Descriptions.Item label="Vật phẩm đi kèm" span={3}>{recordDetail.attachedItem}</Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ giao hàng" span={3}>{recordDetail.destination}</Descriptions.Item>

                        <Descriptions.Item label="Trạng thái đơn hàng" span={3}>

                            {recordDetail.status === 'Pending' ? 'Chờ xử lý' : recordDetail.status === 'Waiting' ? 'Chờ lấy hàng' : recordDetail.status === 'Delivering' ? 'Đang vận chuyển' : recordDetail.status === 'Finish' ? 'Hoàn thành' : recordDetail.status === 'Cancel' ? 'Đã hủy' : 'Đã giao hàng'}


                        </Descriptions.Item>
                        {recordDetail.status === 'Delivered' || recordDetail.status === 'Finish' ? <Descriptions.Item label="Hình ảnh xác nhận" span={6}>
                            <Image src={recordDetail.confirmationImage} width={100} height={100} />
                        </Descriptions.Item> : ''}
                        <Descriptions.Item label="Hình ảnh mô tả" span={6}>
                            <Row>
                                {recordDetail.image === null ? <Text>Không có</Text> : recordDetail.image?.split(',').length > 0 ? recordDetail.image?.split(',').map((item, index) => (
                                    <div key={index}><Image src={item} width={100} height={100} /></div>
                                )) : <Image src={recordDetail.image} width={100} height={100} />}
                            </Row>
                        </Descriptions.Item>
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
                <Modal
                    width={1000}
                    open={isAddToOrderModalVisible}

                    footer={[
                        <Button key="back" onClick={handleAddToOrderCancel}>
                            Đóng
                        </Button>,
                    ]}
                >
                    {isLoading && <Spin size="small" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} />}
                    <Table columns={columnOrderDestination} dataSource={listOrderDestination}
                        locale={{ emptyText: 'Không có chuyến vận chuyển phù hợp' }}

                    />
                    <Button style={{ backgroundColor: 'blue', color: 'white', width: '200px' }} onClick={createOrder}>Tạo chuyến cho đơn hàng</Button>
                </Modal>

            </div>
        </div>
    );
};

export default OrderList;