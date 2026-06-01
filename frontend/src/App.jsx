import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import IronFactoryLogin from './Auth/login';
import Home from './components/Home';
import Mechanical from './sections/mechanical';
import BallBearings from './subSections/BallBearings';
import Electrical from './sections/electrical';
import Contactors from './subSections/Contactors';
import CreateUser from './Auth/CreateUser';
import Users from './pages/Users';
import Rolls from './subSections/Rolls'
import PurchaseRequests from './pages/purchases/PurchaseRequests';
import PriceOffers from './pages/purchases/PriceOffers';
import PurchaseOrders from './pages/purchases/PurchaseOrders';
import Inspection from './pages/purchases/Inspection'
import Chat from "./pages/Chat/Chat";
import HR from "./pages/HR/HR";
import Employees from "./pages/HR/Employees";
import Attendance from "./pages/HR/Attendance";
import Leaves from "./pages/HR/Leaves";
import Salary from "./pages/HR/Salary";
import Cables from "./pages/Electric/Cables";
import ActivityLog from "./pages/ActivityLog/ActivityLog";


function App() {

  const router = createBrowserRouter([
    { path: "/", element: <IronFactoryLogin /> },
    { path: "/home", element: <Home /> },
    { path: "/mechanical", element: <Mechanical /> },
    { path: "/ballbearings", element: <BallBearings /> },
    { path: "/electrical", element: <Electrical /> },
    { path: "/electrical/contactors", element: <Contactors /> },
    { path: "/create-user", element: <CreateUser /> },
    { path: "/users", element: <Users /> },
    { path: "/rolls", element: <Rolls /> },
    { path: "/purchases/requests", element: <PurchaseRequests /> },
    { path: "/purchases/offers", element: <PriceOffers /> },
    { path: "/purchases/orders", element: <PurchaseOrders /> },
    { path: "/purchases/inspection", element: <Inspection /> },
    { path: "/chat", element: <Chat /> },
    { path: "/hr", element: <HR /> },
    { path: "/hr/employees", element: <Employees /> },
    { path: "/hr/attendance", element: <Attendance /> },
    { path: "/hr/leaves", element: <Leaves /> },
    { path: "/hr/salary", element: <Salary /> },
    { path: "/electrical/cables", element: <Cables /> },
    { path: "/activity-log", element: <ActivityLog /> }

  ])

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
