import { createBrowserRouter } from 'react-router-dom';
import Index from '@/pages/index';
import Invoices from '@/pages/invoices';
import Customers from '@/pages/customers';
import Payments from '@/pages/payments';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Index />,
  },
  {
    path: '/invoices',
    element: <Invoices />,
  },
  {
    path: '/customers',
    element: <Customers />,
  },
  {
    path: '/payments',
    element: <Payments />,
  },
]);

export default router;
