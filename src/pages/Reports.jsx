import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, CreditCard, Users, Wallet, BarChart2 } from 'lucide-react';
import { driverService, revenueService, depositService, advanceService, expenseService } from '../services/storage';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const formatMonth = (m) => {
    const [y, mo] = m.split('-');
    return `T${parseInt(mo)}/${y}`;
};

const getLastMonths = (n) => {
    const months = [];
    const now = new Date();
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(d.toISOString().slice(0, 7));
    }
    return months;
};

const BAR_COLORS = { revenue: '#10b981', expense: '#ef4444', advance: '#f59e0b' };

function BarChart({ data, maxValue, color }) {
    return (
        <div className="flex items-end gap-1 h-32">
            {data.map((item, i) => {
                const pct = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-1.5 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            {formatCurrency(item.value)}
                        </div>
                        <div
                            className="w-full rounded-t transition-all duration-500"
                            style={{ height: `${Math.max(pct, 2)}%`, backgroundColor: color, opacity: 0.85 }}
                        />
                        <span className="text-xs text-gray-500">{item.label}</span>
                    </div>
                );
            })}
        </div>
    );
}

export default function Reports() {
    const [data, setData] = useState({ drivers: [], revenues: [], deposits: [], advances: [], expenses: [] });
    const months = getLastMonths(6);
    const currentMonth = new Date().toISOString().slice(0, 7);

    useEffect(() => {
        setData({
            drivers: driverService.getAll(),
            revenues: revenueService.getAll(),
            deposits: depositService.getAll(),
            advances: advanceService.getAll(),
            expenses: expenseService.getAll(),
        });
    }, []);

    // KPIs
    const currentRevenue = data.revenues.filter(r => r.month === currentMonth).reduce((s, r) => s + r.amount, 0);
    const currentExpense = data.expenses.filter(e => e.date?.startsWith(currentMonth)).reduce((s, e) => s + e.amount, 0);
    const currentAdvance = data.advances.filter(a => a.date?.startsWith(currentMonth)).reduce((s, a) => s + a.amount, 0);
    const pendingAdvance = data.advances.filter(a => a.status === 'pending').reduce((s, a) => s + a.amount, 0);
    const profit = currentRevenue - currentExpense - currentAdvance;

    const activeDrivers = data.drivers.filter(d => d.status === 'active').length;
    const depositPaid = data.deposits.filter(d => d.status === 'paid').length;
    const depositUnpaid = data.deposits.filter(d => d.status === 'unpaid').length;
    const totalDeposit = data.deposits.reduce((s, d) => s + d.paidAmount, 0);

    // Chart data
    const revenueChart = months.map(m => ({
        label: formatMonth(m),
        value: data.revenues.filter(r => r.month === m).reduce((s, r) => s + r.amount, 0)
    }));
    const expenseChart = months.map(m => ({
        label: formatMonth(m),
        value: data.expenses.filter(e => e.date?.startsWith(m)).reduce((s, e) => s + e.amount, 0)
    }));
    const advanceChart = months.map(m => ({
        label: formatMonth(m),
        value: data.advances.filter(a => a.date?.startsWith(m)).reduce((s, a) => s + a.amount, 0)
    }));

    const maxRevenue = Math.max(...revenueChart.map(d => d.value), 1);
    const maxExpense = Math.max(...expenseChart.map(d => d.value), 1);
    const maxAdvance = Math.max(...advanceChart.map(d => d.value), 1);

    // Top drivers by revenue this month
    const topDrivers = data.revenues
        .filter(r => r.month === currentMonth)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)
        .map(r => {
            const d = data.drivers.find(dr => dr.id === r.driverId);
            return { ...r, avatar: d?.avatar || '' };
        });

    // Expense by category this month
    const expByCategory = data.expenses
        .filter(e => e.date?.startsWith(currentMonth))
        .reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, {});

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Báo cáo tổng hợp</h1>
                <p className="text-gray-500 mt-1">Thống kê hoạt động và tài chính</p>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={18} className="text-emerald-500" />
                        <span className="text-sm text-gray-500">Doanh thu tháng</span>
                    </div>
                    <p className="text-xl font-bold text-emerald-600">{formatCurrency(currentRevenue)}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingDown size={18} className="text-red-500" />
                        <span className="text-sm text-gray-500">Chi phí tháng</span>
                    </div>
                    <p className="text-xl font-bold text-red-600">{formatCurrency(currentExpense)}</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                        <CreditCard size={18} className="text-amber-500" />
                        <span className="text-sm text-gray-500">Tạm ứng tháng</span>
                    </div>
                    <p className="text-xl font-bold text-amber-600">{formatCurrency(currentAdvance)}</p>
                    <p className="text-xs text-orange-500 mt-1">Chưa hoàn: {formatCurrency(pendingAdvance)}</p>
                </div>
                <div className={`rounded-xl p-5 shadow-sm border ${profit >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart2 size={18} className={profit >= 0 ? 'text-emerald-600' : 'text-red-600'} />
                        <span className="text-sm text-gray-500">Lợi nhuận ước tính</span>
                    </div>
                    <p className={`text-xl font-bold ${profit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{formatCurrency(profit)}</p>
                </div>
            </div>

            {/* Driver & Deposit stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-xl"><Users className="w-6 h-6 text-blue-600" /></div>
                    <div>
                        <p className="text-sm text-gray-500">Tài xế đang hoạt động</p>
                        <p className="text-2xl font-bold text-gray-900">{activeDrivers} <span className="text-sm font-normal text-gray-400">/ {data.drivers.length}</span></p>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-xl"><Wallet className="w-6 h-6 text-purple-600" /></div>
                    <div>
                        <p className="text-sm text-gray-500">Tiền thế chân đã thu</p>
                        <p className="text-xl font-bold text-purple-700">{formatCurrency(totalDeposit)}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 mb-2">Tình trạng thế chân</p>
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                            <span className="text-emerald-600">Đã đóng đủ</span>
                            <span className="font-semibold">{depositPaid} tài xế</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-amber-600">Đóng một phần</span>
                            <span className="font-semibold">{data.deposits.filter(d => d.status === 'partial').length} tài xế</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-red-600">Chưa đóng</span>
                            <span className="font-semibold">{depositUnpaid} tài xế</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-emerald-500" /> Doanh thu 6 tháng</h3>
                    <BarChart data={revenueChart} maxValue={maxRevenue} color={BAR_COLORS.revenue} />
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><TrendingDown size={16} className="text-red-500" /> Chi phí 6 tháng</h3>
                    <BarChart data={expenseChart} maxValue={maxExpense} color={BAR_COLORS.expense} />
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><CreditCard size={16} className="text-amber-500" /> Tạm ứng 6 tháng</h3>
                    <BarChart data={advanceChart} maxValue={maxAdvance} color={BAR_COLORS.advance} />
                </div>
            </div>

            {/* Top drivers + expense breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Top drivers */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Top tài xế doanh thu tháng này</h3>
                    {topDrivers.length > 0 ? (
                        <div className="space-y-3">
                            {topDrivers.map((d, i) => {
                                const pct = (d.amount / topDrivers[0].amount) * 100;
                                return (
                                    <div key={d.id}>
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>{i + 1}</span>
                                                <img src={d.avatar} alt={d.driverName} className="w-6 h-6 rounded-full" />
                                                <span className="text-sm font-medium text-gray-800">{d.driverName}</span>
                                            </div>
                                            <span className="text-sm font-bold text-emerald-600">{formatCurrency(d.amount)}</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : <p className="text-gray-400 text-sm text-center py-6">Chưa có dữ liệu tháng này</p>}
                </div>

                {/* Expense by category */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Chi phí theo danh mục tháng này</h3>
                    {Object.keys(expByCategory).length > 0 ? (
                        <div className="space-y-3">
                            {Object.entries(expByCategory).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => {
                                const pct = (amt / Math.max(...Object.values(expByCategory))) * 100;
                                return (
                                    <div key={cat}>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-gray-700">{cat}</span>
                                            <span className="text-sm font-bold text-red-500">{formatCurrency(amt)}</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-red-400 rounded-full" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : <p className="text-gray-400 text-sm text-center py-6">Chưa có chi phí tháng này</p>}
                </div>
            </div>
        </div>
    );
}
