import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Modal, Tag, Form, message, Popconfirm, DatePicker, Col, Row, Typography, Descriptions, Spin, Popover } from 'antd';
import moment from 'moment';
import api from '../config/axios';



const { Option } = Select;
const { Search } = Input;
const { Text } = Typography;
const { RangePicker } = DatePicker;
const Shipping = ({ showModal }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const [filterStatus, setFilterStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [filterMethod, setFilterMethod] = useState('');
    const [filterDestination, setFilterDestination] = useState('');
    const [filterStartPoint, setFilterStartPoint] = useState('');
    const [status, setStatus] = useState();
    const [date, setDate] = useState();
    const [shippingList, setShippingList] = useState([]);
    const [isAddShippingModalVisible, setIsAddShippingModalVisible] = useState(false);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [isAddOrderDetailModalVisible, setIsAddOrderDetailModalVisible] = useState(false);
    const [isSelectDay, setIsSelectDay] = useState(false);
    const [shippingDetail, setShippingDetail] = useState({
        staff: [],
        orderDetails: [],
    });
    const [listStaff, setListStaff] = useState([]);
    const [newOrder, setNewOrder] = useState({
        method: undefined,
        startPoint: undefined,
        endPoint: undefined,
        departureDate: null,
    });
    const [form] = Form.useForm();
    const [orderDetailList, setOrderDetailList] = useState([]);
    const [addOrderDetailList, setAddOrderDetailList] = useState([]);
    const [isAddStaffModalVisible, setIsAddStaffModalVisible] = useState(false);
    const [selectedStaffIds, setSelectedStaffIds] = useState([]); // State to hold selected staff IDs
    const [selectedRows, setSelectedRows] = useState([]); // State to hold selected rows
    const [orderId, setOrderId] = useState('');
    const columns = [
        { title: 'Mã chuyến', dataIndex: 'tripCode', key: 'tripCode' },

        { title: 'Phương thức', dataIndex: 'method', key: 'method', render: (value) => <Text>{value === 'road' ? 'Đường bộ' : 'Đường hàng không'}</Text> },
        { title: 'Điểm xuất phát', dataIndex: 'startPoint', key: 'startPoint' },
        { title: 'Điểm đến', dataIndex: 'endPoint', key: 'endPoint' },
        { title: 'Ngày khởi hành', dataIndex: 'departureDate', key: 'departureDate', render: (value) => moment(value).format('DD/MM/YYYY') },
        { title: 'Ngày đến', dataIndex: 'arrivalDate', key: 'arrivalDate', render: (value) => value === null ? 'Chuyến chưa hoàn thành' : moment(value).format('DD/MM/YYYY') },
        {
            title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (value) =>
                <Tag color={value === 'Ready' || value === 'Pending' ? 'blue' : value === 'Delivering' ? 'orange' : value === 'Finish' ? 'green' : 'gray'}>{value === 'Ready' || value === 'Pending' ? 'Sẵn sàng' : value === 'Delivering' ? 'Đang vận chuyển' : value === 'Finish' ? 'Hoàn thành' : ''}</Tag>

        },
        { title: 'Nhân viên phụ trách', dataIndex: 'employee', key: 'employee' },
        {
            title: 'Thao tác',
            key: 'action',
            render: (record) => <Button style={{ backgroundColor: 'blue', color: 'white', width: '88px' }} onClick={() => showDetailModal(record)}>Chi tiết</Button>,
        },


    ];

    const columnOrderDetail = [
        { title: "Mã đơn hàng", dataIndex: "orderDetailId", key: "orderDetailId" },
        { title: "Tên khách hàng", dataIndex: "customerName", key: "customerName" },
        { title: "Nhân viên phụ trách", dataIndex: "deliveryPerson", key: "deliveryPerson", render: (value) => value === '' ? 'Chưa phân công' : value },
        {
            title: "Tổng tiền",
            dataIndex: "price",
            key: "price",

            render: (value) => <span>{value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>,
        },
        {
            title: "Trạng thái đơn hàng", dataIndex: "status", key: "status"
            , render: (value, record) =>
                value ? <Tag color={value === 'Delivering' || value === 'Waiting' ? 'orange' : value === 'Finish' || value === 'Delivered' ? 'green' : value === 'Pending' ? 'blue' : 'red'}>{value === 'Pending' ? 'Chờ xử lý' : value === 'Delivering' ? 'Đang vận chuyển' : value === 'Finish' ? 'Hoàn thành' : value === 'Waiting' ? 'Chờ lấy hàng' : value === 'Canceled' ? 'Đã huỷ' : 'Đã giao hàng'}</Tag> : ''
        },
        { title: "Ngày đặt hàng", render: (value) => moment(value).format('DD/MM/YYYY'), key: "createdDate" },
    ];

    const columnAddOrderDetail = [
        { title: "Mã đơn hàng", dataIndex: "orderDetailId", key: "orderDetailId" },

        { title: "Tên khách hàng", dataIndex: "customerName", key: "customerName" },
        { title: "Mã dịch vụ", dataIndex: "serviceId", key: "serviceId" },
        {
            title: "Tổng tiền",
            dataIndex: "price",
            render: (value) => <span>{value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>,
            key: "price"
        },
        {
            title: "Trạng thái đơn hàng", dataIndex: "status", key: "status",
            render: (value) => "Chờ lấy hàng"
        },
        { title: "Ngày đặt hàng", render: (value) => moment(value).format('DD/MM/YYYY'), key: "createdDate" },
    ];

    const addStaff = async () => {
        setIsAddStaffModalVisible(true);
        try {
            const response = await api.get('/Staff/status/active');
            setListStaff(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Error adding staff:', error.response.data);
        }

    };

    const addOrderDetail = async () => {
        setIsAddOrderDetailModalVisible(true);
        try {
            const response = await api.get(`/OrderDetail/status/waiting?startLocation=${shippingDetail.startPoint}&destination=${shippingDetail.endPoint}&transportMethod=${shippingDetail.method}`);
            setAddOrderDetailList(response.data);
            console.log('addOrderDetailList', addOrderDetailList);
            fetchOrderDetailList(shippingDetail);
        } catch (error) {
            console.error('Error adding order detail:', error.response.data);
        }
    };
    let orderList = [];
    orderDetailList.forEach(order => {
        orderList.push({
            key: order.orderDetailId,
            orderDetailId: order.orderDetailId,
            customerName: order.customerName,
            totalPrice: order.price,
            status: order.status,
            createdDate: order.createdDate,
            serviceId: order.serviceId,
        });
    });


    const fetchShippingListStaff = async () => {
        try {
            const response = await api.get(`/Order/staff/${user?.id}`);
            setShippingList(response.data);
            console.log("shipping staff", response.data);
        } catch (error) {
            console.error('Error fetching shipping list:', error.response.data);
        }
    }
    const fetchShippingList = async () => {
        try {
            setIsLoading(true);

            const response = await api.get('/Order');
            setShippingList(response.data);
            console.log("shipping", response.data);
        } catch (error) {
            console.error('Error fetching shipping list:', error.response.data);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddShipping = async () => {
        try {
            const order = {
                startLocation: newOrder.startPoint,
                destination: newOrder.endPoint,
                transportMethod: newOrder.method,
                departureDate: newOrder.departureDate.format('YYYY-MM-DDTHH:mm:ss'),
                arrivalDate: null,
                status: 'Ready',
                deleteStatus: false,
                staffIds: [],
            }
            console.log('order', order);
            const response = await api.post('/Order', order);
            console.log(response.data);
            message.success('Thêm chuyến thành công');
            fetchShippingList();
            setIsAddShippingModalVisible(false);
            setNewOrder({
                ...newOrder,
                startPoint: undefined,
                endPoint: undefined,
                method: undefined,
                departureDate: null,
            });
            form.resetFields();
            setIsSelectDay(false);

        } catch (error) {
            console.error('Error adding shipping:', error.response.data);
            message.error('Thêm chuyến thất bại');
        }
    };

    const assignStaff = async (record, staffName) => {
        record.deliveryPerson = staffName;
        try {
            const response = await api.put(`/OrderDetail/${record.orderDetailId}`, record);
            console.log(response.data);
            message.success('Phân công nhân viên thành công');
            fetchOrderDetailList(shippingDetail);
        } catch (error) {
            console.error('Error assigning staff:', error.response.data);
            message.error('Phân công nhân viên thất bại');
        }
    }

    const addNewOrderDetail = async (selectedRows) => {
        console.log('Selected rows:', selectedRows);

        try {
            selectedRows.forEach(async (order) => {
                order.status = 'Delivering';
                const response = await api.get(`/OrderDetail/${order.orderDetailId}`);
                const orderDetail = response.data;
                orderDetail.status = 'Delivering';
                orderDetail.orderId = orderId;
                const response2 = await api.put(`/OrderDetail/${order.orderDetailId}`, orderDetail);
                console.log(response2.data);
                const response3 = await api.post('/TrackingOrderD', {
                    orderDetailId: orderDetail.orderDetailId,
                    trackingId: 3,
                })
                console.log("TrackingOrderDetail:", response3.data);
                fetchOrderDetailList(shippingDetail);
                fetchShippingList();
            });
            setOrderDetailList(prev => [...prev, ...selectedRows]);
            setAddOrderDetailList([]);
            setIsAddOrderDetailModalVisible(false);
            message.success('Thêm đơn hàng thành công');

        } catch (error) {
            console.error('Error adding order detail:', error.response.data);
            message.error('Thêm đơn hàng thất bại');
        }
    };




    const confirm = async (record) => {
        console.log('Deleting orderDetailId:', record.orderDetailId); // Log the ID to be deleted

        record.status = 'Waiting';
        record.orderId = 0;
        record.deliveryPerson = '';
        console.log('record', record);
        try {
            const response = await api.put(`/OrderDetail/${record.orderDetailId}`, record);
            const response2 = await api.delete(`/TrackingOrderD/${record.orderDetailId}/3`);
            message.success('Xoá đơn hàng thành công');
            shippingDetail.orderDetails = shippingDetail.orderDetails.filter(order => order.orderDetailId !== record.orderDetailId);
            fetchOrderDetailList(shippingDetail);
        } catch (error) {
            console.error('Error deleting order detail:', error.response.data);
        }
    };

    const cancel = (e) => {
    };


    const fetchOrderDetailList = async (record) => {
        console.log('shippingDetail', record);
        try {
            const response = await api.get(`/Order/${record.tripCode}`);
            console.log('response', response.data);
            setShippingDetail({ ...record, orderDetails: response.data.orderDetails });
            setOrderDetailList(response.data.orderDetails);
            console.log("order detail", response.data.orderDetails);
        } catch (error) {
            console.error('Error fetching order detail:', error.response.data);
        }
    };
    const showDetailModal = async (record) => {
        console.log("record", record);

        setIsDetailModalVisible(true);
        setShippingDetail(prev => ({
            ...prev,
            tripCode: record.tripCode,
            startPoint: record.startPoint,
            endPoint: record.endPoint,
            method: record.method,
            departureDate: record.departureDate,
            arrivalDate: record.arrivalDate,
            status: record.status,
            staff: record.staff,
        }));
        setStatus(record.status);
        setDate(record.departureDate);
        setOrderId(record.tripCode);
        fetchOrderDetailList(record);


    };

    useEffect(() => {
        user?.role === 'Delivering Staff' ? fetchShippingListStaff() : fetchShippingList();
    }, []);
    useEffect(() => {

    }, [shippingDetail, newOrder]);
    let shipList = [];
    shippingList.forEach(ship => {

        shipList.push({
            key: ship.orderId,
            tripCode: ship.orderId,
            method: ship.transportMethod,
            startPoint: ship.startLocation,
            endPoint: ship.destination,
            departureDate: ship.departureDate,
            arrivalDate: ship.arrivalDate,
            orderCount: ship?.orderDetails?.length ? ship.orderDetails.length : 0,
            totalWeight: ship.totalWeight,
            status: ship.status,
            employee: ship?.staffDeliveries?.length ? ship.staffDeliveries.length : 0,
            staff: ship?.staffDeliveries,
            orderDetails: ship?.orderDetails,
        });
    });

    const updateShipping = async (record) => {
        try {
            const order = {
                orderId: record.tripCode,
                startLocation: record.startPoint,
                destination: record.endPoint,
                transportMethod: record.method,
                departureDate: moment(record.departureDate).format('YYYY-MM-DDTHH:mm:ss'),
                arrivalDate: status === 'Finish' ? moment().startOf('day').format('YYYY-MM-DDTHH:mm:ss') : null,
                status: status,
                totalWeight: record.totalWeight,
                deleteStatus: false,


            }
            console.log(order);
            const response = await api.put(`/Order/${order.orderId}`, order);
            console.log(response.data);
            message.success('Cập nhật chuyến thành công');
            fetchShippingList();
            setIsDetailModalVisible(false);
        } catch (error) {
            console.error('Error updating shipping:', error.response.data);
        }
    };
    const handleStaffChange = (value) => {
        console.log(value);
        setSelectedStaffIds(value); // Update selected staff IDs
    };

    const removeStaff = async (staffId) => {
        console.log('Removing staffId:', staffId);
        console.log('Current staff:', shippingDetail.staff);


        try {
            const response = await api.delete(`/OrderStaff/delete?orderId=${shippingDetail.tripCode}&staffId=${staffId}`);
            const response2 = await api.get(`/Staff/${staffId}`);
            const response3 = await api.put(`/Staff/${staffId}`, {
                ...response2.data,
                status: 'Active'
            });
            console.log(response.data);
            console.log(response3.data);
            message.success('Xoá nhân viên thành công');
            fetchShippingList();
            setShippingDetail(prev => {
                const updatedStaff = prev.staff.filter(staff => staff.staffId !== staffId);
                console.log('Updated staff:', updatedStaff);
                return {
                    ...prev,
                    staff: updatedStaff
                };
            });
        } catch (error) {
            console.error('Error deleting staff:', error.response.data);
            message.error('Xoá nhân viên thất bại');
        }
    };

    const handleAddStaff = async () => {
        console.log('Selected Staff IDs:', selectedStaffIds); // Log the selected staff IDs

        console.log('Current staff:', shippingDetail.staff);
        try {
            selectedStaffIds.forEach(async (staffId) => {

                const response = await api.post('/OrderStaff', {
                    orderId: shippingDetail.tripCode,
                    staffId: staffId
                });
                const response2 = await api.get(`/Staff/${staffId}`);
                shippingDetail.staff.push({
                    staffId: staffId,
                    staffName: response2.data.staffName,
                });
                const response3 = await api.put(`/Staff/${staffId}`, {
                    ...response2.data,
                    status: 'Inactive'
                });
                console.log(response3.data);

                message.success('Thêm nhân viên thành công');
                fetchShippingList();
                setIsAddStaffModalVisible(false); // Close the modal after adding
                setSelectedStaffIds([]);
            });
        } catch (error) {
            console.error('Error adding staff:', error.response.data);
            message.error('Thêm nhân viên thất bại');
            setIsAddStaffModalVisible(false);
        }

    };


    return (
        <div>
            {isLoading && <Spin fullscreen size="large" />}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h1>Vận chuyển</h1>
                {user?.role === 'Delivering Staff' ? <></> : <Button style={{ width: '200px' }} type="primary" onClick={() => setIsAddShippingModalVisible(true)}>Thêm chuyến mới</Button>}

            </div>
            <div style={{ marginBottom: '20px' }}>
                <Text>Tìm kiếm chuyến</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>

                <Select
                    style={{ width: 200, marginRight: '10px' }}
                    placeholder="Điểm xuất phát"
                    onChange={(value) => setFilterStartPoint(value)}
                >
                    <Option value="">Tất cả</Option>
                    <Option value="Huế">Huế</Option>
                    <Option value="Hồ Chí Minh">Hồ Chí Minh</Option>
                    <Option value="Hà Nội">Hà Nội</Option>
                </Select>
                <Select
                    style={{ width: 200, marginRight: '10px' }}
                    placeholder="Điểm đến"
                    onChange={(value) => setFilterDestination(value)}
                >
                    <Option value="">Tất cả</Option>
                    <Option value="Huế">Huế</Option>
                    <Option value="Hồ Chí Minh">Hồ Chí Minh</Option>
                    <Option value="Hà Nội">Hà Nội</Option>
                </Select>
                <Select
                    style={{ width: 200, marginRight: '10px' }}
                    placeholder="Phương thức vận chuyển"
                    onChange={(value) => setFilterMethod(value)}
                >
                    <Option value="">Tất cả phương thức</Option>
                    <Option value="road">Đường bộ</Option>
                    <Option value="air">Đường hàng không</Option>
                </Select>
                <Select
                    style={{ width: 200 }}
                    placeholder="Trạng thái"

                    onChange={(value) => setFilterStatus(value)}
                >
                    <Option value="">Tất cả trạng thái</Option>
                    <Option value="Ready">Sẵn sàng</Option>
                    <Option value="Delivering">Đang vận chuyển</Option>
                    <Option value="Finish">Đã giao hàng</Option>
                </Select>
            </div>
            <Table
                columns={columns}
                dataSource={shipList.filter(ship =>
                    (filterMethod === '' || ship.method === filterMethod) &&
                    (filterStatus === '' || ship.status === filterStatus) &&
                    (filterStartPoint === '' || ship.startPoint === filterStartPoint) &&
                    (filterDestination === '' || ship.endPoint === filterDestination)
                )
                }
            />
            <Modal width={900}
                title="Chi tiết chuyến vận chuyển"
                open={isDetailModalVisible}
                onCancel={() => setIsDetailModalVisible(false)}

                footer={<Button style={{ width: '100px' }} onClick={() => setIsDetailModalVisible(false)}>Đóng</Button>}
            >
                <Form layout="vertical" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <Form.Item label="Mã chuyến">
                        <Input disabled value={shippingDetail.tripCode} />
                    </Form.Item>
                    <Form.Item label="Phương thức">
                        <Select
                            value={shippingDetail.method}
                            disabled={shippingDetail.status === 'Finish' || shippingDetail.orderDetails.length > 0 ? true : false}
                            onChange={(value) => setShippingDetail({ ...shippingDetail, method: value })}
                            style={{ width: 200 }}
                        >
                            <Option value="road">Đường bộ</Option>
                            <Option value="air">Đường hàng không</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Điểm xuất phát">
                        <Select disabled={shippingDetail.status === 'Finish' || shippingDetail.orderDetails.length > 0 ? true : false} onChange={(value) => setShippingDetail({ ...shippingDetail, startPoint: value })} value={shippingDetail.startPoint}>
                            <Option value="Huế">Huế</Option>
                            <Option value="Hồ Chí Minh">Hồ Chí Minh</Option>
                            <Option value="Hà Nội">Hà Nội</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Điểm đến" >
                        <Select disabled={shippingDetail.status === 'Finish' || shippingDetail.orderDetails.length > 0 ? true : false} onChange={(value) => setShippingDetail({ ...shippingDetail, endPoint: value })} value={shippingDetail.endPoint}>
                            <Option value="Huế">Huế</Option>
                            <Option value="Hồ Chí Minh">Hồ Chí Minh</Option>
                            <Option value="Hà Nội">Hà Nội</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Ngày khởi hành" >
                        <DatePicker
                            disabled={shippingDetail.status === 'Finish' ? true : false}
                            value={moment(shippingDetail.departureDate)}
                            format="DD/MM/YYYY"
                            placeholder="Chọn ngày khởi hành"
                            onChange={(newValue) => {
                                if (newValue) {
                                    console.log('newValue', newValue.format('DD/MM/YYYY'));

                                    setShippingDetail({ ...shippingDetail, departureDate: newValue.format('YYYY-MM-DDTHH:mm:ss') });
                                } else {
                                    console.error('Invalid departure date');
                                }
                            }}
                            disabledDate={(current) => current < moment().startOf('day')}
                        />
                    </Form.Item>
                    <Form.Item label="Ngày đến" >
                        <Text>{shippingDetail.arrivalDate === null ? 'Chuyến chưa hoàn thành' : moment(shippingDetail.arrivalDate).format('DD/MM/YYYY')}</Text>
                    </Form.Item>

                    <Form.Item label="Số đơn hàng" >
                        <Input value={orderDetailList?.length} disabled />
                    </Form.Item>
                    {/* <Form.Item label="Tổng khối lượng (kg)">
                        <Input value={shippingDetail.totalWeight} onChange={(value) => setShippingDetail({ ...shippingDetail, totalWeight: value.target.value })} />
                    </Form.Item> */}
                    <Form.Item label="Trạng thái">
                        <Select
                            disabled={shippingDetail.status === 'Finish' ? true : false}
                            value={status === 'Ready' ? 'Sẵn sàng' : status === 'Delivering' ? 'Đang vận chuyển' : 'Hoàn thành'}
                            // onChange={(value) => setShippingDetail({ ...shippingDetail, status: value })}
                            onChange={(value) => setStatus(value)}
                            style={{ width: 200 }}
                        >
                            <Option value="Ready">Sẵn sàng</Option>
                            <Option value="Delivering">Đang vận chuyển</Option>
                            <Option value="Finish">Hoàn thành</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item >
                        <Descriptions title="Nhân viên phụ trách">
                            {shippingDetail.staff?.map((staffs, index) => ( // Add index as a fallback for unique keys
                                <React.Fragment key={index}> {/* Use staffId or index for uniqueness */}
                                    <Descriptions.Item label={'Nhân viên'}>
                                        {staffs.staffName}
                                    </Descriptions.Item>
                                    <Descriptions.Item>
                                        {shippingDetail.orderDetails.filter(order => order.deliveryPerson === staffs.staffName).length > 0 ? <></> :
                                            <Popconfirm
                                                onConfirm={() => removeStaff(staffs.staffId)}
                                                title="Bạn có chắc chắn muốn xoá nhân viên này?"
                                                okText="Có"
                                                cancelText="Không"
                                            >
                                                <Button disabled={shippingDetail.status === 'Finish' ? true : false} style={{ width: '50px' }} danger>Xoá</Button>
                                            </Popconfirm>
                                        }
                                    </Descriptions.Item>

                                </React.Fragment>
                            ))}
                        </Descriptions>

                        <Button disabled={shippingDetail.status === 'Finish' ? true : false} style={{ width: '50px' }} onClick={() => addStaff()}>
                            +
                        </Button>
                    </Form.Item>
                </Form>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <Button disabled={shippingDetail.status === 'Finish' || shippingDetail.staff.length === 0 ? true : false} style={{ marginTop: '20px', backgroundColor: shippingDetail.status === 'Finish' || shippingDetail.staff.length === 0 ? '#999' : '#1677FF', color: 'white', width: '150px' }} onClick={() => updateShipping(shippingDetail)}>Cập nhật</Button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <Table
                        columns={[...columnOrderDetail,
                        {
                            title: 'Thao tác',
                            render: (record) => (
                                record.status === 'Finish' ? <></> :
                                    <div>

                                        <Popconfirm
                                            onConfirm={() => confirm(record)} // Wrap in an arrow function
                                            onCancel={cancel}
                                            description="Bạn có chắc chắn muốn xoá đơn hàng này?"
                                            okText="Có"
                                            cancelText="Không"
                                        >
                                            <Button disabled={record.status === 'Delivered' ? true : false} style={{ width: '50px' }} danger>Xoá</Button>
                                        </Popconfirm>


                                        <Popover
                                            title="Nhân viên phụ trách"
                                            trigger="click"
                                            content={
                                                <div>
                                                    {shippingDetail.staff.map(staff => (
                                                        <Row>
                                                            <Col span={12}>{staff.staffName}</Col>
                                                            <Col span={12}>{record.deliveryPerson === staff.staffName ? <></> : <Button onClick={() => assignStaff(record, staff.staffName)}>Phân công</Button>}</Col>
                                                        </Row>
                                                    ))}
                                                </div>}>
                                            <Button style={{ marginTop: '10px' }}>Phân công</Button>
                                        </Popover>
                                    </div>
                            ),

                        }]}
                        expandable={{
                            expandedRowRender: (record) => (

                                <Row gutter={16}>
                                    <Col span={3}>
                                        <Text style={{ fontWeight: 'bold' }}>
                                            <Row>
                                                <Text>Điểm đi: </Text>

                                            </Row>
                                            <Row>
                                                <Text>Điểm đến: </Text>
                                            </Row>
                                        </Text>

                                    </Col>
                                    <Col span={4}>
                                        <Text>
                                            <Row>
                                                <Text>{record.startLocation} </Text>
                                            </Row>
                                            <Row>
                                                <Text>{record.destination} </Text>
                                            </Row>
                                        </Text>
                                    </Col>
                                    <Col span={4}>
                                        <Text style={{ fontWeight: 'bold' }}>
                                            <Row>
                                                <Text>Người nhận: </Text>

                                            </Row>
                                            <Row>
                                                <Text>Sdt người nhận: </Text>
                                            </Row>
                                        </Text>

                                    </Col>
                                    <Col span={4}>
                                        <Text>
                                            <Row>
                                                <Text>{record.receiverName} </Text>
                                            </Row>
                                            <Row>
                                                <Text>{record.receiverPhone} </Text>
                                            </Row>
                                        </Text>
                                    </Col>
                                    <Col span={5}>
                                        <Text style={{ fontWeight: 'bold' }}>
                                            <Row>
                                                <Text>Vật phẩm đính kèm: </Text>

                                            </Row>
                                            <Row>
                                                <Text>Dịch vụ gia tăng: </Text>
                                            </Row>
                                            {record.advancedServiceNames.map(service => (
                                                <Row>
                                                    <Text style={{ fontWeight: 'normal' }}> - {service} </Text>
                                                </Row>
                                            ))}
                                        </Text>

                                    </Col>
                                    <Col span={4}>
                                        <Text>
                                            <Row>
                                                <Text>{record.attachedItems ? record.attachedItems : 'Không có'} </Text>
                                            </Row>



                                        </Text>
                                    </Col>
                                </Row>
                            ),
                        }}
                        dataSource={orderDetailList}
                        title={() => (
                            <>

                                <span style={{ marginLeft: '10px', display: 'flex-end' }}><h3>Chi tiết đơn hàng</h3></span>
                            </>
                        )}
                        pagination={false}
                        rowKey="orderDetailId"
                        style={{ marginTop: '20px' }}

                    />
                </div>
                <Button disabled={shippingDetail.status === 'Finish' ? true : false} style={{ marginTop: '20px', backgroundColor: shippingDetail.status === 'Finish' ? '#999' : '#1677FF', color: 'white', width: '200px' }} onClick={() => addOrderDetail()}>Thêm đơn hàng mới</Button>
            </Modal>
            <Modal
                title="Chọn nhân viên phụ trách"
                open={isAddStaffModalVisible}
                onCancel={() => setIsAddStaffModalVisible(false)}
                footer={
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={() => setIsAddStaffModalVisible(false)} style={{ marginRight: '10px', width: '100px' }}>Đóng</Button>
                        <Button type="primary" onClick={handleAddStaff} style={{ width: '100px' }}>Thêm</Button>
                    </div>
                }
            >
                <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    placeholder="Chọn nhân viên"
                    value={selectedStaffIds}
                    onChange={handleStaffChange}
                >
                    {listStaff.map(staff => (
                        !shippingDetail.staff.some(existingStaff => existingStaff.staffId === staff.staffId) ? (
                            <Option key={staff.staffId} value={staff.staffId}>
                                {staff.staffName}
                            </Option>
                        ) : null
                    ))}
                </Select>
            </Modal>
            <Modal
                title="Chọn đơn hàng"
                open={isAddOrderDetailModalVisible}
                onCancel={() => setIsAddOrderDetailModalVisible(false)}
                width={900}

                footer={<Button style={{ width: '100px' }} onClick={() => setIsAddOrderDetailModalVisible(false)}>Đóng</Button>}
            >
                <Table
                    style={{ width: '100%' }} // Ensure the table takes full width
                    rowSelection={{
                        onChange: (selectedRowKeys, selectedRows) => {
                            console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
                            setSelectedRows(selectedRows); // Update state with selected rows
                        },
                    }}

                    columns={columnAddOrderDetail}
                    dataSource={addOrderDetailList}
                    pagination={false}
                    rowKey="orderDetailId"

                    footer={() => ( // Wrap the footer in a function
                        <Button
                            style={{ marginTop: '20px', backgroundColor: '#1677FF', color: 'white', width: '200px' }}
                            onClick={() => addNewOrderDetail(selectedRows)} // Pass selected rows to the function
                        >
                            Thêm
                        </Button>
                    )}
                />

            </Modal>



            <Modal
                title="Thêm chuyến vận chuyển mới"
                open={isAddShippingModalVisible}
                footer={null}
                width={900}
                destroyOnClose={true}
            >
                <Form
                    form={form}
                    labelCol={{ span: 7 }}
                    wrapperCol={{ span: 24 }}
                    clearOnDestroy={true}
                    layout="horizontal"
                    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}
                    onFinish={handleAddShipping} // Add this line
                >
                    <Form.Item label="Phương thức" rules={[{ required: true, message: 'Vui lòng chọn phương thức!' }]}>
                        <Select placeholder="Chọn phương thức" onChange={(value) => setNewOrder({ ...newOrder, method: value })}>
                            <Option value="road">Đường bộ</Option>
                            <Option value="air">Đường hàng không</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Điểm xuất phát" rules={[{ required: true, message: 'Vui lòng chọn điểm xuất phát!' }]}>
                        <Select placeholder="Chọn điểm xuất phát" onChange={(value) => setNewOrder({ ...newOrder, startPoint: value })}>
                            <Option value="Huế">Huế</Option>
                            <Option value="Hồ Chí Minh">Hồ Chí Minh</Option>
                            <Option value="Hà Nội">Hà Nội</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Điểm đến" rules={[{ required: true, message: 'Vui lòng chọn điểm đến!' }]}>
                        <Select placeholder="Chọn điểm đến" onChange={(value) => setNewOrder({ ...newOrder, endPoint: value })}>
                            <Option value="Huế">Huế</Option>
                            <Option value="Hồ Chí Minh">Hồ Chí Minh</Option>
                            <Option value="Hà Nội">Hà Nội</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Ngày khởi hành" rules={[{ required: true, message: 'Vui lòng chọn ngày khởi hành!' }]}>
                        <DatePicker
                            format="DD/MM/YYYY"
                            placeholder="Chọn ngày khởi hành"
                            onChange={(value) => { setNewOrder({ ...newOrder, departureDate: value }); setIsSelectDay(true) }}
                            disabledDate={(current) => current < moment().startOf('day')}
                        />
                    </Form.Item>

                    <div style={{ display: 'flex' }}>
                        <Button onClick={() => { form.resetFields(); setIsAddShippingModalVisible(false) }} style={{ marginRight: '10px', width: '100px' }}>Đóng</Button>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" style={{ width: '100px' }}>Thêm</Button> {/* Change to htmlType="submit" */}
                        </Form.Item>

                    </div>

                </Form>
            </Modal>


        </div>
    );
};

export default Shipping;
