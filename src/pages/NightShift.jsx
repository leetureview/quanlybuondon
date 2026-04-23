import { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, Moon, Trash2, X } from 'lucide-react';
import { nightShiftService, driverService } from '../services/storage';
import { useAuth } from '../contexts/AuthContext';

const DAYS_VN = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTHS_VN = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

const pad = (n) => String(n).padStart(2, '0');

export default function NightShift() {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [shifts, setShifts] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [deleteModal, setDeleteModal] = useState({ show: false, item: null });
    const [form, setForm] = useState({ driverId: '', note: '' });
    const [errors, setErrors] = useState({});
    const { role } = useAuth();
    const isAdmin = role === 'admin';

    useEffect(() => { loadData(); }, [year, month]);

    const loadData = () => {
        setShifts(nightShiftService.getByMonth(year, month));
        setDrivers(driverService.getAll());
    };

    // Build calendar grid
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const getShiftsForDay = (day) => {
        if (!day) return [];
        const dateStr = `${year}-${pad(month)}-${pad(day)}`;
        return shifts.filter(s => s.date === dateStr);
    };

    const prevMonth = () => {
        if (month === 1) { setMonth(12); setYear(y => y - 1); }
        else setMonth(m => m - 1);
    };

    const nextMonth = () => {
        if (month === 12) { setMonth(1); setYear(y => y + 1); }
        else setMonth(m => m + 1);
    };

    const openAdd = (day) => {
        setSelectedDate(`${year}-${pad(month)}-${pad(day)}`);
        setForm({ driverId: '', note: '' });
        setErrors({});
        setShowModal(true);
    };

    const handleSave = () => {
        if (!form.driverId) { setErrors({ driverId: 'Chọn tài xế' }); return; }
        const driver = drivers.find(d => d.id === form.driverId);
        nightShiftService.create({
            driverId: form.driverId,
            driverName: driver?.name || '',
            driverAvatar: driver?.avatar || '',
            date: selectedDate,
            note: form.note
        });
        loadData();
        setShowModal(false);
    };

    const handleDelete = () => {
        if (deleteModal.item) {
            nightShiftService.delete(deleteModal.item.id);
            loadData();
            setDeleteModal({ show: false, item: null });
        }
    };

    const totalShifts = shifts.length;
    const uniqueDrivers = [...new Set(shifts.map(s => s.driverId))].length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Lịch trực đêm</h1>
                <p className="text-gray-500 mt-1">Phân công và theo dõi ca trực đêm của tài xế</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-100 rounded-xl"><Moon className="w-5 h-5 text-indigo-600" /></div>
                    <div>
                        <p className="text-xs text-gray-500">Ca trực tháng này</p>
                        <p className="text-xl font-bold text-gray-900">{totalShifts}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                    <div className="p-2.5 bg-blue-100 rounded-xl"><Moon className="w-5 h-5 text-blue-600" /></div>
                    <div>
                        <p className="text-xs text-gray-500">Tài xế tham gia</p>
                        <p className="text-xl font-bold text-gray-900">{uniqueDrivers}</p>
                    </div>
                </div>
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Calendar header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ChevronLeft size={20} className="text-gray-600" />
                    </button>
                    <h2 className="text-lg font-semibold text-gray-900">
                        {MONTHS_VN[month - 1]} {year}
                    </h2>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ChevronRight size={20} className="text-gray-600" />
                    </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
                    {DAYS_VN.map(d => (
                        <div key={d} className={`text-center py-3 text-xs font-semibold uppercase tracking-wide ${d === 'CN' ? 'text-red-500' : 'text-gray-500'}`}>{d}</div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7">
                    {cells.map((day, i) => {
                        const dayShifts = getShiftsForDay(day);
                        const isToday = day && year === now.getFullYear() && month === now.getMonth() + 1 && day === now.getDate();
                        const colIdx = i % 7;
                        return (
                            <div
                                key={i}
                                className={`min-h-[100px] border-b border-r border-gray-100 p-2 ${day ? 'hover:bg-gray-50 cursor-pointer' : 'bg-gray-50/50'} ${colIdx === 0 ? 'border-l-0' : ''}`}
                                onClick={() => day && isAdmin && openAdd(day)}
                            >
                                {day && (
                                    <>
                                        <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium mb-1 ${isToday ? 'bg-primary-500 text-white' : colIdx === 0 ? 'text-red-500' : 'text-gray-700'}`}>
                                            {day}
                                        </div>
                                        <div className="space-y-0.5">
                                            {dayShifts.slice(0, 3).map(s => (
                                                <div
                                                    key={s.id}
                                                    className="flex items-center gap-1 bg-indigo-100 text-indigo-700 rounded px-1 py-0.5 text-xs"
                                                    onClick={e => { e.stopPropagation(); isAdmin && setDeleteModal({ show: true, item: s }); }}
                                                >
                                                    <img src={s.driverAvatar} alt="" className="w-3.5 h-3.5 rounded-full" />
                                                    <span className="truncate">{s.driverName.split(' ').pop()}</span>
                                                </div>
                                            ))}
                                            {dayShifts.length > 3 && (
                                                <div className="text-xs text-gray-400 px-1">+{dayShifts.length - 3} nữa</div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* List view */}
            {shifts.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900">Danh sách ca trực — {MONTHS_VN[month - 1]} {year}</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Ngày</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tài xế</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Ghi chú</th>
                                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {[...shifts].sort((a, b) => a.date.localeCompare(b.date)).map(s => {
                                    const [y2, m2, d2] = s.date.split('-');
                                    return (
                                        <tr key={s.id} className="table-row-hover">
                                            <td className="px-6 py-3 text-gray-600 whitespace-nowrap">
                                                {DAYS_VN[new Date(s.date).getDay()]} {parseInt(d2)}/{parseInt(m2)}/{y2}
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-2">
                                                    <img src={s.driverAvatar} alt={s.driverName} className="w-8 h-8 rounded-full" />
                                                    <span className="font-medium text-gray-900">{s.driverName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-gray-400 text-sm">{s.note || '—'}</td>
                                            <td className="px-6 py-3 text-right">
                                                {isAdmin && <button onClick={() => setDeleteModal({ show: true, item: s })} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 animate-slide-in">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Phân công trực đêm</h3>
                            <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            Ngày: <strong>{selectedDate ? (() => { const [y2,m2,d2]=selectedDate.split('-'); return `${parseInt(d2)}/${parseInt(m2)}/${y2}`; })() : ''}</strong>
                        </p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tài xế <span className="text-red-500">*</span></label>
                                <select
                                    value={form.driverId}
                                    onChange={e => { setForm(f => ({ ...f, driverId: e.target.value })); setErrors({}); }}
                                    className={`input-field ${errors.driverId ? 'border-red-400' : ''}`}
                                >
                                    <option value="">-- Chọn tài xế --</option>
                                    {drivers.filter(d => d.status === 'active').map(d => (
                                        <option key={d.id} value={d.id}>{d.name} - {d.vehicleCode}</option>
                                    ))}
                                </select>
                                {errors.driverId && <p className="text-xs text-red-500 mt-1">{errors.driverId}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ghi chú</label>
                                <input type="text" placeholder="Ghi chú thêm..." value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} className="input-field" />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-5">
                            <button onClick={() => setShowModal(false)} className="btn btn-secondary flex-1">Hủy</button>
                            <button onClick={handleSave} className="btn btn-primary flex-1"><Moon size={16} /> Phân công</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 animate-slide-in">
                        <h3 className="text-lg font-semibold text-gray-900">Xóa ca trực</h3>
                        <p className="text-gray-500 mt-2 text-sm">Xóa ca trực đêm của <strong>{deleteModal.item?.driverName}</strong>?</p>
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
