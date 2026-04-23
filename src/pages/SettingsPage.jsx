import { useState, useEffect } from 'react';
import { Settings, Percent, User, Building2, Save, Check, Users, Plus, X, Shield, RefreshCw } from 'lucide-react';
import { useAuth, ROLE_LABELS } from '../contexts/AuthContext';

const SETTINGS_KEY = 'taxi123go_settings';
const defaultSettings = { driverShare: 40, companyShare: 60 };

export const settingsService = {
    get: () => {
        const data = localStorage.getItem(SETTINGS_KEY);
        return data ? JSON.parse(data) : defaultSettings;
    },
    save: (settings) => localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)),
};

const ROLE_BADGE = {
    admin:    'bg-red-100 text-red-700',
    user:     'bg-blue-100 text-blue-700',
    investor: 'bg-green-100 text-green-700',
};

export default function SettingsPage() {
    const { createUser, getAllUsers, updateUserRole } = useAuth();
    const [driverShare, setDriverShare] = useState(40);
    const [companyShare, setCompanyShare] = useState(60);
    const [saved, setSaved] = useState(false);
    const [tab, setTab] = useState('share');

    // User management state
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [showAddUser, setShowAddUser] = useState(false);
    const [newUser, setNewUser] = useState({ email: '', password: '', name: '', role: 'user' });
    const [addError, setAddError] = useState('');
    const [addLoading, setAddLoading] = useState(false);
    const [updatingRole, setUpdatingRole] = useState(null);

    useEffect(() => {
        const s = settingsService.get();
        setDriverShare(s.driverShare);
        setCompanyShare(s.companyShare);
    }, []);

    useEffect(() => {
        if (tab === 'users') loadUsers();
    }, [tab]);

    const loadUsers = async () => {
        setLoadingUsers(true);
        try {
            const list = await getAllUsers();
            setUsers(list.sort((a, b) => a.name?.localeCompare(b.name)));
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleDriverShareChange = (value) => {
        const v = Math.max(0, Math.min(100, parseInt(value) || 0));
        setDriverShare(v); setCompanyShare(100 - v); setSaved(false);
    };

    const handleCompanyShareChange = (value) => {
        const v = Math.max(0, Math.min(100, parseInt(value) || 0));
        setCompanyShare(v); setDriverShare(100 - v); setSaved(false);
    };

    const handleSave = () => {
        settingsService.save({ driverShare, companyShare });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const handleAddUser = async () => {
        setAddError('');
        if (!newUser.email || !newUser.password || !newUser.name) {
            setAddError('Vui lòng điền đầy đủ thông tin.');
            return;
        }
        if (newUser.password.length < 6) {
            setAddError('Mật khẩu ít nhất 6 ký tự.');
            return;
        }
        setAddLoading(true);
        try {
            await createUser(newUser.email, newUser.password, newUser.name, newUser.role);
            setShowAddUser(false);
            setNewUser({ email: '', password: '', name: '', role: 'user' });
            await loadUsers();
        } catch (err) {
            const messages = {
                'auth/email-already-in-use': 'Email đã được sử dụng.',
                'auth/invalid-email': 'Email không hợp lệ.',
                'auth/weak-password': 'Mật khẩu quá yếu.',
            };
            setAddError(messages[err.code] || err.message);
        } finally {
            setAddLoading(false);
        }
    };

    const handleRoleChange = async (uid, newRole) => {
        setUpdatingRole(uid);
        try {
            await updateUserRole(uid, newRole);
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
        } finally {
            setUpdatingRole(null);
        }
    };

    const formatVND = (n) => new Intl.NumberFormat('vi-VN').format(n) + ' VND';
    const sampleRevenue = 10000000;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Settings className="w-7 h-7 text-gray-700" />
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
                    <p className="text-gray-500 mt-1">Cấu hình hệ thống quản lý taxi</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                {[
                    { id: 'share', icon: Percent, label: 'Tỷ lệ ăn chia' },
                    { id: 'users', icon: Users, label: 'Quản lý tài khoản' },
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                            tab === t.id
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <t.icon size={16} /> {t.label}
                    </button>
                ))}
            </div>

            {/* Tab: Tỷ lệ ăn chia */}
            {tab === 'share' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-3xl">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-2 bg-amber-100 rounded-lg"><Percent className="w-5 h-5 text-amber-600" /></div>
                        <h2 className="text-lg font-semibold text-gray-900">Tỷ lệ ăn chia</h2>
                    </div>
                    <p className="text-sm text-gray-500 ml-11 mb-6">Phần trăm chia doanh thu giữa tài xế và công ty</p>

                    <div className="space-y-5">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-emerald-700 mb-2">
                                <User size={16} /> Tài xế nhận (%)
                            </label>
                            <input type="number" min="0" max="100" value={driverShare}
                                onChange={e => handleDriverShareChange(e.target.value)}
                                className="w-full text-center text-2xl font-bold text-gray-900 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            />
                            <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${driverShare}%` }} />
                            </div>
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-blue-700 mb-2">
                                <Building2 size={16} /> Công ty nhận (%)
                            </label>
                            <input type="number" min="0" max="100" value={companyShare}
                                onChange={e => handleCompanyShareChange(e.target.value)}
                                className="w-full text-center text-2xl font-bold text-gray-900 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${companyShare}%` }} />
                            </div>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <p className="font-semibold text-amber-800">Ví dụ minh họa</p>
                            <p className="text-sm text-amber-700 mt-2">Với doanh thu <strong>{formatVND(sampleRevenue)}</strong>:</p>
                            <ul className="text-sm mt-2 space-y-1 ml-4">
                                <li className="text-gray-700">• Tài xế nhận: <strong className="text-emerald-700">{formatVND(Math.round(sampleRevenue * driverShare / 100))}</strong></li>
                                <li className="text-gray-700">• Công ty nhận: <strong className="text-blue-700">{formatVND(Math.round(sampleRevenue * companyShare / 100))}</strong></li>
                            </ul>
                        </div>
                        <button onClick={handleSave} className={`w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all ${saved ? 'bg-emerald-500' : 'bg-amber-500 hover:bg-amber-600'}`}>
                            {saved ? <><Check size={20} /> Đã lưu</> : <><Save size={20} /> Lưu cài đặt</>}
                        </button>
                    </div>
                </div>
            )}

            {/* Tab: Quản lý tài khoản */}
            {tab === 'users' && (
                <div className="space-y-4 max-w-3xl">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">{users.length} tài khoản</p>
                        <div className="flex gap-2">
                            <button onClick={loadUsers} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Làm mới">
                                <RefreshCw size={16} />
                            </button>
                            <button onClick={() => { setShowAddUser(true); setAddError(''); }} className="btn btn-primary">
                                <Plus size={16} /> Thêm tài khoản
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {loadingUsers ? (
                            <div className="flex justify-center py-12">
                                <span className="inline-block w-6 h-6 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tên</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Vai trò</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users.map(u => (
                                        <tr key={u.uid} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-sm">
                                                        {(u.name || u.email || '?')[0].toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-gray-900">{u.name || '—'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 text-sm">{u.email}</td>
                                            <td className="px-6 py-4">
                                                {updatingRole === u.uid ? (
                                                    <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
                                                ) : (
                                                    <select
                                                        value={u.role}
                                                        onChange={e => handleRoleChange(u.uid, e.target.value)}
                                                        className={`text-xs font-medium px-2 py-1 rounded-lg border-0 cursor-pointer ${ROLE_BADGE[u.role] || 'bg-gray-100 text-gray-700'}`}
                                                    >
                                                        <option value="admin">Quản trị viên</option>
                                                        <option value="user">Nhân viên</option>
                                                        <option value="investor">Nhà đầu tư</option>
                                                    </select>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr><td colSpan="3" className="px-6 py-10 text-center text-gray-400">Chưa có tài khoản nào</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Add user modal */}
                    {showAddUser && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-slide-in">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-2">
                                        <Shield size={20} className="text-primary-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">Thêm tài khoản</h3>
                                    </div>
                                    <button onClick={() => setShowAddUser(false)} className="p-1 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                                </div>

                                {addError && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{addError}</div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ tên <span className="text-red-500">*</span></label>
                                        <input type="text" placeholder="Nguyễn Văn A" value={newUser.name}
                                            onChange={e => setNewUser(u => ({ ...u, name: e.target.value }))}
                                            className="input-field" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                                        <input type="email" placeholder="email@123go.vn" value={newUser.email}
                                            onChange={e => setNewUser(u => ({ ...u, email: e.target.value }))}
                                            className="input-field" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu <span className="text-red-500">*</span></label>
                                        <input type="password" placeholder="Ít nhất 6 ký tự" value={newUser.password}
                                            onChange={e => setNewUser(u => ({ ...u, password: e.target.value }))}
                                            className="input-field" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Vai trò</label>
                                        <select value={newUser.role}
                                            onChange={e => setNewUser(u => ({ ...u, role: e.target.value }))}
                                            className="input-field">
                                            <option value="user">Nhân viên / Tài xế (chỉ xem)</option>
                                            <option value="investor">Nhà đầu tư (xem doanh thu)</option>
                                            <option value="admin">Quản trị viên (toàn quyền)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button onClick={() => setShowAddUser(false)} className="btn btn-secondary flex-1">Hủy</button>
                                    <button onClick={handleAddUser} disabled={addLoading} className="btn btn-primary flex-1 disabled:opacity-60">
                                        {addLoading
                                            ? <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                            : <><Plus size={16} /> Tạo tài khoản</>
                                        }
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
