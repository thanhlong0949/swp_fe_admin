import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Layout, Menu, Dropdown, Badge, notification, Typography, Image } from 'antd';
import {
    DashboardOutlined, TagsOutlined, UserOutlined, ShoppingCartOutlined,
    CarOutlined, SettingOutlined, LogoutOutlined, BellOutlined,
} from '@ant-design/icons';
import AccountList from '../component/admin/accountlist';
import Overview from '../component/admin/overview';
import OrderList from '../component/admin/orderlist';
import Shipping from '../component/admin/shipping';
import api, { endAuthAdmin } from '../component/config/axios';
import PriceList from '../component/admin/pricelist';
import signalrservice from '../component/signalR/signalrservice';
import moment from 'moment';
import ChangePassword from '../component/admin/change-pass';
import './admin.css';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const Admin = () => {

    const [unread, setUnread] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const user = JSON.parse(localStorage.getItem('user'));
    const [activeContent, setActiveContent] = useState(user?.role === 'Manager' ? 'overview' : 'order-list');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('');
    const NOTIFICATION_LIMIT = 5; // Limit for notifications
    const DROPDOWN_MAX_HEIGHT = 300; // Maximum height for the dropdown
    // ... other state variables and functions

    const menuItems = [
        { key: 'overview', icon: <DashboardOutlined />, label: 'Tổng quan' },
        { key: 'price-list', icon: <TagsOutlined />, label: 'Bảng giá dịch vụ' },
        { key: 'account-list', icon: <UserOutlined />, label: 'Tài Khoản' },
        { key: 'order-list', icon: <ShoppingCartOutlined />, label: 'Đơn hàng' },
        { key: 'shipping', icon: <CarOutlined />, label: 'Vận chuyển' },
        { key: 'settings', icon: <SettingOutlined />, label: 'Cài đặt' },
        { key: 'logout', icon: <LogoutOutlined />, label: 'Thoát' },
    ];

    const handleReadNotification = async (key) => {
        try {
            const response = await api.put(`/Notification/${key}`, {
                isRead: true
            });
            console.log(response.status);
            fetchNotification();
        } catch (error) {
            console.log(error);
        }
    }
    const handleMenuClick = (key) => {
        setActiveContent(key);
    };

    const showModal = (type) => {
        setModalType(type);
        setModalVisible(true);
    };

    const handleModalOk = () => {
        // Handle modal submission
        setModalVisible(false);
    };

    const handleModalCancel = () => {
        setModalVisible(false);
    };

    // ... other helper functions

    const fetchNotification = async () => {
        try {
            const response = await api.get(`/Notification?customerId=0`);
            setNotifications(response.data);
            console.log('response', response.data);
            setUnread(response.data.filter(item => !item.isRead).length);
            console.log('unread', response.data.filter(item => !item.isRead).length);

        } catch (error) {
            console.log(error);
        }
    }
    let listNotification = [];
    notifications.forEach(item => {
        listNotification.push({
            key: item.notificationId,
            message: item.message,
            createdDate: item.createdDate,
            isRead: item.isRead,
        });
    });


    const startSignalR = async () => {
        const connectionState = signalrservice.connection.state;
        if (connectionState === 'Disconnected') {
            await signalrservice.start();
            signalrservice.onOrderDetailCreated((message) => {
                fetchNotification();
                console.log('2');
                notification.open({
                    message: 'Thông báo',
                    description: message.includes('-') ? `Đơn hàng ${message.split('-')[1]} đã được ${message.split('-')[2] === 'Canceled' ? 'hủy' : 'hoàn thành'}` : message,
                    showProgress: true,
                    pauseOnHover: true,
                });
            });
        }
    };
    useEffect(() => {
        fetchNotification();
        startSignalR();
    }, []);
    const renderContent = () => {
        switch (activeContent) {
            case 'overview':
                return <Overview showModal={showModal} />;
            case 'price-list':
                return <PriceList showModal={showModal} />;
            case 'account-list':
                return <AccountList showModal={showModal} />;
            case 'order-list':
                return <OrderList showModal={showModal} />;
            case 'shipping':
                return <Shipping showModal={showModal} />;
            case 'settings':
                return <ChangePassword />;
            case 'logout':
                localStorage.removeItem('user');
                return endAuthAdmin();
            default:
                return <div>Content not available</div>;
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider width={180} theme="light">
                <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: 10, height: 32, width: 200, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} >
                    <Image width={50} height={45} src="/assets/logo.jpg" alt="Koi Shipping Logo" className="header-logo" />
                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Koi Shipping</Text>
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={[activeContent]}
                    style={{ height: '100%', borderRight: 0 }}
                    items={user?.role === 'Manager' ? menuItems : menuItems.filter(item => (item.key !== 'overview' && item.key !== 'price-list' && item.key !== 'account-list'))}
                    onClick={({ key }) => handleMenuClick(key)}
                />
            </Sider>
            <Layout>
                <Header style={{ background: '#fff', padding: 0, opacity: 0.9 }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 20, marginRight: 20 }}>

                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <UserOutlined style={{ fontSize: '30px', marginRight: '10px' }} />
                            <Text style={{ margin: '16px 24px' }}>{user?.name}</Text>
                        </div>
                        <Dropdown
                            placement="bottomRight"
                            menu={{
                                items: listNotification.map(item => ({
                                    style: {
                                        backgroundColor: item.isRead ? 'white' : '#D3D3D3',
                                    },
                                    key: item.key,
                                    label: (
                                        item.message.includes('-') ? (
                                            <div>
                                                <p>Lúc {moment(item.createdDate).format('HH:mm DD/MM/YYYY')}</p>
                                                <p>Đơn hàng {item.message.split('-')[1]} đã được {item.message.split('-')[2] === 'Canceled' ? 'hủy' : 'hoàn thành'}</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p>Lúc {moment(item.createdDate).format('HH:mm DD/MM/YYYY')}</p>
                                                <p>{item.message}</p>
                                            </div>
                                        )
                                    ),
                                    onClick: () => {
                                        setActiveContent('order-list');
                                        handleReadNotification(item.key);

                                    }
                                })),
                                trigger: ['hover'],

                            }}

                        >
                            <Badge count={unread}>
                                <BellOutlined style={{ fontSize: '30px' }} />
                            </Badge>
                        </Dropdown>



                    </div>
                </Header>
                <Content style={{ margin: '24px 16px 0' }}>
                    <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
                        {renderContent()}
                    </div>
                </Content>
            </Layout>



        </Layout>
    );
};



export default Admin;