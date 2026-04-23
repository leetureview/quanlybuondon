import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Drivers from './pages/Drivers';
import DriverForm from './pages/DriverForm';
import Finance from './pages/Finance';
import Revenue from './pages/Revenue';
import NightShift from './pages/NightShift';
import Advances from './pages/Advances';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import SettingsPage from './pages/SettingsPage';
import { initializeData } from './services/storage';
import { mockDrivers, mockDeposits, mockRevenues, mockAdvances, mockExpenses, mockNightShifts } from './data/mockData';

const ALL_ROLES = ['admin', 'user', 'investor'];
const STAFF_ROLES = ['admin', 'user'];

function AppRoutes() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        initializeData(mockDrivers, mockDeposits, mockRevenues, mockAdvances, mockExpenses, mockNightShifts)
            .catch(err => console.error('initializeData failed:', err))
            .finally(() => setReady(true));
    }, []);

    if (!ready) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', color: '#6b7280' }}>
                <span className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mr-3" />
                Đang tải dữ liệu...
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            }>
                <Route index element={<Dashboard />} />

                <Route path="drivers" element={
                    <ProtectedRoute roles={STAFF_ROLES}>
                        <Drivers />
                    </ProtectedRoute>
                } />
                <Route path="drivers/new" element={
                    <ProtectedRoute roles={['admin']}>
                        <DriverForm />
                    </ProtectedRoute>
                } />
                <Route path="drivers/edit/:id" element={
                    <ProtectedRoute roles={['admin']}>
                        <DriverForm />
                    </ProtectedRoute>
                } />

                <Route path="finance" element={
                    <ProtectedRoute roles={STAFF_ROLES}>
                        <Finance />
                    </ProtectedRoute>
                } />
                <Route path="revenue" element={
                    <ProtectedRoute roles={ALL_ROLES}>
                        <Revenue />
                    </ProtectedRoute>
                } />
                <Route path="night-shift" element={
                    <ProtectedRoute roles={STAFF_ROLES}>
                        <NightShift />
                    </ProtectedRoute>
                } />
                <Route path="advances" element={
                    <ProtectedRoute roles={STAFF_ROLES}>
                        <Advances />
                    </ProtectedRoute>
                } />
                <Route path="expenses" element={
                    <ProtectedRoute roles={STAFF_ROLES}>
                        <Expenses />
                    </ProtectedRoute>
                } />
                <Route path="reports" element={
                    <ProtectedRoute roles={ALL_ROLES}>
                        <Reports />
                    </ProtectedRoute>
                } />
                <Route path="settings" element={
                    <ProtectedRoute roles={['admin']}>
                        <SettingsPage />
                    </ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}

function App() {
    return (
        <HashRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </HashRouter>
    );
}

export default App;
