import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';
import { driverService } from '../services/storage';
import { useAuth } from '../contexts/AuthContext';

export default function Drivers() {
    const [drivers, setDrivers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState({ show: false, driver: null });
    const { role } = useAuth();
    const isAdmin = role === 'admin';

    useEffect(() => {
        loadDrivers();
    }, []);

    const loadDrivers = () => {
        setDrivers(driverService.getAll());
    };

    const filteredDrivers = drivers.filter(driver =>
        driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.vehicleCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = () => {
        if (deleteModal.driver) {
            driverService.delete(deleteModal.driver.id);
            loadDrivers();
            setDeleteModal({ show: false, driver: null });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý tài xế</h1>
                    <p className="text-gray-500 mt-1">Danh sách và quản lý thông tin tài xế</p>
                </div>
                {isAdmin && (
                    <Link to="/drivers/new" className="btn btn-primary">
                        <Plus size={20} />
                        Thêm tài xế
                    </Link>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, biển số hoặc mã xe..."
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
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Biển số xe</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Loại xe</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã số xe</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredDrivers.length > 0 ? (
                                filteredDrivers.map((driver) => (
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
                                                    <p className="text-sm text-gray-500">{driver.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                                {driver.licensePlate}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{driver.vehicleType}</td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-primary-600">{driver.vehicleCode}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`badge ${driver.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                                                {driver.status === 'active' ? 'Hoạt động' : 'Nghỉ'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/drivers/${driver.id}`}
                                                    className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye size={18} />
                                                </Link>
                                                {isAdmin && <>
                                                    <Link
                                                        to={`/drivers/edit/${driver.id}`}
                                                        className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit2 size={18} />
                                                    </Link>
                                                    <button
                                                        onClick={() => setDeleteModal({ show: true, driver })}
                                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        {searchTerm ? 'Không tìm thấy tài xế phù hợp' : 'Chưa có tài xế nào'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <p className="text-sm text-gray-500">
                        Hiển thị <span className="font-medium">{filteredDrivers.length}</span> tài xế
                    </p>
                </div>
            </div>

            {deleteModal.show && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-slide-in">
                        <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa</h3>
                        <p className="text-gray-500 mt-2">
                            Bạn có chắc chắn muốn xóa tài xế <strong>{deleteModal.driver?.name}</strong>?
                            Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setDeleteModal({ show: false, driver: null })}
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
