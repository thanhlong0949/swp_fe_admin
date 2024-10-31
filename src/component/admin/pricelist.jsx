import React, { useState } from 'react';
import { Table, Button, Input, Select, Modal, Form, message, Spin } from 'antd';
import { useEffect } from 'react';
import api from '../config/axios';
import Column from 'antd/es/table/Column';
import CurrencyFormat from 'react-currency-format';

const { Option } = Select;

const PriceList = ({ showModal}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [filterMethod, setFilterMethod] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [priceList, setPriceList] = useState([]);
    const [adServiceList, setAdServiceList] = useState([]);
    const [recordDetail, setRecordDetail] = useState({});
    const [recordDetailAdService, setRecordDetailAdService] = useState({});
    const [isAdServiceDetailModalVisible, setIsAdServiceDetailModalVisible] = useState(false);
    const [isAddAdServiceModalVisible, setIsAddAdServiceModalVisible] = useState(false);
    const columns = [
        { title: 'Mã dịch vụ', dataIndex: 'code', key: 'code' },
        { title: 'Phương thức vận chuyển', dataIndex: 'method', key: 'method' },
        { title: 'Cân nặng (Kg)', dataIndex: 'weight', key: 'weight' },
        { title: 'Giao hàng tiết kiệm (VND)', dataIndex: 'ecoPrice', key: 'ecoPrice'
            ,render: (value) => <span>{<CurrencyFormat value={value} displayType={'text'} thousandSeparator={true}/>} ₫</span>
         },
        { title: 'Giao hàng nhanh (VND)', dataIndex: 'expPrice', key: 'expPrice'
            ,render: (value) => <span>{<CurrencyFormat value={value} displayType={'text'} thousandSeparator={true}/>} ₫</span>
         },
        { title: 'Giao hàng hoả tốc (VND)', dataIndex: 'fastPrice', key: 'fastPrice'
            ,render: (value) => <span>{<CurrencyFormat value={value} displayType={'text'} thousandSeparator={true}/>} ₫</span>
         },
        { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
    ];

    const columnsAdService = [
        { title: 'Mã dịch vụ', dataIndex: 'code', key: 'code' },
        { title: 'Tên dịch vụ', dataIndex: 'name', key: 'name' },
        { title: 'Giá cơ bản (VND)', dataIndex: 'basePrice', key: 'basePrice'
            ,render: (value) => <span>{<CurrencyFormat value={value} displayType={'text'} thousandSeparator={true}/>} ₫</span>
         },
        { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
    ];

    useEffect(() => {
        fetchPriceList();
        fetchAdServiceList();
    }, []);

    const fetchPriceList = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/Service');
            setPriceList(response.data);
            console.log("PriceList: ", response.data);
        } catch (error) {
            console.error('Error fetching price list:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAdServiceList = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/AdvancedService');
            setAdServiceList(response.data);
            console.log("ADService: ", response.data);
        } catch (error) {
            console.error('Error fetching ad service list:', error.response.data);
        } finally {
            setIsLoading(false);
        }
    };
    let serviceList = [];
    priceList.forEach(price => {
        serviceList.push({
            key: price.serviceId,
            code: price.serviceId,
            method: price.transportMethod === "Air" ? "Đường hàng không" : "Đường bộ",
            weight: price.weightRange,
            ecoPrice: parseInt(price.economyDelivery),
            expPrice: parseInt(price.expressDelivery),
            fastPrice: parseInt(price.fastDelivery),
            status: price.deleteStatus ? 'Ngừng áp dụng' : 'Đang áp dụng',

        });
    });

    let adServicesList = [];
    adServiceList.forEach(adService => {
        adServicesList.push({
            key: adService.advancedServiceId,
            code: adService.advancedServiceId,
            name: adService.aServiceName,
            basePrice: adService.price,
            status: adService.deleteStatus ? 'Ngừng áp dụng' : 'Đang áp dụng',
        });
    });


    const showAdServiceDetailModal = (record) => {
        console.log(record);
        let recordDetailAdService = {
            advancedServiceId: record.code,
            serviceName: record.name,
            price: record.basePrice,
            deleteStatus: record.status === "Đang áp dụng" ? false : true,
        }
        setRecordDetailAdService(recordDetailAdService);
        setIsAdServiceDetailModalVisible(true);
    };

    const handleAdServiceDetailOk = () => {
        setIsAdServiceDetailModalVisible(false);
        updateAdServices(recordDetailAdService);
        setRecordDetailAdService({...recordDetailAdService, deleteStatus: false});
    };

    const handleAdServiceDetailCancel = () => {
        setIsAdServiceDetailModalVisible(false);
    };
    const showDetailModal = (record) => {
        console.log(record);

        let recordDetail = {
            serviceId: record.code,
            transportMethod: record.method === "Đường hàng không" ? "Air" : "Road",
            weightRange: record.weight,
            economyDelivery: record.ecoPrice,
            expressDelivery: record.expPrice,
            fastDelivery: record.fastPrice,
            deleteStatus: record.status === "Đang áp dụng" ? false : true,
        }
        setRecordDetail(recordDetail);
        setIsDetailModalVisible(true);
        console.log(recordDetail);
    };

    const showAddModal = () => {
        setIsModalVisible(true);
    };


    const showAddAdServiceModal = () => {
        setIsAddAdServiceModalVisible(true);
    };


    const handleAddAdServiceOk = () => {
        setIsAddAdServiceModalVisible(false);
        addAdService(recordDetailAdService);
        setRecordDetailAdService({...recordDetailAdService, deleteStatus: false});
    };


    const addService = async (recordDetailService) => {
        try {
            const response = await api.post('/Service', recordDetailService);
            alert("Thêm thành công dịch vụ: " + recordDetailService.serviceId);
            console.log("Add service: ", recordDetailService.serviceId);
            fetchPriceList();
        } catch (error) {
            console.error("Error adding service: ", error.response.data);
        }
    };

    const addAdService = async () => {
        try {
            const newAdService = recordDetailAdService;
            const response = await api.post('/AdvancedService', {
                aServiceName: newAdService.serviceName,
                price: newAdService.price,
                
            });
            message.success('Thêm dịch vụ gia tăng thành công');
            console.log("Add ad service: ", newAdService.advancedServiceId);
            fetchAdServiceList();
        } catch (error) {
            console.error("Error adding ad service: ", error.response.data);
            message.error('Thêm dịch vụ thất bại');
        }
    };
    const handleAddAdServiceCancel = () => {
        setIsAddAdServiceModalVisible(false);
    };
    const handleOk = () => {
        setIsModalVisible(false);
        addService(recordDetail);
        setRecordDetail({...recordDetail, deleteStatus: false});

        // Handle form submission logic here
    };

    const updateServices = async (recordDetail) => {
        
        try {
            
            const response = await api.put(`/Service/${recordDetail.serviceId}`,recordDetail)
            alert("Cập nhật thành công mã dịch vụ: " + recordDetail.serviceId);
            console.log("Update service: ", recordDetail.serviceId);
            fetchPriceList();
        } catch (error) {
            console.error("Error updating service: ", error.response.data);
        }

    }

    const updateAdServices = async (recordDetail) => {
        try {
            const response = await api.put(`/AdvancedService/${recordDetail.advancedServiceId}`,recordDetail)
            alert("Cập nhật thành công mã dịch vụ gia tăng: " + recordDetail.advancedServiceId);
            console.log("Update service: ", recordDetail.advancedServiceId);
            fetchAdServiceList();
        } catch (error) {
            console.error("Error updating service: ", error.response.data);
        }
    }
    const handleDetailOk = async () => {
        setIsDetailModalVisible(false);
        updateServices(recordDetail);
        setRecordDetail({...recordDetail, deleteStatus: false});
        
    };

    const handleDetailCancel = () => {
        setIsDetailModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setIsDetailModalVisible(false);
    };

    return (
        <div>
            {isLoading && <Spin fullscreen size="large" />}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h1>Quản lý bảng giá</h1>
                
            </div>
            <div style={{ marginBottom: '20px' }}>
                <Select
                    style={{ width: 200, marginRight: '10px' }}
                    placeholder="Phương thức vận chuyển"
                    onChange={(value) => setFilterMethod(value)}
                >
                    <Option value="">Tất cả phương thức</Option>
                    <Option value="Đường bộ">Đường bộ</Option>
                    <Option value="Đường hàng không">Đường hàng không</Option>
                </Select>
                <Select
                    style={{ width: 200 }}
                    placeholder="Trạng thái"
                    onChange={(value) => setFilterStatus(value)}
                >
                    <Option value="">Tất cả trạng thái</Option>
                    <Option value="Đang áp dụng">Đang áp dụng</Option>
                    <Option value="Ngừng áp dụng">Ngừng áp dụng</Option>
                </Select>
            </div>

            <h2>Dịch vụ</h2>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <Button style={{width: '200px'}} type="primary" onClick={showAddModal}>Thêm bảng giá mới</Button>
            </div>
            <Table columns={[...columns, {
                title: 'Thao tác',
                key: 'action',
                render: (text, record) => (
                    <Button onClick={() => showDetailModal(record)}>Sửa</Button>
                ),
            }]} dataSource={serviceList} />
            <h2>Các dịch vụ gia tăng</h2>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                
                <Button style={{width: '200px'}} type="primary" onClick={showAddAdServiceModal}>Thêm dịch vụ gia tăng mới</Button>

                </div>
            
            <Table columns={[...columnsAdService,{ title: 'Thao tác',
                key: 'action',
                render: (text, record) => (
                    <Button onClick={() => showAdServiceDetailModal(record)}>Sửa</Button>
                ), 
            }]}dataSource={adServicesList} />
            <Modal
                title="Thêm dịch vụ mới"
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >

                <Form layout="vertical">
                    <Form.Item label="Mã bảng giá">
                        <Input placeholder="Nhập mã bảng giá" onChange={(e) => setRecordDetail({ ...recordDetail, serviceId: e.target.value })}/>
                    </Form.Item>
                    <Form.Item label="Phương thức vận chuyển">
                        <Select defaultValue={recordDetail.transportMethod} onChange={(value) => setRecordDetail({ ...recordDetail, transportMethod: value })}>
                            <Option value="Road">Đường bộ</Option>
                            <Option value="Air">Đường hàng không</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label="Giao hàng tiết kiệm (VND)">
                        <Input placeholder="Nhập giá cơ bản" onChange={(e) => setRecordDetail({ ...recordDetail, economyDelivery: e.target.value })}/>
                    </Form.Item>
                    <Form.Item label="Giao hàng nhanh (VND)">
                        <Input placeholder="Nhập giá cơ bản" onChange={(e) => setRecordDetail({ ...recordDetail, expressDelivery: e.target.value })}/>
                    </Form.Item>
                    <Form.Item label="Giao hàng hoả tốc (VND)">
                        <Input placeholder="Nhập giá cơ bản" onChange={(e) => setRecordDetail({ ...recordDetail, fastDelivery: e.target.value })}/>
                    </Form.Item>
                    <Form.Item label="Cân nặng (Kg)">
                        <Input placeholder="Nhập cân nặng" onChange={(e) => setRecordDetail({ ...recordDetail, weightRange: e.target.value })}/>
                    </Form.Item>
                    <Form.Item label="Trạng thái">
                        <Select>
                            <Option value={false}>Đang áp dụng</Option>
                            <Option value={true}>Ngừng áp dụng</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title="Chi tiết bảng giá"
                open={isDetailModalVisible}
                
                onOk={handleDetailOk}
                onCancel={handleDetailCancel}
            >
                <Form layout="vertical">
                    <Form.Item label="Mã dịch vụ">
                        <Input disabled value={recordDetail.serviceId} />
                    </Form.Item>
                    <Form.Item label="Phương thức vận chuyển">
                        <Select defaultValue={recordDetail.transportMethod} onChange={(value) => setRecordDetail({ ...recordDetail, transportMethod: value })} options={[{ value: 'Road', label: 'Đường bộ' }, { value: 'Air', label: 'Đường hàng không' }]} />
                    </Form.Item>
                    <Form.Item label="Cân nặng (Kg)">
                        <Input placeholder="Nhập cân nặng"
                            value={recordDetail.weightRange} 
                            onChange={(e) =>setRecordDetail({ ...recordDetail, weightRange: e.target.value })} // Update state on change
                        />
                    </Form.Item>
                    <Form.Item label="Giao hàng tiết kiệm (VND)">
                        <Input value={recordDetail.economyDelivery} onChange={(e) => setRecordDetail({ ...recordDetail, economyDelivery: e.target.value })} />
                    </Form.Item>
                    <Form.Item label="Giao hàng nhanh (VND)">
                        <Input value={recordDetail.expressDelivery} onChange={(e) => setRecordDetail({ ...recordDetail, expressDelivery: e.target.value })} />
                    </Form.Item>
                    <Form.Item label="Giao hàng hoả tốc (VND)">
                        <Input value={recordDetail.fastDelivery} onChange={(e) => setRecordDetail({ ...recordDetail, fastDelivery: e.target.value })} />
                    </Form.Item>
                    <Form.Item label="Trạng thái">
                        <Select defaultValue={recordDetail.deleteStatus} onChange={(value) => setRecordDetail({ ...recordDetail, deleteStatus: value })}>
                            <Option value={false}>Đang áp dụng</Option>
                            <Option value={true}>Ngừng áp dụng</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title="Chi tiết dịch vụ gia tăng"
                open={isAdServiceDetailModalVisible}
                
                onOk={handleAdServiceDetailOk}
                onCancel={handleAdServiceDetailCancel}
            >
                <Form layout="vertical">
                    <Form.Item label="Mã dịch vụ">
                        <Input disabled value={recordDetailAdService.advancedServiceId} />
                    </Form.Item>
                    <Form.Item label="Tên dịch vụ">
                        <Input  value={recordDetailAdService.serviceName} onChange={(e) => setRecordDetailAdService({ ...recordDetailAdService, serviceName: e.target.value })} />
                    </Form.Item>
                    <Form.Item label="Giá cơ bản (VND)">
                        <Input  value={recordDetailAdService.price} onChange={(e) => setRecordDetailAdService({ ...recordDetailAdService, price: e.target.value })} />
                    </Form.Item>
                    <Form.Item label="Trạng thái">
                        <Select defaultValue={recordDetailAdService.deleteStatus} onChange={(value) => setRecordDetailAdService({ ...recordDetailAdService, deleteStatus: value })}>
                            <Option value={false}>Đang áp dụng</Option>
                            <Option value={true}>Ngừng áp dụng</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title="Thêm dịch vụ gia tăng mới"
                open={isAddAdServiceModalVisible}
                onOk={handleAddAdServiceOk}
                onCancel={handleAddAdServiceCancel}
            >
                <Form layout="vertical">
                    
                    <Form.Item label="Tên dịch vụ">
                        <Input placeholder="Nhập tên dịch vụ" onChange={(e) => setRecordDetailAdService({ ...recordDetailAdService, serviceName: e.target.value })}/>
                    </Form.Item>
                    <Form.Item label="Giá cơ bản (VND)">
                        <Input placeholder="Nhập giá cơ bản" onChange={(e) => setRecordDetailAdService({ ...recordDetailAdService, price: e.target.value })}/>
                    </Form.Item>    
                </Form>
            </Modal>
            
        </div>
    );
};

export default PriceList;