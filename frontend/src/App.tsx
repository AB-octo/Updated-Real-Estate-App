import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import PropertyList from './pages/PropertyList';
import AddProperty from './pages/AddProperty';
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Routes>
        <Route path="/" element={<PropertyList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/add-property" element={
          <ProtectedRoute>
            <AddProperty />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    // For better UX, redirect to login, but for now just return nothing or access denied
    return <div className="p-8 text-center text-red-600">Please log in to view this page.</div>
  }
  return children;
};

export default App;
