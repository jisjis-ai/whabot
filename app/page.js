'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import LandingPage from '../components/LandingPage';
import Dashboard from '../components/Dashboard';
import AdminPanel from '../components/AdminPanel';
import { isAdmin } from '../lib/auth';

export default function Home() {
  const { user, userData, loading } = useAuth();
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    if (user && userData) {
      setShowAdmin(isAdmin(user.email));
    }
  }, [user, userData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando WhatsApp Pro...</p>
        </div>
      </div>
    );
  }

  // Se não está logado, mostrar landing page
  if (!user) {
    return <LandingPage />;
  }

  // Se é admin, mostrar painel admin
  if (showAdmin) {
    return <AdminPanel />;
  }

  // Usuário normal, mostrar dashboard
  return <Dashboard />;
}