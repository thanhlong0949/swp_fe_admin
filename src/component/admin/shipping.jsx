import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Modal, Tag, Form, message, Popconfirm, DatePicker, Col, Row, Typography, Descriptions, Spin } from 'antd';
import moment from 'moment';
import api from '../config/axios';



const { Option } = Select;
const { Search } = Input;
const { Text } = Typography;
const { RangePicker } = DatePicker;
const Shipping = ({ showModal }) => {
    const [filterStatus, setFilterStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [filterMethod, setFilterMethod] = useState('');
    const [filterTime, setFilterTime] = useState('');
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
    const [newOrder, setNewOrder] = useState({});
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
        { title: 'Ngày đến', dataIndex: 'arrivalDate', key: 'arrivalDate', render: (value) => moment(value).format('DD/MM/YYYY') },
        {
            title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (value) =>
                <Tag color={value === 'Ready' || value === 'Pending' ? 'blue' : value === 'Delivering' ? 'orange' : value === 'Finish' ? 'green' : 'gray'}>{value === 'Ready' || value === 'Pending' ? 'Sẵn sàng' : value === 'Delivering' ? 'Đang vận chuyển' : value === 'Finish' ? 'Hoàn thành' : ''}</Tag>

        },
        { title: 'Nhân viên phụ trách', dataIndex: 'employee', key: 'employee' },
        {
            title: 'Thao tác',
            key: 'action',
            render: (record) => <Button onClick={() => showDetailModal(record)}>Chi tiết</Button>,
        },

    ];

    const columnOrderDetail = [
        { title: "Mã đơn hàng", dataIndex: "orderDetailId", key: "orderDetailId" },
        { title: "Tên khách hàng", dataIndex: "customerName", key: "customerName" },
        { title: "Mã dịch vụ", dataIndex: "serviceId", key: "serviceId" },
        {
            title: "Tổng tiền",
            dataIndex: "price",
            key: "price",

            render: (value) => <span>{value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>,
        },
        {
            title: "Trạng thái đơn hàng", dataIndex: "status", key: "status"
            , render: (value, record) =>
                <Select
                    defaultValue={value}
                    style={{ width: 200, marginRight: '10px' }}
                    placeholder="Trạng thái đơn hàng"
                    onChange={(newValue) => {
                        record.status = newValue;
                        console.log(record + " " + value + " " + newValue);

                    }}
                >

                    <Option value="Delivering">Đang vận chuyển</Option>
                    <Option value="Delivered">Đã giao hàng</Option>
                </Select>
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
            const response = await api.get('/OrderDetail/status/waiting');
            setAddOrderDetailList(response.data);
            console.log(addOrderDetailList);
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
                departureDate: moment(newOrder.departureDate).format('YYYY-MM-DDTHH:mm:ss'),
                arrivalDate: moment(newOrder.arrivalDate).format('YYYY-MM-DDTHH:mm:ss'),
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
            setNewOrder({});
            setIsSelectDay(false);
        } catch (error) {
            console.error('Error adding shipping:', error.response.data);
            message.error('Thêm chuyến thất bại');
        }
    };

    const addNewOrderDetail = async (selectedRows) => {
        console.log('Selected rows:', selectedRows);
        setOrderDetailList(prev => [...prev, ...selectedRows]);
        setAddOrderDetailList([]);
        setIsAddOrderDetailModalVisible(false);
        try {
            selectedRows.forEach(async (order) => {

                const response = await api.get(`/OrderDetail/${order.orderDetailId}`);
                const orderDetail = response.data;
                orderDetail.status = 'Delivering';
                orderDetail.orderId = orderId;
                const response2 = await api.put(`/OrderDetail/${order.orderDetailId}`, orderDetail);
                console.log(response2.data);
                fetchOrderDetailList(shippingDetail);
                fetchShippingList();
            });

            message.success('Thêm đơn hàng thành công');

        } catch (error) {
            console.error('Error adding order detail:', error.response.data);
            message.error('Thêm đơn hàng thất bại');
        }
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


    const updateOrderDetail = async (record) => {
        console.log('Updating orderDetailId:', record.orderDetailId); // Log the ID to be deleted
        try {

            const response = await api.put(`/OrderDetail/${record.orderDetailId}`, record);
            console.log(response.data);
            message.success('Cập nhật đơn hàng thành công');
            fetchOrderDetailList(shippingDetail);
        } catch (error) {
            console.error('Error updating order detail:', error.response.data);
            message.error('Cập nhật đơn hàng thất bại');
        }
    };
    const confirm = async (record) => {
        console.log('Deleting orderDetailId:', record.orderDetailId); // Log the ID to be deleted
        try {
            record.status = 'Waiting';
            record.orderId = 0;
            const response = await api.put(`/OrderDetail/${record.orderDetailId}`, record);
            console.log(response.data);
            message.success('Xoá đơn hàng thành công');
            fetchOrderDetailList(shippingDetail);
        } catch (error) {
            console.error('Error deleting order detail:', error.response.data);
        }
    };

    const cancel = (e) => {
    };


    const fetchOrderDetailList = async (record) => {
        try {
            const response = await api.get(`/Order/${record.key}`);
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
            ...record
        }));
        setOrderId(record.tripCode);
        fetchOrderDetailList(record);
        console.log("shippingDetail", shippingDetail);

    };

    useEffect(() => {
        fetchShippingList();
    }, []);

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
                arrivalDate: moment(record.arrivalDate).format('YYYY-MM-DDTHH:mm:ss'),
                status: record.status,
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

    const handleAddStaff = async () => {
        console.log('Selected Staff IDs:', selectedStaffIds); // Log the selected staff IDs
        try {
            selectedStaffIds.forEach(async (staffId) => {
                shippingDetail.staff.push(staffId);
                const response = await api.post('/OrderStaff', {
                    orderId: shippingDetail.tripCode,
                    staffId: staffId
                });
                const response2 = await api.get(`/Staff/${staffId}`);
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
                <Button style={{ width: '200px' }} type="primary" onClick={() => setIsAddShippingModalVisible(true)}>Thêm chuyến mới</Button>
            </div>
            <div style={{ marginBottom: '20px' }}>
                <Search
                    placeholder="Tìm kiếm chuyến"
                    style={{ width: 200, marginRight: '10px' }}
                />
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
                dataSource={
                    filterMethod === '' && filterStatus === ''
                        ? shipList
                        : shipList.filter(ship =>
                            (filterMethod === '' || ship.method === filterMethod) &&
                            (filterStatus === '' || ship.status === filterStatus)
                        )
                }
            />
            <Modal width={900}
                title="Chi tiết chuyến vận chuyển"
                open={isDetailModalVisible}
                onCancel={() => setIsDetailModalVisible(false)}

                footer={<Button style={{ width: '100px' }} onClick={() => setIsDetailModalVisible(false)}>Đóng</Button>}
            >
                <Form layout="vertical" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }} initialValues={shippingDetail}>
                    <Form.Item label="Mã chuyến" name="tripCode">
                        <Input disabled />
                    </Form.Item>
                    <Form.Item label="Phương thức" name="method">
                        <Select

                            onChange={(value) => setShippingDetail({ ...shippingDetail, method: value })}
                            style={{ width: 200 }}
                        >
                            <Option value="road">Đường bộ</Option>
                            <Option value="air">Đường hàng không</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Điểm xuất phát" name="startPoint">
                        <Input onChange={(value) => setShippingDetail({ ...shippingDetail, startPoint: value.target.value })} />
                    </Form.Item>
                    <Form.Item label="Điểm đến" name="endPoint">
                        <Input onChange={(value) => setShippingDetail({ ...shippingDetail, endPoint: value.target.value })} />
                    </Form.Item>
                    {/* <Form.Item>
                        <RangePicker value={[moment(shippingDetail.departureDate), moment(shippingDetail.arrivalDate ? shippingDetail.arrivalDate : '')]} onChange={(value) =>
                        {
                            if (value && value[0] && value[1]) {
                                setShippingDetail({ ...shippingDetail, departureDate: value[0], arrivalDate: value[1] });
                            }
                        }} disabledDate={(current) => current < moment().startOf(moment(shippingDetail.departureDate).format('YYYY-MM-DD'))} />
                    </Form.Item> */}
                    <Form.Item label="Ngày khởi hành" >
                        <DatePicker
                            value={moment(shippingDetail.departureDate)}
                            format="DD/MM/YYYY"
                            placeholder="Chọn ngày khởi hành"
                            onChange={(newValue) => {
                                if (newValue) {
                                    console.log('departureDate', moment(shippingDetail.departureDate).format('DD/MM/YYYY'));
                                    console.log('value', newValue.format('DD/MM/YYYY'));
                                    setShippingDetail({ departureDate: newValue });

                                } else {
                                    console.error('Invalid departure date');
                                }
                            }}
                            disabledDate={(current) => current < moment().startOf('day')}
                        />
                    </Form.Item>
                    <Form.Item label="Ngày đến" >
                        <DatePicker
                            value={moment(shippingDetail.arrivalDate)}
                            placeholder="Chọn ngày đến"
                            onChange={(value) => {
                                if (value && value.isValid()) { // Validate the date
                                    setShippingDetail(prev => ({
                                        ...prev,
                                        arrivalDate: value
                                    }));
                                    console.log(shippingDetail.arrivalDate);
                                } else {
                                    console.error('Invalid arrival date');
                                }
                            }}
                            disabledDate={(current) => current < shippingDetail?.departureDate}
                        />
                    </Form.Item>

                    <Form.Item label="Số đơn hàng" >
                        <Input value={orderDetailList?.length} disabled />
                    </Form.Item>
                    {/* <Form.Item label="Tổng khối lượng (kg)">
                        <Input value={shippingDetail.totalWeight} onChange={(value) => setShippingDetail({ ...shippingDetail, totalWeight: value.target.value })} />
                    </Form.Item> */}
                    <Form.Item label="Trạng thái">
                        <Select
                            value={shippingDetail.status === 'Ready' ? 'Sẵn sàng' : shippingDetail.status === 'Delivering' ? 'Đang vận chuyển' : 'Hoàn thành'}
                            onChange={(value) => setShippingDetail({ ...shippingDetail, status: value })}
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
                                <React.Fragment key={staffs.staffId || index}> {/* Use staffId or index for uniqueness */}
                                    <Descriptions.Item label={'Nhân viên'}>
                                        {staffs.staffName}
                                    </Descriptions.Item>
                                    <Descriptions.Item>
                                        <Popconfirm
                                            onConfirm={() => removeStaff(staffs.staffId)}
                                            title="Bạn có chắc chắn muốn xoá nhân viên này?"
                                            okText="Có"
                                            cancelText="Không"
                                        >
                                            <Button style={{ width: '50px' }} danger>Xoá</Button>
                                        </Popconfirm>
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
                    <Button disabled={shippingDetail.status === 'Finish' ? true : false} style={{ marginTop: '20px', backgroundColor: '#1677FF', color: 'white', width: '150px' }} onClick={() => updateShipping(shippingDetail)}>Cập nhật</Button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <Table
                        columns={[...columnOrderDetail,
                        {
                            title: 'Thao tác',
                            render: (record) => (
                                <div>
                                    <Popconfirm
                                        onConfirm={() => confirm(record)} // Wrap in an arrow function
                                        onCancel={cancel}
                                        description="Bạn có chắc chắn muốn xoá đơn hàng này?"
                                        okText="Có"
                                        cancelText="Không"
                                    >
                                        <Button style={{ width: '50px' }} danger>Xoá</Button>
                                    </Popconfirm>
                                    <Button style={{ marginTop: '10px' }} onClick={() => updateOrderDetail(record)}>Cập nhật</Button>
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
                <Button style={{ marginTop: '20px', backgroundColor: '#1677FF', color: 'white', width: '200px' }} onClick={() => addOrderDetail()}>Thêm đơn hàng mới</Button>
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
                onCancel={() => setIsAddShippingModalVisible(false)}
                footer={
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={() => setIsAddShippingModalVisible(false)} style={{ marginRight: '10px', width: '100px' }}>Đóng</Button>
                        <Button type="primary" onClick={handleAddShipping} style={{ width: '100px' }}>Thêm</Button>
                    </div>
                }
            >
                <Form layout="vertical" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>

                    <Form.Item label="Phương thức" rules={[{ required: true, message: 'Vui lòng chọn phương thức!' }]}>
                        <Select placeholder="Chọn phương thức" onChange={(value) => setNewOrder({ ...newOrder, method: value })}>
                            <Option value="road">Đường bộ</Option>
                            <Option value="air">Đường hàng không</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Điểm xuất phát" rules={[{ required: true, message: 'Vui lòng nhập điểm xuất phát!' }]}>
                        <Input placeholder="Nhập điểm xuất phát" onChange={(value) => setNewOrder({ ...newOrder, startPoint: value.target.value })} />
                    </Form.Item>
                    <Form.Item label="Điểm đến" rules={[{ required: true, message: 'Vui lòng nhập điểm đến!' }]}>
                        <Input placeholder="Nhập điểm đến" onChange={(value) => setNewOrder({ ...newOrder, endPoint: value.target.value })} />
                    </Form.Item>
                    <Form.Item label="Ngày khởi hành" rules={[{ required: true, message: 'Vui lòng chọn ngày khởi hành!' }]}>
                        <DatePicker
                            placeholder="Chọn ngày khởi hành"
                            onChange={(value) => { setNewOrder({ ...newOrder, departureDate: value }); setIsSelectDay(true) }}
                            disabledDate={(current) => current < moment().startOf('day')}
                        />
                    </Form.Item>
                    <Form.Item label="Ngày đến" rules={[{ required: true, message: 'Vui lòng chọn ngày đến!' }]}>
                        <DatePicker

                            placeholder="Chọn ngày đến"
                            onChange={(value) => setNewOrder({ ...newOrder, arrivalDate: value })}
                            disabledDate={(current) => current < newOrder?.departureDate}
                        />
                    </Form.Item>

                </Form>
            </Modal>
        </div>
    );
};

export default Shipping;
