import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import PropertyList from './pages/PropertyList';
import AddProperty from './pages/AddProperty';
import MyListings from './pages/MyListings';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';
import AdminLogin from './pages/AdminLogin';
import { Navigate, useLocation } from 'react-router-dom';

const App = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gray-100">
      {!isAdminPage && <Navbar />}
      <Routes>
        <Route path="/" element={<PropertyList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/add-property" element={
          <ProtectedRoute>
            <AddProperty />
          </ProtectedRoute>
        } />
        <Route path="/my-listings" element={
          <ProtectedRoute>
            <MyListings />
          </ProtectedRoute>
        } />
        <Route path="/admin-dash" element={
          <StaffRoute>
            <AdminDashboard />
          </StaffRoute>
        } />
      </Routes>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const StaffRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.is_staff) {
    return <Navigate to="/admin-login" replace />;
  }
  return children;
};

export default App;
