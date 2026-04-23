import { useState, useEffect } from 'react';
import { Plus, Receipt, Trash2, Edit2, X, Filter, TrendingDown } from 'lucide-react';
import { expenseService } from '../services/storage';
import { expenseCategories } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';

const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${parseInt(d)}/${parseInt(m)}/${y}`;
};

const formatMonth = (m) => {
    const [y, mo] = m.split('-');
    return `Tháng ${parseInt(mo)}/${y}`;
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

const CATEGORY_COLORS = {
    'Xăng dầu': 'bg-amber-100 text-amber-700',
    'Bảo dưỡng': 'bg-blue-100 text-blue-700',
    'Bảo hiểm': 'bg-purple-100 text-purple-700',
    'Văn phòng phẩm': 'bg-teal-100 text-teal-700',
    'Lương nhân viên': 'bg-indigo-100 text-indigo-700',
    'Khác': 'bg-gray-100 text-gray-700',
};

export default function Expenses() {
    const [expenses, setExpenses] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ show: false, item: null });
    const [filterCategory, setFilterCategory] = useState('all');
    const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], category: expenseCategories[0], description: '', amount: '', note: '' });
    const [errors, setErrors] = useState({});
    const { role } = useAuth();
    const isAdmin = role === 'admin';

    useEffect(() => { loadData(); }, []);

    const loadData = () => setExpenses(expenseService.getAll());

    const monthOptions = getMonthOptions();

    const filtered = expenses
        .filter(e => e.date && e.date.startsWith(selectedMonth))
        .filter(e => filterCategory === 'all' || e.category === filterCategory);

    const totalMonth = expenses
        .filter(e => e.date && e.date.startsWith(selectedMonth))
        .reduce((s, e) => s + (e.amount || 0), 0);

    const byCategory = expenses
        .filter(e => e.date && e.date.startsWith(selectedMonth))
        .reduce((acc, e) => {
            acc[e.category] = (acc[e.category] || 0) + e.amount;
            return acc;
        }, {});

    const openAdd = () => {
        setEditItem(null);
        setForm({ date: new Date().toISOString().split('T')[0], category: expenseCategories[0], description: '', amount: '', note: '' });
        setErrors({});
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditItem(item);
        setForm({ date: item.date, category: item.category, description: item.description, amount: item.amount, note: item.note || '' });
        setErrors({});
        setShowModal(true);
    };

    const validate = () => {
        const e = {};
        if (!form.date) e.date = 'Chọn ngày';
        if (!form.description.trim()) e.description = 'Nhập mô tả';
        if (!form.amount || Number(form.amount) <= 0) e.amount = 'Nhập số tiền hợp lệ';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;
        const data = { date: form.date, category: form.category, description: form.description, amount: Number(form.amount), note: form.note };
        if (editItem) expenseService.update(editItem.id, data);
        else expenseService.create(data);
        loadData();
        setShowModal(false);
    };

    const handleDelete = () => {
        if (deleteModal.item) {
            expenseService.delete(deleteModal.item.id);
            loadData();
            setDeleteModal({ show: false, item: null });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý chi phí</h1>
                    <p className="text-gray-500 mt-1">Theo dõi chi phí vận hành theo tháng</p>
                </div>
                {isAdmin && (
                    <button onClick={openAdd} className="btn btn-primary">
                        <Plus size={20} /> Thêm chi phí
                    </button>
                )}
            </div>

            {/* Month + Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Month filter */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-600">
                        <Filter size={15} /> Lọc theo tháng
                    </div>
                    <select
                        value={selectedMonth}
                        onChange={e => setSelectedMonth(e.target.value)}
                        className="input-field text-sm"
                    >
                        {monthOptions.map(m => <option key={m} value={m}>{formatMonth(m)}</option>)}
                    </select>
                </div>

                {/* Total */}
                <div className="bg-gradient-to-r from-red-500 to-rose-500 rounded-xl p-5 shadow-lg lg:col-span-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-100 text-sm font-medium">Tổng chi phí {formatMonth(selectedMonth)}</p>
                            <p className="text-3xl font-bold text-white mt-1">{formatCurrency(totalMonth)}</p>
                        </div>
                        <div className="p-4 bg-white/20 rounded-2xl">
                            <TrendingDown className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/20">
                        <p className="text-red-100 text-sm">
                            <span className="font-semibold text-white">{filtered.length}</span> khoản chi trong tháng
                        </p>
                    </div>
                </div>
            </div>

            {/* Category breakdown */}
            {Object.keys(byCategory).length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {Object.entries(byCategory).map(([cat, amt]) => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(filterCategory === cat ? 'all' : cat)}
                            className={`bg-white rounded-xl p-3 shadow-sm border text-left transition-all ${filterCategory === cat ? 'border-primary-400 ring-2 ring-primary-200' : 'border-gray-100 hover:border-gray-200'}`}
                        >
                            <span className={`badge text-xs ${CATEGORY_COLORS[cat] || 'bg-gray-100 text-gray-700'}`}>{cat}</span>
                            <p className="text-sm font-bold text-gray-800 mt-2">{formatCurrency(amt)}</p>
                        </button>
                    ))}
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {filterCategory !== 'all' && (
                    <div className="px-6 py-3 bg-primary-50 border-b border-primary-100 flex items-center justify-between">
                        <span className="text-sm text-primary-700">Đang lọc: <strong>{filterCategory}</strong></span>
                        <button onClick={() => setFilterCategory('all')} className="text-xs text-primary-600 hover:text-primary-800 flex items-center gap-1"><X size={14} /> Bỏ lọc</button>
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Danh mục</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mô tả</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Số tiền</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ghi chú</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.length > 0 ? filtered.map(item => (
                                <tr key={item.id} className="table-row-hover">
                                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{formatDate(item.date)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`badge ${CATEGORY_COLORS[item.category] || 'bg-gray-100 text-gray-700'}`}>{item.category}</span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-800 font-medium">{item.description}</td>
                                    <td className="px-6 py-4 text-right font-bold text-red-600">{formatCurrency(item.amount)}</td>
                                    <td className="px-6 py-4 text-gray-400 text-sm">{item.note || '—'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {isAdmin && <>
                                                <button onClick={() => openEdit(item)} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                                                <button onClick={() => setDeleteModal({ show: true, item })} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                            </>}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-400">Chưa có chi phí nào trong tháng này</td></tr>
                            )}
                        </tbody>
                        {filtered.length > 0 && (
                            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                                <tr>
                                    <td colSpan="3" className="px-6 py-3 text-sm font-semibold text-gray-600">Tổng cộng</td>
                                    <td className="px-6 py-3 text-right font-bold text-red-600 text-base">
                                        {formatCurrency(filtered.reduce((s, e) => s + e.amount, 0))}
                                    </td>
                                    <td colSpan="2"></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-slide-in">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-semibold text-gray-900">{editItem ? 'Chỉnh sửa chi phí' : 'Thêm chi phí'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày <span className="text-red-500">*</span></label>
                                    <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={`input-field ${errors.date ? 'border-red-400' : ''}`} />
                                    {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Danh mục</label>
                                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                                        {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả <span className="text-red-500">*</span></label>
                                <input type="text" placeholder="Thay nhớt xe TX-001..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={`input-field ${errors.description ? 'border-red-400' : ''}`} />
                                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Số tiền (VNĐ) <span className="text-red-500">*</span></label>
                                <input type="number" min="0" placeholder="500000" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className={`input-field ${errors.amount ? 'border-red-400' : ''}`} />
                                {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ghi chú</label>
                                <textarea rows={2} placeholder="Ghi chú..." value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} className="input-field resize-none" />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="btn btn-secondary flex-1">Hủy</button>
                            <button onClick={handleSave} className="btn btn-primary flex-1">{editItem ? 'Cập nhật' : 'Thêm chi phí'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 animate-slide-in">
                        <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa</h3>
                        <p className="text-gray-500 mt-2 text-sm">Xóa khoản chi phí <strong>{deleteModal.item?.description}</strong> — {formatCurrency(deleteModal.item?.amount)}?</p>
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
