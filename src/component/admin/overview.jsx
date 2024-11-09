import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Button,  DatePicker, Typography, Spin } from 'antd';
import { Line } from 'react-chartjs-2';
import moment from 'moment';
import api from '../config/axios';
import dayjs from 'dayjs';
const Overview = () => {
    const { Text } = Typography;
    
    
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [chartData, setChartData] = useState([]);
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
    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/Dashboard/dashboard')
            setData(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }
    const fetchDataFilter = async (fromDate, toDate) => {
        try {
            const response = await api.get(`/Dashboard/dashboard?fromDate=${fromDate}&toDate=${toDate}`)
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    const fetchChart = async (year) => {
        setLoading(true);
        try {
            const response = await api.get(`/Dashboard/monthly-revenue/${year}`)
            setChartData(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching chart:', error);
        } finally {
            setLoading(false);
        }
    }
    const chartData2 = {
        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
        datasets: [{
            label: 'Doanh số',
            data: chartData?.map(item => item.revenue),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    }
   

    

    const handleFilter = () => {
        console.log(fromDate, toDate);
        if (fromDate && toDate) { 
            fetchDataFilter(fromDate, toDate);
        } else {
            fetchData();
        }
    }


    useEffect(() => {
        fetchData();
        fetchChart(moment().year());
    }, []);
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h1>Tổng quan</h1>

            </div>
            <Spin spinning={loading} tip="Đang tải dữ liệu..." fullscreen size="large"/>
            <Row style={{ marginBottom: '20px' }}>
                <Col span={3}>
                    <Text>Chọn khoảng thời gian</Text>
                </Col>
                <Col span={6}>
                    <RangePicker
                        format="DD/MM/YYYY"
                        placeholder={['Từ ngày', 'Đến ngày']}
                        getCalendarContainer={() => document.getElementById('calendar')}
                        disableDateBefore={fromDate}
                        onChange={(value) => {
                            if (value && value.length === 2) {
                                setFromDate(value[0].format('YYYY-MM-DD'));
                                setToDate(value[1].format('YYYY-MM-DD'));
                            } else {
                                setFromDate(null);
                                setToDate(null);
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
                        <Statistic title="Tổng số đơn hàng" value={data?.totalOrders} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="Doanh thu" value={data?.totalRevenue} suffix="VND" />
                    </Card>
                </Col>
                
                <Col span={6}>
                    <Card>
                        <Statistic title="Tỷ lệ hài lòng" value={data?.satisfactionRate.toFixed(2)} suffix="%" />
                    </Card>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={6}>
                    <Card>
                        <Statistic title="Số đơn đang chờ duyệt" value={data?.pendingOrders} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="Số đơn đang giao" value={data?.inTransitOrders} />
                    </Card>
                </Col>
            </Row>
            <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Text style={{ fontSize: '20px', fontWeight: 'bold' }}>Doanh số theo tháng của năm </Text>
                    <DatePicker picker="year" placeholder="Chọn năm" onChange={(value) => value ? fetchChart(parseInt(value.year())) : null} />
                </div>
                <Line data={chartData2} options={chartOptions} />
            </div>
            
        </div>
    );
};

export default Overview;