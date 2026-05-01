import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Lazy load pages for performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Verify = lazy(() => import('./pages/Verify'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const HealthCheck = lazy(() => import('./pages/HealthCheck'));
const Reports = lazy(() => import('./pages/Reports'));
const Analytics = lazy(() => import('./pages/Analytics'));
const NearbyCare = lazy(() => import('./pages/NearbyCare'));
const MedicineSearch = lazy(() => import('./pages/MedicineSearch'));
const DiseaseInfo = lazy(() => import('./pages/DiseaseInfo'));
const ProScan = lazy(() => import('./pages/ProScan'));
const Medications = lazy(() => import('./pages/Medications'));
const Appointments = lazy(() => import('./pages/Appointments'));
const Settings = lazy(() => import('./pages/Settings'));
const Journal = lazy(() => import('./pages/Journal'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Subscription = lazy(() => import('./pages/Subscription'));

const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-12 h-12 border-4 border-medical-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify" element={<Verify />} />
            
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/health-check" element={<HealthCheck />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/nearby-care" element={<NearbyCare />} />
              <Route path="/medicine-search" element={<MedicineSearch />} />
              <Route path="/disease-info" element={<DiseaseInfo />} />
              <Route path="/pro-scan" element={<ProScan />} />
              <Route path="/medications" element={<Medications />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
