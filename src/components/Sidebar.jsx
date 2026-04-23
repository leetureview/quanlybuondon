import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, Users, Wallet, TrendingUp, Car,
    Menu, X, Moon, CreditCard, Receipt, BarChart2,
    Settings, LogOut,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth, ROLE_LABELS } from '../contexts/AuthContext';

const ALL_MENU_ITEMS = [
    { path: '/',             icon: LayoutDashboard, label: 'Dashboard',          roles: ['admin','user','investor'] },
    { path: '/drivers',      icon: Users,           label: 'Quản lý tài xế',     roles: ['admin','user'] },
    { path: '/night-shift',  icon: Moon,            label: 'Lịch trực đêm',      roles: ['admin','user'] },
    { path: '/finance',      icon: Wallet,          label: 'Tiền thế chân',      roles: ['admin','user'] },
    { path: '/revenue',      icon: TrendingUp,      label: 'Quản lý doanh thu',  roles: ['admin','user','investor'] },
    { path: '/advances',     icon: CreditCard,      label: 'Tạm ứng',            roles: ['admin','user'] },
    { path: '/expenses',     icon: Receipt,         label: 'Chi phí',            roles: ['admin','user'] },
    { path: '/reports',      icon: BarChart2,       label: 'Báo cáo',            roles: ['admin','user','investor'] },
    { path: '/settings',     icon: Settings,        label: 'Cài đặt',            roles: ['admin'] },
];

const ROLE_COLORS = {
    admin:    'bg-red-500/20 text-red-300',
    user:     'bg-blue-500/20 text-blue-300',
    investor: 'bg-green-500/20 text-green-300',
};

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const { user, role, logout } = useAuth();

    const visibleItems = ALL_MENU_ITEMS.filter(item => item.roles.includes(role));

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-sidebar-bg text-white rounded-lg shadow-lg"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {isOpen && (
                <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setIsOpen(false)} />
            )}

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
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {visibleItems.map((item) => (
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

                {/* User info + Logout */}
                <div className="p-4 border-t border-white/10 space-y-2">
                    <div className="px-4 py-3 bg-sidebar-hover rounded-xl">
                        <p className="text-sm font-medium truncate">{user?.name || user?.email}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[role] || ''}`}>
                            {ROLE_LABELS[role] || role}
                        </span>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-gray-400 hover:text-white hover:bg-sidebar-hover rounded-xl transition-colors text-sm"
                    >
                        <LogOut size={16} />
                        Đăng xuất
                    </button>
                </div>
            </aside>
        </>
    );
}
