import { useState, useEffect } from 'react';
import { Search, DollarSign, CheckCircle, AlertCircle, Clock, Plus, Trash2 } from 'lucide-react';
import { depositService, driverService } from '../services/storage';

export default function Finance() {
    const [deposits, setDeposits] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editModal, setEditModal] = useState({ show: false, deposit: null, isNew: false });
    const [paymentAmount, setPaymentAmount] = useState('');
    const [requiredAmount, setRequiredAmount] = useState('');
    const [selectedDriverId, setSelectedDriverId] = useState('');

    useEffect(() => {
        loadDeposits();
    }, []);

    const loadDeposits = () => {
        const allDeposits = depositService.getAll();
        const allDrivers = driverService.getAll();
        setDrivers(allDrivers);

        const mergedDeposits = allDeposits.map(dep => {
            const driver = allDrivers.find(d => d.id === dep.driverId);
            return {
                ...dep,
                vehicleCode: driver?.vehicleCode || 'N/A',
                licensePlate: driver?.licensePlate || 'N/A',
                avatar: driver?.avatar || ''
            };
        });
        setDeposits(mergedDeposits);
    };

    // Tài xế chưa có record tiền thế chân
    const driversWithoutDeposit = drivers.filter(
        d => !deposits.some(dep => dep.driverId === d.id)
    );

    const filteredDeposits = deposits.filter(dep =>
        dep.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dep.vehicleCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'paid':
                return (
                    <span className="badge badge-success flex items-center gap-1">
                        <CheckCircle size={14} />
                        Đã đóng đủ
                    </span>
                );
            case 'partial':
                return (
                    <span className="badge badge-warning flex items-center gap-1">
                        <Clock size={14} />
                        Đóng một phần
                    </span>
                );
            default:
                return (
                    <span className="badge badge-danger flex items-center gap-1">
                        <AlertCircle size={14} />
                        Chưa đóng
                    </span>
                );
        }
    };

    const handleOpenEdit = (deposit) => {
        setEditModal({ show: true, deposit, isNew: false });
        setRequiredAmount(deposit.requiredAmount.toString());
        setPaymentAmount(deposit.paidAmount.toString());
        setSelectedDriverId(deposit.driverId);
    };

    const handleOpenAdd = () => {
        setEditModal({ show: true, deposit: null, isNew: true });
        setRequiredAmount('5000000');
        setPaymentAmount('0');
        setSelectedDriverId('');
    };

    const handleCloseModal = () => {
        setEditModal({ show: false, deposit: null, isNew: false });
        setPaymentAmount('');
        setRequiredAmount('');
        setSelectedDriverId('');
    };

    const handleSavePayment = () => {
        const paid = parseInt(paymentAmount) || 0;
        const required = parseInt(requiredAmount) || 0;

        if (editModal.isNew) {
            // Tạo mới (hoặc cập nhật nếu tài xế đã có record)
            if (!selectedDriverId) {
                alert('Vui lòng chọn tài xế');
                return;
            }
            if (required <= 0) {
                alert('Vui lòng nhập số tiền yêu cầu');
                return;
            }
            const driver = drivers.find(d => d.id === selectedDriverId);
            const existing = deposits.find(dep => dep.driverId === selectedDriverId);

            if (existing) {
                // Đã có record → cập nhật
                depositService.update(existing.id, { paidAmount: paid, requiredAmount: required });
            } else {
                // Chưa có → tạo mới
                let status = 'unpaid';
                if (paid >= required) status = 'paid';
                else if (paid > 0) status = 'partial';

                depositService.create({
                    driverId: selectedDriverId,
                    driverName: driver?.name || '',
                    requiredAmount: required,
                    paidAmount: paid,
                    status
                });
            }
        } else if (editModal.deposit) {
            // Cập nhật
            depositService.update(editModal.deposit.id, { paidAmount: paid, requiredAmount: required });
        }
        loadDeposits();
        handleCloseModal();
    };

    const handleDelete = (deposit) => {
        if (confirm(`Xóa record tiền thế chân của ${deposit.driverName}?`)) {
            depositService.delete(deposit.id);
            loadDeposits();
        }
    };

    const totalRequired = deposits.reduce((sum, d) => sum + d.requiredAmount, 0);
    const totalPaid = deposits.reduce((sum, d) => sum + d.paidAmount, 0);
    const paidCount = deposits.filter(d => d.status === 'paid').length;
    const unpaidCount = deposits.filter(d => d.status === 'unpaid').length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý tiền thế chân</h1>
                    <p className="text-gray-500 mt-1">Theo dõi tiền cọc của các tài xế</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Plus size={18} />
                    Thêm mới
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 rounded-xl">
                            <DollarSign className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Tổng yêu cầu</p>
                            <p className="text-lg font-bold text-gray-900">{formatCurrency(totalRequired)}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-100 rounded-xl">
                            <CheckCircle className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Đã thu</p>
                            <p className="text-lg font-bold text-emerald-600">{formatCurrency(totalPaid)}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <CheckCircle className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Đã đóng đủ</p>
                            <p className="text-lg font-bold text-gray-900">{paidCount} tài xế</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-100 rounded-xl">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Chưa đóng</p>
                            <p className="text-lg font-bold text-red-600">{unpaidCount} tài xế</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc mã xe..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-12"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tài xế</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã xe</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Yêu cầu</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Đã đóng</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Còn thiếu</th>
                                <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredDeposits.length > 0 ? (
                                filteredDeposits.map((deposit) => (
                                    <tr key={deposit.id} className="table-row-hover">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={deposit.avatar}
                                                    alt={deposit.driverName}
                                                    className="w-10 h-10 rounded-full bg-gray-100"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-900">{deposit.driverName}</p>
                                                    <p className="text-sm text-gray-500">{deposit.licensePlate}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-primary-600">{deposit.vehicleCode}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-600">
                                            {formatCurrency(deposit.requiredAmount)}
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-emerald-600">
                                            {formatCurrency(deposit.paidAmount)}
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-red-600">
                                            {formatCurrency(Math.max(0, deposit.requiredAmount - deposit.paidAmount))}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getStatusBadge(deposit.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenEdit(deposit)}
                                                    className="btn btn-primary text-sm py-2"
                                                >
                                                    Cập nhật
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(deposit)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {editModal.show && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-slide-in">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {editModal.isNew ? 'Thêm tiền thế chân' : 'Cập nhật tiền cọc'}
                        </h3>
                        {!editModal.isNew && (
                            <p className="text-gray-500 mt-1 text-sm">
                                Tài xế: <strong>{editModal.deposit?.driverName}</strong>
                            </p>
                        )}

                        <div className="mt-6 space-y-4">
                            {editModal.isNew && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Chọn tài xế <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={selectedDriverId}
                                        onChange={(e) => {
                                            const id = e.target.value;
                                            setSelectedDriverId(id);
                                            // Nếu tài xế đã có record → load số tiền hiện tại vào form
                                            const existing = deposits.find(dep => dep.driverId === id);
                                            if (existing) {
                                                setRequiredAmount(existing.requiredAmount.toString());
                                                setPaymentAmount(existing.paidAmount.toString());
                                            }
                                        }}
                                        className="input-field"
                                    >
                                        <option value="">-- Chọn tài xế --</option>
                                        {drivers.map(d => {
                                            const hasRecord = deposits.some(dep => dep.driverId === d.id);
                                            return (
                                                <option key={d.id} value={d.id}>
                                                    {d.name} ({d.vehicleCode} - {d.licensePlate})
                                                    {hasRecord ? ' — đã có record' : ''}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    {selectedDriverId && deposits.some(dep => dep.driverId === selectedDriverId) && (
                                        <p className="text-xs text-amber-600 mt-1">
                                            ⚠ Tài xế này đã có record. Khi lưu sẽ cập nhật record hiện có.
                                        </p>
                                    )}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Số tiền yêu cầu (VNĐ)
                                </label>
                                <input
                                    type="number"
                                    value={requiredAmount}
                                    onChange={(e) => setRequiredAmount(e.target.value)}
                                    placeholder="5000000"
                                    className="input-field"
                                    min="0"
                                />
                                {requiredAmount && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        = {formatCurrency(parseInt(requiredAmount) || 0)}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Số tiền đã đóng (VNĐ)
                                </label>
                                <input
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    placeholder="0"
                                    className="input-field"
                                    min="0"
                                />
                                {paymentAmount && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        = {formatCurrency(parseInt(paymentAmount) || 0)}
                                    </p>
                                )}
                            </div>
                            {requiredAmount && paymentAmount && (
                                <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Còn thiếu:</span>
                                        <span className={`font-semibold ${Math.max(0, (parseInt(requiredAmount) || 0) - (parseInt(paymentAmount) || 0)) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                            {formatCurrency(Math.max(0, (parseInt(requiredAmount) || 0) - (parseInt(paymentAmount) || 0)))}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleCloseModal}
                                className="btn btn-secondary flex-1"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSavePayment}
                                className="btn btn-primary flex-1"
                                disabled={editModal.isNew && drivers.length === 0}
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
