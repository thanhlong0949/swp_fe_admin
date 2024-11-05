import React, { useState } from 'react';
import { Row, Col, Card, Statistic, Button, Modal, Form, Input, DatePicker, Typography } from 'antd';   
import { Line } from 'react-chartjs-2';
import moment from 'moment';
const Overview = ({}) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const { Text } = Typography;
    const chartData = {
        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
        datasets: [{
            label: 'Doanh số',
            data: [30, 40, 35, 50, 49, 60, 70, 91, 125, 100, 120, 150],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    };
    const { RangePicker } = DatePicker;
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const chartOptions = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = () => {
        setIsModalVisible(false);
        // Handle form submission logic here
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleFilter = () => {
        console.log(fromDate, toDate);
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h1>Tổng quan</h1>
               
            </div>
            <Row style={{marginBottom: '20px'}}>
                <Col span={3}>
                <Text>Chọn khoảng thời gian</Text>
                </Col>
                <Col span={3}>
                    <RangePicker
                        format="DD/MM/YYYY"
                        onChange={(value) => {
                            if (value) {
                                setFromDate(moment(value[0]).format('DD/MM/YYYY'));
                                setToDate(moment(value[1]).format('DD/MM/YYYY'));
                            }
                        }} />
                </Col>
                
                
                
                <Col span={2} push={1}>
                    <Button type="primary" onClick={handleFilter}>Lọc</Button>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={6}>
                    <Card>
                        <Statistic title="Tổng số đơn hàng" value={1289} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="Doanh thu" value={235000000} suffix="VND" />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="Khách hàng mới" value={45} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="Tỷ lệ hài lòng" value={95} suffix="%" />
                    </Card>
                </Col>
            </Row>
            <div style={{ marginTop: '20px' }}>
                <Line data={chartData} options={chartOptions} />
            </div>
            <Modal
                title="Thêm mục mới"
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form layout="vertical">
                    <Form.Item label="Tên mục">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Giá trị">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Overview;