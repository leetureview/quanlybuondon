import { useState, useEffect } from 'react';
import { Plus, CreditCard, Clock, CheckCircle, Trash2, Edit2, X } from 'lucide-react';
import { advanceService, driverService } from '../services/storage';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${parseInt(d)}/${parseInt(m)}/${y}`;
};

const getMonthOptions = () => {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(date.toISOString().slice(0, 7));
    }
    return months;
};

const formatMonth = (m) => {
    const [y, mo] = m.split('-');
    return `Tháng ${parseInt(mo)}/${y}`;
};

export default function Advances() {
    const [advances, setAdvances] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ show: false, item: null });
    const [form, setForm] = useState({ driverId: '', date: new Date().toISOString().split('T')[0], amount: '', reason: '', note: '' });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const allAdvances = advanceService.getAll();
        const allDrivers = driverService.getAll();
        setDrivers(allDrivers);
        const merged = allAdvances.map(a => {
            const d = allDrivers.find(dr => dr.id === a.driverId);
            return { ...a, driverAvatar: d?.avatar || a.driverAvatar || '', driverName: d?.name || a.driverName };
        });
        setAdvances(merged);
    };

    const filtered = selectedMonth === 'all'
        ? advances
        : advances.filter(a => a.date && a.date.startsWith(selectedMonth));

    const totalAmount = filtered.reduce((s, a) => s + (a.amount || 0), 0);
    const pendingAmount = filtered.filter(a => a.status === 'pending').reduce((s, a) => s + (a.amount || 0), 0);
    const completedCount = filtered.filter(a => a.status === 'completed').length;

    const openAdd = () => {
        setEditItem(null);
        setForm({ driverId: '', date: new Date().toISOString().split('T')[0], amount: '', reason: '', note: '' });
        setErrors({});
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditItem(item);
        setForm({ driverId: item.driverId, date: item.date, amount: item.amount, reason: item.reason, note: item.note || '' });
        setErrors({});
        setShowModal(true);
    };

    const validate = () => {
        const e = {};
        if (!form.driverId) e.driverId = 'Chọn tài xế';
        if (!form.date) e.date = 'Chọn ngày';
        if (!form.amount || Number(form.amount) <= 0) e.amount = 'Nhập số tiền hợp lệ';
        if (!form.reason.trim()) e.reason = 'Nhập lý do';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;
        const driver = drivers.find(d => d.id === form.driverId);
        const data = {
            driverId: form.driverId,
            driverName: driver?.name || '',
            driverAvatar: driver?.avatar || '',
            date: form.date,
            amount: Number(form.amount),
            reason: form.reason,
            status: editItem?.status || 'pending',
            note: form.note
        };
        if (editItem) advanceService.update(editItem.id, data);
        else advanceService.create(data);
        loadData();
        setShowModal(false);
    };

    const toggleStatus = (item) => {
        const next = item.status === 'pending' ? 'completed' : 'pending';
        advanceService.update(item.id, { status: next });
        loadData();
    };

    const handleDelete = () => {
        if (deleteModal.item) {
            advanceService.delete(deleteModal.item.id);
            loadData();
            setDeleteModal({ show: false, item: null });
        }
    };

    const monthOptions = getMonthOptions();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tạm ứng tài xế</h1>
                    <p className="text-gray-500 mt-1">Quản lý các khoản tiền đã ứng cho tài xế</p>
                </div>
                <button onClick={openAdd} className="btn btn-primary">
                    <Plus size={20} /> Cho ứng tiền
                </button>
            </div>

            {/* Month filter + Stats */}
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Month tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-wrap items-center gap-2">
                    <span className="text-sm text-gray-500 mr-1 flex items-center gap-1"><Clock size={14} /> Chọn tháng</span>
                    <button
                        onClick={() => setSelectedMonth('all')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedMonth === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Tất cả
                    </button>
                    {monthOptions.slice(0, 3).map(m => (
                        <button
                            key={m}
                            onClick={() => setSelectedMonth(m)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedMonth === m ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {formatMonth(m)}
                        </button>
                    ))}
                </div>

                {/* Stats */}
                <div className="flex gap-4 flex-1">
                    <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock size={16} className="text-orange-500" />
                            <span className="text-sm text-orange-500 font-medium">Chưa hoàn</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{formatCurrency(pendingAmount)}</p>
                    </div>
                    <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <CreditCard size={16} className="text-blue-500" />
                            <span className="text-sm text-blue-500 font-medium">Tổng ứng</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
                    </div>
                    <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <CheckCircle size={16} className="text-emerald-500" />
                            <span className="text-sm text-emerald-500 font-medium">Đã hoàn</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{completedCount} khoản</p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tài xế</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Số tiền</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Lý do</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.length > 0 ? filtered.map(item => (
                                <tr key={item.id} className="table-row-hover">
                                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{formatDate(item.date)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={item.driverAvatar} alt={item.driverName} className="w-9 h-9 rounded-full bg-gray-100" />
                                            <span className="font-medium text-gray-900">{item.driverName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`font-semibold ${item.status === 'pending' ? 'text-orange-500' : 'text-emerald-600'}`}>
                                            {formatCurrency(item.amount)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{item.reason}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => toggleStatus(item)}
                                            className={`badge cursor-pointer transition-colors ${item.status === 'pending'
                                                ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                                                : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                                                } flex items-center gap-1`}
                                        >
                                            {item.status === 'pending'
                                                ? <><Clock size={13} /> Chưa hoàn</>
                                                : <><CheckCircle size={13} /> Đã hoàn</>
                                            }
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEdit(item)}
                                                className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                            ><Edit2 size={16} /></button>
                                            <button
                                                onClick={() => setDeleteModal({ show: true, item })}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            ><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-400">Chưa có khoản tạm ứng nào</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                    <p className="text-sm text-gray-500">Tổng <span className="font-medium">{filtered.length}</span> khoản</p>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-slide-in">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-semibold text-gray-900">{editItem ? 'Chỉnh sửa tạm ứng' : 'Cho ứng tiền'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tài xế <span className="text-red-500">*</span></label>
                                <select
                                    value={form.driverId}
                                    onChange={e => setForm(f => ({ ...f, driverId: e.target.value }))}
                                    className={`input-field ${errors.driverId ? 'border-red-400' : ''}`}
                                >
                                    <option value="">-- Chọn tài xế --</option>
                                    {drivers.map(d => <option key={d.id} value={d.id}>{d.name} - {d.vehicleCode}</option>)}
                                </select>
                                {errors.driverId && <p className="text-xs text-red-500 mt-1">{errors.driverId}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày <span className="text-red-500">*</span></label>
                                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={`input-field ${errors.date ? 'border-red-400' : ''}`} />
                                {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Số tiền (VNĐ) <span className="text-red-500">*</span></label>
                                <input type="number" min="0" placeholder="2000000" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className={`input-field ${errors.amount ? 'border-red-400' : ''}`} />
                                {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Lý do <span className="text-red-500">*</span></label>
                                <input type="text" placeholder="ca nhan, xăng xe..." value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} className={`input-field ${errors.reason ? 'border-red-400' : ''}`} />
                                {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ghi chú</label>
                                <textarea rows={2} placeholder="Ghi chú thêm..." value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} className="input-field resize-none" />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="btn btn-secondary flex-1">Hủy</button>
                            <button onClick={handleSave} className="btn btn-primary flex-1">{editItem ? 'Cập nhật' : 'Xác nhận ứng'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 animate-slide-in">
                        <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa</h3>
                        <p className="text-gray-500 mt-2 text-sm">
                            Xóa khoản tạm ứng <strong>{formatCurrency(deleteModal.item?.amount)}</strong> của <strong>{deleteModal.item?.driverName}</strong>?
                        </p>
                        <div className="flex gap-3 mt-5">
                            <button onClick={() => setDeleteModal({ show: false, item: null })} className="btn btn-secondary flex-1">Hủy</button>
                            <button onClick={handleDelete} className="btn btn-danger flex-1">Xóa</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
