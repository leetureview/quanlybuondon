import { useState, useEffect } from 'react';
import { Plus, TrendingUp, Calendar, Trash2, Filter, Car, Gift, AlertTriangle, DollarSign } from 'lucide-react';
import { revenueService, driverService } from '../services/storage';
import { useAuth } from '../contexts/AuthContext';

export default function Revenue() {
    const [revenues, setRevenues] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        driverId: '',
        month: new Date().toISOString().slice(0, 7),
        amount: '',
        airportBonus: '',
        bonus: '',
        penalty: ''
    });
    const [deleteModal, setDeleteModal] = useState({ show: false, revenue: null });
    const { role } = useAuth();
    const isAdmin = role === 'admin';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setRevenues(revenueService.getAll());
        setDrivers(driverService.getAll());
    };

    const filteredRevenues = revenues
        .filter(r => r.month === selectedMonth)
        .map(r => {
            const driver = drivers.find(d => d.id === r.driverId);
            return {
                ...r,
                driverName: driver?.name || r.driverName || 'N/A',
                vehicleCode: driver?.vehicleCode || r.vehicleCode || 'N/A',
                avatar: driver?.avatar || ''
            };
        });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatMonth = (monthStr) => {
        const [year, month] = monthStr.split('-');
        return `Tháng ${parseInt(month)}/${year}`;
    };

    const totalMonthRevenue = filteredRevenues.reduce((sum, r) => sum + r.amount, 0);
    const totalAirportBonus = filteredRevenues.reduce((sum, r) => sum + (r.airportBonus || 0), 0);
    const totalBonus = filteredRevenues.reduce((sum, r) => sum + (r.bonus || 0), 0);
    const totalPenalty = filteredRevenues.reduce((sum, r) => sum + (r.penalty || 0), 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.driverId || !formData.amount) return;

        const driver = drivers.find(d => d.id === formData.driverId);
        const existing = revenueService.getByDriverAndMonth(formData.driverId, formData.month);

        const payload = {
            amount: parseInt(formData.amount) || 0,
            airportBonus: parseInt(formData.airportBonus) || 0,
            bonus: parseInt(formData.bonus) || 0,
            penalty: parseInt(formData.penalty) || 0,
        };

        if (existing) {
            revenueService.update(existing.id, payload);
        } else {
            revenueService.create({
                driverId: formData.driverId,
                driverName: driver?.name || '',
                vehicleCode: driver?.vehicleCode || '',
                month: formData.month,
                ...payload
            });
        }

        loadData();
        setShowAddModal(false);
        setFormData({ driverId: '', month: selectedMonth, amount: '', airportBonus: '', bonus: '', penalty: '' });
    };

    const handleOpenAdd = () => {
        setFormData({ driverId: '', month: selectedMonth, amount: '', airportBonus: '', bonus: '', penalty: '' });
        setShowAddModal(true);
    };

    const handleDelete = () => {
        if (deleteModal.revenue) {
            revenueService.delete(deleteModal.revenue.id);
            loadData();
            setDeleteModal({ show: false, revenue: null });
        }
    };

    const getMonthOptions = () => {
        const months = [];
        const now = new Date();
        for (let i = 0; i < 12; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push(date.toISOString().slice(0, 7));
        }
        return months;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý doanh thu</h1>
                    <p className="text-gray-500 mt-1">Nhập và theo dõi doanh thu theo tháng</p>
                </div>
                {isAdmin && (
                    <button onClick={handleOpenAdd} className="btn btn-primary">
                        <Plus size={20} /> Nhập doanh thu
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Filter className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-700">Lọc theo tháng</span>
                    </div>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="input-field"
                    >
                        {getMonthOptions().map(month => (
                            <option key={month} value={month}>
                                {formatMonth(month)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-5 shadow-lg lg:col-span-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-emerald-100 text-sm font-medium">
                                Tổng doanh thu {formatMonth(selectedMonth)}
                            </p>
                            <p className="text-3xl font-bold text-white mt-1">{formatCurrency(totalMonthRevenue)}</p>
                        </div>
                        <div className="p-4 bg-white/20 rounded-2xl">
                            <TrendingUp className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-3 gap-3 text-xs">
                        <div>
                            <p className="text-emerald-100">Bù sân bay</p>
                            <p className="font-semibold text-white mt-0.5">{formatCurrency(totalAirportBonus)}</p>
                        </div>
                        <div>
                            <p className="text-emerald-100">Thưởng</p>
                            <p className="font-semibold text-white mt-0.5">{formatCurrency(totalBonus)}</p>
                        </div>
                        <div>
                            <p className="text-emerald-100">Phạt</p>
                            <p className="font-semibold text-white mt-0.5">{formatCurrency(totalPenalty)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Chi tiết doanh thu</h2>
                    <p className="text-sm text-gray-500 mt-1">{formatMonth(selectedMonth)}</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tài xế</th>
                                <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã xe</th>
                                <th className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tháng</th>
                                <th className="text-right px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Doanh thu</th>
                                <th className="text-right px-4 py-4 text-xs font-semibold text-amber-600 uppercase tracking-wider">Bù sân bay</th>
                                <th className="text-right px-4 py-4 text-xs font-semibold text-emerald-600 uppercase tracking-wider">Thưởng</th>
                                <th className="text-right px-4 py-4 text-xs font-semibold text-red-600 uppercase tracking-wider">Phạt</th>
                                <th className="text-right px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredRevenues.length > 0 ? (
                                filteredRevenues.map((revenue) => (
                                    <tr key={revenue.id} className="table-row-hover">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={revenue.avatar}
                                                    alt={revenue.driverName}
                                                    className="w-10 h-10 rounded-full bg-gray-100"
                                                />
                                                <p className="font-medium text-gray-900">{revenue.driverName}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="font-semibold text-primary-600">{revenue.vehicleCode}</span>
                                        </td>
                                        <td className="px-4 py-4 text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} className="text-gray-400" />
                                                {formatMonth(revenue.month)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <span className="text-base font-bold text-emerald-600">
                                                {formatCurrency(revenue.amount)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right text-amber-600 font-medium">
                                            {revenue.airportBonus ? formatCurrency(revenue.airportBonus) : '—'}
                                        </td>
                                        <td className="px-4 py-4 text-right text-emerald-600 font-medium">
                                            {revenue.bonus ? formatCurrency(revenue.bonus) : '—'}
                                        </td>
                                        <td className="px-4 py-4 text-right text-red-600 font-medium">
                                            {revenue.penalty ? formatCurrency(revenue.penalty) : '—'}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            {isAdmin && (
                                                <button
                                                    onClick={() => setDeleteModal({ show: true, revenue })}
                                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                        Chưa có dữ liệu doanh thu cho {formatMonth(selectedMonth)}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 animate-slide-in my-8">
                        <h3 className="text-xl font-semibold text-gray-900">Nhập doanh thu</h3>
                        <p className="text-gray-500 mt-1 text-sm">Nhập doanh thu và thưởng/phạt cho xe</p>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                                    <Car size={16} className="text-gray-500" />
                                    Chọn xe <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.driverId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, driverId: e.target.value }))}
                                    className="input-field"
                                    required
                                >
                                    <option value="">-- Chọn xe --</option>
                                    {drivers.map(driver => (
                                        <option key={driver.id} value={driver.id}>
                                            {driver.vehicleCode} - {driver.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                                    <Calendar size={16} className="text-gray-500" />
                                    Tháng <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="month"
                                    value={formData.month}
                                    onChange={(e) => setFormData(prev => ({ ...prev, month: e.target.value }))}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                                    <DollarSign size={16} className="text-gray-500" />
                                    Doanh thu (VNĐ) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                    placeholder="15000000"
                                    className="input-field"
                                    min="0"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-amber-700 mb-2 flex items-center gap-1.5">
                                    <Car size={16} />
                                    Bù cuốc sân bay (VNĐ)
                                </label>
                                <input
                                    type="number"
                                    value={formData.airportBonus}
                                    onChange={(e) => setFormData(prev => ({ ...prev, airportBonus: e.target.value }))}
                                    placeholder="0"
                                    className="input-field bg-amber-50/50 border-amber-200 focus:border-amber-400"
                                    min="0"
                                />
                                <p className="text-xs text-gray-500 mt-1">Cộng thẳng vào lương thực trả của tài xế</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-emerald-700 mb-2 flex items-center gap-1.5">
                                        <Gift size={16} />
                                        Tiền thưởng
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.bonus}
                                        onChange={(e) => setFormData(prev => ({ ...prev, bonus: e.target.value }))}
                                        placeholder="0"
                                        className="input-field bg-emerald-50/50 border-emerald-200 focus:border-emerald-400"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-red-700 mb-2 flex items-center gap-1.5">
                                        <AlertTriangle size={16} />
                                        Tiền phạt
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.penalty}
                                        onChange={(e) => setFormData(prev => ({ ...prev, penalty: e.target.value }))}
                                        placeholder="0"
                                        className="input-field bg-red-50/50 border-red-200 focus:border-red-400"
                                        min="0"
                                    />
                                </div>
                            </div>

                            {(formData.amount || formData.airportBonus || formData.bonus || formData.penalty) && (
                                <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm space-y-1">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Doanh thu:</span>
                                        <span className="font-medium">{formatCurrency(parseInt(formData.amount) || 0)}</span>
                                    </div>
                                    {formData.airportBonus && (
                                        <div className="flex justify-between text-amber-700">
                                            <span>+ Bù sân bay:</span>
                                            <span className="font-medium">{formatCurrency(parseInt(formData.airportBonus) || 0)}</span>
                                        </div>
                                    )}
                                    {formData.bonus && (
                                        <div className="flex justify-between text-emerald-700">
                                            <span>+ Thưởng:</span>
                                            <span className="font-medium">{formatCurrency(parseInt(formData.bonus) || 0)}</span>
                                        </div>
                                    )}
                                    {formData.penalty && (
                                        <div className="flex justify-between text-red-700">
                                            <span>− Phạt:</span>
                                            <span className="font-medium">{formatCurrency(parseInt(formData.penalty) || 0)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between pt-1 border-t border-gray-200 font-semibold text-gray-900">
                                        <span>Phát sinh cho tài xế:</span>
                                        <span>{formatCurrency((parseInt(formData.airportBonus) || 0) + (parseInt(formData.bonus) || 0) - (parseInt(formData.penalty) || 0))}</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="btn btn-secondary flex-1"
                                >
                                    Hủy
                                </button>
                                <button type="submit" className="btn btn-primary flex-1">
                                    Lưu
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteModal.show && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-slide-in">
                        <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa</h3>
                        <p className="text-gray-500 mt-2">
                            Bạn có chắc chắn muốn xóa doanh thu của <strong>{deleteModal.revenue?.driverName}</strong> ({formatMonth(deleteModal.revenue?.month)})?
                        </p>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setDeleteModal({ show: false, revenue: null })}
                                className="btn btn-secondary flex-1"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDelete}
                                className="btn btn-danger flex-1"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
