import  { RouterProvider, createBrowserRouter  } from 'react-router-dom';
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


function App() {

  const router = createBrowserRouter([
    {
      path: "/",
      element: <IronFactoryLogin/>
    },
    {
      path: "/home",
      element: <Home/>
    },
    {
      path: "/mechanical",
      element: <Mechanical/>
    },
    {
      path: "/ballbearings",
      element: <BallBearings/>
    },
    {
      path: "/electrical",
      element: <Electrical/>
    },
    { 
      path: "/electrical/contactors", 
      element: <Contactors /> 
    },
    { path: "/create-user", element: <CreateUser /> },
    { path: "/users", element: <Users /> },
    { path: "/rolls", element: <Rolls /> },
    { path: "/purchases/requests", element: <PurchaseRequests /> },
    { path: "/purchases/offers", element: <PriceOffers /> },
    { path: "/purchases/orders",     element: <PurchaseOrders /> },
    { path: "/purchases/inspection", element: <Inspection /> },

  ])

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
