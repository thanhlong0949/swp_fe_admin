import { useNavigate, Outlet } from 'react-router-dom';
import { useEffect } from 'react';

const PrivateRouteAdmin = () => {
    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/loginAdmin');
        }
    }, [navigate]);
    return <Outlet />;
};

export default PrivateRouteAdmin;
