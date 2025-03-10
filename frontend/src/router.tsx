import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from './layouts';
import Home from './components/Home/Home';
import Login from './components/Login/Login';
import Orders from './components/Orders/Orders';
import { ErrorPage } from './pages';

const router = createBrowserRouter([
  {
    path: '/', // Базовий маршрут
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> }, // Це рендерить Home за "/"
      { path: 'login', element: <Login /> },
      {
        path: 'orders',
        element: (
          <Orders
            role={'manager'}
            onLogout={function (): void {
              throw new Error('Function not implemented.');
            }}
            token={''}
            currentUserId={''}
          />
        ),
      },
      { path: '*', element: <ErrorPage /> },
    ],
  },
]);

export { router };
