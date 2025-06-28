'use client';

import { useAuth } from '../components/AuthProvider';
import LandingPage from '../components/LandingPage';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <LoadingSpinner />;
  }

  return <LandingPage />;
}