import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, User } from 'lucide-react';
import { driverService, depositService } from '../services/storage';
import { vehicleTypes } from '../data/mockData';

export default function DriverForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        licensePlate: '',
        vehicleType: vehicleTypes[0],
        vehicleCode: '',
        avatar: '',
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0]
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEditing) {
            const driver = driverService.getById(id);
            if (driver) setFormData(driver);
            else navigate('/drivers');
        }
    }, [id, isEditing, navigate]);

    const generateAvatar = (name) =>
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'default')}`;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            if (name === 'name') updated.avatar = generateAvatar(value);
            return updated;
        });
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Vui lòng nhập họ tên';
        if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại';
        else if (!/^0\d{9}$/.test(formData.phone)) newErrors.phone = 'Số điện thoại không hợp lệ';
        if (!formData.licensePlate.trim()) newErrors.licensePlate = 'Vui lòng nhập biển số xe';
        if (!formData.vehicleCode.trim()) newErrors.vehicleCode = 'Vui lòng nhập mã số xe';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        const dataToSave = { ...formData, avatar: formData.avatar || generateAvatar(formData.name) };
        if (isEditing) {
            driverService.update(id, dataToSave);
        } else {
            const newDriver = driverService.create(dataToSave);
            depositService.create({
                driverId: newDriver.id,
                driverName: newDriver.name,
                requiredAmount: 5000000,
                paidAmount: 0,
                status: 'unpaid'
            });
        }
        navigate('/drivers');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/drivers')} className="p-2 hover:bg-gray-100 rounded-lg">
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEditing ? 'Chỉnh sửa tài xế' : 'Thêm tài xế mới'}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isEditing ? 'Cập nhật thông tin tài xế' : 'Nhập thông tin tài xế mới'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 text-center">
                        <div className="w-40 h-40 mx-auto bg-gray-100 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                            {formData.avatar
                                ? <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center">
                                    <User size={64} className="text-gray-300" />
                                </div>
                            }
                        </div>
                        <p className="text-sm text-gray-500 mt-4">Avatar được tạo tự động từ tên</p>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Họ và tên <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Nhập họ và tên"
                                    className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                                />
                                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Số điện thoại <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="0901234567"
                                    className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                                />
                                {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="input-field">
                                    <option value="active">Đang hoạt động</option>
                                    <option value="inactive">Tạm nghỉ</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Biển số xe <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="licensePlate"
                                    value={formData.licensePlate}
                                    onChange={handleChange}
                                    placeholder="51A-123.45"
                                    className={`input-field ${errors.licensePlate ? 'border-red-500' : ''}`}
                                />
                                {errors.licensePlate && <p className="text-sm text-red-500 mt-1">{errors.licensePlate}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mã số xe <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="vehicleCode"
                                    value={formData.vehicleCode}
                                    onChange={handleChange}
                                    placeholder="TX-001"
                                    className={`input-field ${errors.vehicleCode ? 'border-red-500' : ''}`}
                                />
                                {errors.vehicleCode && <p className="text-sm text-red-500 mt-1">{errors.vehicleCode}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Loại xe</label>
                                <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} className="input-field">
                                    {vehicleTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ngày tham gia</label>
                                <input
                                    type="date"
                                    name="joinDate"
                                    value={formData.joinDate}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4 pt-6 border-t border-gray-100">
                            <button type="button" onClick={() => navigate('/drivers')} className="btn btn-secondary">
                                Hủy
                            </button>
                            <button type="submit" className="btn btn-primary">
                                <Save size={20} />
                                {isEditing ? 'Cập nhật' : 'Thêm tài xế'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
