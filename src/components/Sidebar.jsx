import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Wallet,
    TrendingUp,
    Car,
    Menu,
    X,
    Moon,
    CreditCard,
    Receipt,
    BarChart2,
    Settings
} from 'lucide-react';
import { useState } from 'react';

const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/drivers', icon: Users, label: 'Quản lý tài xế' },
    { path: '/night-shift', icon: Moon, label: 'Lịch trực đêm' },
    { path: '/finance', icon: Wallet, label: 'Tiền thế chân' },
    { path: '/revenue', icon: TrendingUp, label: 'Quản lý doanh thu' },
    { path: '/advances', icon: CreditCard, label: 'Tạm ứng' },
    { path: '/expenses', icon: Receipt, label: 'Chi phí' },
    { path: '/reports', icon: BarChart2, label: 'Báo cáo' },
    { path: '/settings', icon: Settings, label: 'Cài đặt' },
];

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-sidebar-bg text-white rounded-lg shadow-lg"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-sidebar-bg text-white
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
                {/* Logo */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                            <Car size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">123 GO</h1>
                            <p className="text-xs text-gray-400">Taxi Management</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200
                ${isActive
                                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                                    : 'text-gray-300 hover:bg-sidebar-hover hover:text-white'
                                }
              `}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-white/10">
                    <div className="px-4 py-3 bg-sidebar-hover rounded-xl">
                        <p className="text-xs text-gray-400">Phiên bản</p>
                        <p className="text-sm font-medium">v1.0.0</p>
                    </div>
                </div>
            </aside>
        </>
    );
}
