import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import PrivateRouteAdmin from './component/private-route/routeAdmin.jsx';
import LoginAdmin from './Pages/login.jsx';
import Admin from './Pages/admin.jsx';



function App() {

  const router = createBrowserRouter([
    {
      path: "/loginAdmin",
      element: <LoginAdmin />,
    },
    {
      path: "/admin",
      
      element: <PrivateRouteAdmin />,
      children: [
        { path: "", element: <Admin /> }, 
      ],
    },
    {
      path: "/", 
      element: <PrivateRouteAdmin />,
      children: [
        { path: "", element: <Admin /> }, 
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
