import { StoreProvider } from '../context/StoreContext';
import AdminPanel from './AdminPanel';
import ToastContainer from './ToastContainer';

export default function AdminApp() {
  return (
    <StoreProvider>
      <AdminPanel />
      <ToastContainer />
    </StoreProvider>
  );
}
