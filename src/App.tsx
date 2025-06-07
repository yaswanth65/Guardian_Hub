
import React, { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import AdminLogin from './components/auth/AdminLogin';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';

const queryClient = new QueryClient();

const AppContent = () => {
  const { currentUser } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'admin'>('login');
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
  };

  const handleAdminClick = () => {
    setAuthMode('admin');
  };

  const handleBackToLogin = () => {
    setAuthMode('login');
  };

  const handleAdminLogin = () => {
    setIsAdmin(true);
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setAuthMode('login');
  };

  // If admin is logged in, show admin dashboard
  if (isAdmin) {
    return <AdminDashboard onLogout={handleAdminLogout} />;
  }

  // If regular user is logged in, show user dashboard
  if (currentUser) {
    return <Dashboard />;
  }

  // Show appropriate auth form
  if (authMode === 'admin') {
    return <AdminLogin onBackClick={handleBackToLogin} onAdminLogin={handleAdminLogin} />;
  }

  if (authMode === 'signup') {
    return <Signup onToggleMode={toggleAuthMode} />;
  }

  return <Login onToggleMode={toggleAuthMode} onAdminClick={handleAdminClick} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
