import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import CreateOrder from './pages/CreateOrder';
import OrderDetail from './pages/OrderDetail';
import DesignerDashboard from './pages/DesignerDashboard';
import Chat from './pages/Chat';

function AppLayout({ children, showNav = true }) {
  return (
    <>
      {showNav && <Navbar />}
      <main>{children}</main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <SocketProvider>
          <Routes>
            <Route path="/" element={<AppLayout><Landing /></AppLayout>} />
            <Route path="/login" element={<AppLayout><Login /></AppLayout>} />
            <Route path="/register" element={<AppLayout><Register /></AppLayout>} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute role="customer">
                  <AppLayout><CustomerDashboard /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/new"
              element={
                <ProtectedRoute role="customer">
                  <AppLayout><CreateOrder /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <AppLayout><OrderDetail /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/designer"
              element={
                <ProtectedRoute role="designer">
                  <AppLayout><DesignerDashboard /></AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <AppLayout><Chat /></AppLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </SocketProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
