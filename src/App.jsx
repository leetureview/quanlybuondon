import { HashRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
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

function App() {
    useEffect(() => {
        initializeData(mockDrivers, mockDeposits, mockRevenues, mockAdvances, mockExpenses, mockNightShifts);
    }, []);

    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="drivers" element={<Drivers />} />
                    <Route path="drivers/new" element={<DriverForm />} />
                    <Route path="drivers/edit/:id" element={<DriverForm />} />
                    <Route path="finance" element={<Finance />} />
                    <Route path="revenue" element={<Revenue />} />
                    <Route path="night-shift" element={<NightShift />} />
                    <Route path="advances" element={<Advances />} />
                    <Route path="expenses" element={<Expenses />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="settings" element={<SettingsPage />} />
                </Route>
            </Routes>
        </HashRouter>
    );
}

export default App;
