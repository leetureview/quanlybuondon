import { useEffect, useState } from 'react';
import { Users, TrendingUp, Car, DollarSign } from 'lucide-react';
import { driverService, revenueService, depositService } from '../services/storage';

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalDrivers: 0,
        activeDrivers: 0,
        monthlyRevenue: 0,
        totalDeposits: 0
    });
    const [recentDrivers, setRecentDrivers] = useState([]);

    useEffect(() => {
        const drivers = driverService.getAll();
        const revenues = revenueService.getAll();
        const deposits = depositService.getAll();

        const currentMonth = new Date().toISOString().slice(0, 7);
        const monthlyRevenue = revenues
            .filter(r => r.month === currentMonth)
            .reduce((sum, r) => sum + r.amount, 0);

        const paidDeposits = deposits
            .filter(d => d.status === 'paid')
            .reduce((sum, d) => sum + d.paidAmount, 0);

        setStats({
            totalDrivers: drivers.length,
            activeDrivers: drivers.filter(d => d.status === 'active').length,
            monthlyRevenue,
            totalDeposits: paidDeposits
        });

        setRecentDrivers(drivers.slice(-5).reverse());
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const statCards = [
        {
            title: 'Tổng tài xế',
            value: stats.totalDrivers,
            subtitle: `${stats.activeDrivers} đang hoạt động`,
            icon: Users,
            color: 'bg-blue-500',
            bgLight: 'bg-blue-50'
        },
        {
            title: 'Doanh thu tháng',
            value: formatCurrency(stats.monthlyRevenue),
            subtitle: 'Tháng hiện tại',
            icon: TrendingUp,
            color: 'bg-emerald-500',
            bgLight: 'bg-emerald-50'
        },
        {
            title: 'Số xe hoạt động',
            value: stats.activeDrivers,
            subtitle: `/${stats.totalDrivers} tổng số xe`,
            icon: Car,
            color: 'bg-amber-500',
            bgLight: 'bg-amber-50'
        },
        {
            title: 'Tiền cọc đã thu',
            value: formatCurrency(stats.totalDeposits),
            subtitle: 'Tổng tiền thế chân',
            icon: DollarSign,
            color: 'bg-purple-500',
            bgLight: 'bg-purple-50'
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-1">Tổng quan hoạt động công ty taxi 123 GO</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                                <p className="text-sm text-gray-400 mt-1">{card.subtitle}</p>
                            </div>
                            <div className={`${card.bgLight} p-3 rounded-xl`}>
                                <card.icon className={`w-6 h-6 ${card.color.replace('bg-', 'text-')}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Tài xế mới nhất</h2>
                    <p className="text-sm text-gray-500 mt-1">Danh sách 5 tài xế đăng ký gần đây</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tài xế</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Biển số xe</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Loại xe</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentDrivers.length > 0 ? (
                                recentDrivers.map((driver) => (
                                    <tr key={driver.id} className="table-row-hover">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={driver.avatar}
                                                    alt={driver.name}
                                                    className="w-10 h-10 rounded-full bg-gray-100"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-900">{driver.name}</p>
                                                    <p className="text-sm text-gray-500">{driver.vehicleCode}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{driver.licensePlate}</td>
                                        <td className="px-6 py-4 text-gray-600">{driver.vehicleType}</td>
                                        <td className="px-6 py-4">
                                            <span className={`badge ${driver.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                                                {driver.status === 'active' ? 'Hoạt động' : 'Nghỉ'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                        Chưa có tài xế nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
