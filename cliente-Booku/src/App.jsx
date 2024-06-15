import './App.css'
import {
  createBrowserRouter,
  RouterProvider, Outlet
} from "react-router-dom";


import Static from './components/Static/Static'
import Landing from './components/Landing/Landing'
import AuthMiddle from './utils/Middleware/AuthMiddle';
import Login from './components/Login/Login'
import Error from './components/Error/Error';
import Prueba from './components/Prueba/Prueba';
import Registro from './components/Registro/Registro';
import Home from './components/Home/Home';
import Game from './components/Game/Game';
import Retos from './components/Retos/Retos';
import Detalle from './components/Detalle/Detalle';
import Examen from './components/Examen/Examen';
import Admin from './components/Admin/Admin';
import Loading from './components/Loading/Loading';
import PermissionMiddle from './utils/Middleware/PermissionMiddle';
import GrupoMiddle from './utils/Middleware/GrupoMiddle';
import ExamenMiddle from './utils/Middleware/ExamenMiddle';
import AdminExamenMiddle from './utils/Middleware/AdminExamenMiddle';
import Buscador from './components/Buscador/Buscador';
import Cookie from './components/Cookie/Cookie';
import About from './components/About/About';
import Contact from './components/Contact/Contact';


function App() {
  const router = createBrowserRouter([
    {
      element: (
        <>
          <Static></Static>
          <main id="main">
            <Outlet></Outlet>
          </main>
        </>
      ),
      children:[
        {
          path: "/",
          element: <Landing></Landing>
        },
        {
          path: "/sobre-nosotros",
          element: <About></About>
        },
        {
          path: "/cookies",
          element: <Cookie></Cookie>
        },
        {
          path: "/contacto",
          element: <Contact></Contact>
        },
        {
          path: "/prueba",
          element: <Loading></Loading>
        },
        {
          path: "/buscador",
          element: <AuthMiddle Component={Buscador}></AuthMiddle>
        },
        {
          path: "/detalle/:check/:id",
          element: <GrupoMiddle Component={Detalle}></GrupoMiddle>
        },
        {
          path: "/examen/:id",
          element: <ExamenMiddle Component={Examen}></ExamenMiddle>
        },
        {
          path: "/examen/:id/:check",
          element: <AuthMiddle Component={Examen}></AuthMiddle>
        },
        {
          path: "/home",
          element: <AuthMiddle Component={Home}></AuthMiddle>
        },
        {
          path: "/play",
          element: <AuthMiddle Component={Game}></AuthMiddle>
        },
        {
          path: "/retos",
          element: <AuthMiddle Component={Retos}></AuthMiddle>
        },
        {
          path: "/admin",
          element: <PermissionMiddle Component={Admin}></PermissionMiddle>
        },
        {
          path: "*",
          element:
            <Error></Error>
        }
      ]
    },
    {
      path: "/inicio-sesion",
      element: <Login></Login>
    },
    {
      path: "/registro",
      element: <Registro></Registro>
    },
    
  ]);

  return (
    <>
      
        <RouterProvider router={router} /> 
      
    </>
  )
}

export default App
