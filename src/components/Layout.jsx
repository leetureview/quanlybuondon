import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell } from 'lucide-react';
import { useAuth, ROLE_LABELS } from '../contexts/AuthContext';

export default function Layout() {
    const { user, role } = useAuth();

    return (
        <div className="min-h-screen flex bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="lg:hidden w-10" />
                        <div className="hidden lg:block">
                            <h2 className="text-lg font-semibold text-gray-800">Hệ thống quản lý nội bộ</h2>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                <Bell size={20} />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                            </button>
                            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                                <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-sm">
                                    {(user?.name || user?.email || '?')[0].toUpperCase()}
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-sm font-medium text-gray-700">{user?.name || user?.email}</p>
                                    <p className="text-xs text-gray-500">{ROLE_LABELS[role] || role}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6 overflow-auto">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
