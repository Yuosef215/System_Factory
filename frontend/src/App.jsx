import  { RouterProvider, createBrowserRouter  } from 'react-router-dom';
import IronFactoryLogin from './Auth/login';
import Home from './components/Home';
import Mechanical from './sections/mechanical';
import BallBearings from './subSections/BallBearings';
import Electrical from './sections/electrical';

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
    }
  ])

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
