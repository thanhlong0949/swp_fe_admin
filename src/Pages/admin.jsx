import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Layout, Menu, Dropdown, Badge, notification, Typography } from 'antd';
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
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const Admin = () => {

    const [unread, setUnread] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [activeContent, setActiveContent] = useState('overview');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('');
    const NOTIFICATION_LIMIT = 5; // Limit for notifications
    const DROPDOWN_MAX_HEIGHT = 300; // Maximum height for the dropdown
    // ... other state variables and functions
    const user = JSON.parse(localStorage.getItem('user'));
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
            const response = await api.put(`/Notification/${key}`,{
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
            setUnread(response.data.filter(item => !item.isRead).length);

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
    useEffect(() => {
        fetchNotification();
        startSignalR();
    }, []);

    const startSignalR = async () => {
        const connectionState = signalrservice.connection.state;
        if (connectionState === 'Connected') {
            signalrservice.onOrderDetailCreated((message) => {
                fetchNotification();
              
                notification.open({
                    message: 'Thông báo',
                    description: message,
                    showProgress: true,
                    pauseOnHover: true,
                });
            });
        } else if (connectionState === 'Disconnected') {
            await signalrservice.start();
            signalrservice.onOrderDetailCreated((message) => {
                fetchNotification();
              
                notification.open({
                    message: 'Thông báo',
                    description: message,
                    showProgress: true,
                    pauseOnHover: true,
                });
            });
            
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
            signalrservice.onOrderDetailCreated((message) => {
                fetchNotification();
                
                
                notification.open({
                    message: 'Thông báo',
                    description: message,
                    showProgress: true,
                    pauseOnHover: true,
                });
            });
        } else if (connectionState === 'Connecting') {
            console.warn('SignalR connection is currently connecting. Please wait...');
        } else {
            console.warn('SignalR connection is in an unexpected state:', connectionState);
        }
    };

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
                return endAuthAdmin();
            default:
                return <div>Content not available</div>;
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider width={200} theme="light">
                <div className="logo" style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
                <Menu
                    mode="inline"
                    defaultSelectedKeys={['overview']}
                    style={{ height: '100%', borderRight: 0 }}
                    items={menuItems}
                    onClick={({ key }) => handleMenuClick(key)}
                />
            </Sider>
            <Layout>
                <Header style={{ background: '#fff', padding: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <Dropdown
                            placement="bottomRight"
                            overlayStyle={{ maxHeight: DROPDOWN_MAX_HEIGHT, overflow: 'auto' }}
                            menu={{
                                
                                items: listNotification.map(item => ({
                                    style: {
                                        backgroundColor: item.isRead ? '#fff' : '#f5f5f5',
                                    },
                                    key: item.key,
                                    label: (
                                        <div>
                                            <p>Lúc {moment(item.createdDate).format('HH:mm DD/MM/YYYY')}</p>
                                            <p>{item.message}</p>
                                        </div>
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
                        {user && <Text style={{ margin: '16px 24px' }}>{user?.staffName}</Text>}
                        

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