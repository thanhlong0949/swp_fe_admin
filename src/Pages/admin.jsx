import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Layout, Menu, Input, Select, Button, Table, Modal, Form, DatePicker, Checkbox } from 'antd';
import { 
  DashboardOutlined, TagsOutlined, UserOutlined, ShoppingCartOutlined, 
  CarOutlined, SettingOutlined, LogoutOutlined, GlobalOutlined 
} from '@ant-design/icons';
import AccountList from '../component/admin/accountlist';
import Overview from '../component/admin/overview';
import OrderList from '../component/admin/orderlist';
import Shipping from '../component/admin/shipping';
import { endAuthAdmin } from '../component/config/axios';
import PriceList from '../component/admin/pricelist';


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const { Header, Sider, Content } = Layout;
const { Search } = Input;
const { Option } = Select;

const Admin = () => {
    const [activeContent, setActiveContent] = useState('overview');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('');

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
                    <Search
                        placeholder="Tìm kiếm..."
                        style={{ width: 200, margin: '16px 24px' }}
                    />
                    <Select defaultValue="vi" style={{ width: 120, float: 'right', margin: '16px 24px' }}>
                        <Option value="vi"><GlobalOutlined /> Tiếng Việt</Option>
                        <Option value="en"><GlobalOutlined /> English</Option>
                    </Select>
                </Header>
                <Content style={{ margin: '24px 16px 0' }}>
                    <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
                        {renderContent()}
                    </div>
                </Content>
            </Layout>
            <Modal
                title={modalType === 'add' ? 'Thêm mới' : 'Chi tiết'}
                open={modalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
            >
                {/* Modal content based on modalType */}
            </Modal>
        </Layout>
    );
};

// ... Other component definitions (Overview, PriceList, AccountList, OrderList, Shipping)

export default Admin;