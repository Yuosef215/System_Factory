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
    { path: "/rolls", element: <Rolls /> }
  ])

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
