import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Onboarding from './screens/Onboarding';
import Home from './screens/Home';
import Login from './screens/Login';
import SignUp from './screens/SignUp';
import Search from './screens/Search';
import Booking from './screens/Booking';
import Dashboard from './screens/Dashboard';
import Settings from './screens/Settings';
import Navigation from './screens/Navigation';
import LoadingScreen from './components/LoadingScreen';
import { AnimatePresence } from 'motion/react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/onboarding" />;
  
  return <>{children}</>;
}

export default function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    // Simulate initial app setup/loading
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <AnimatePresence>
        {isAppLoading && <LoadingScreen key="app-loader" />}
      </AnimatePresence>
      <Router>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
          <Route path="/booking/:id" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
          <Route path="/navigation/:id" element={<ProtectedRoute><Navigation /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
