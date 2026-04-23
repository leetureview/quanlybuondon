import { useState } from 'react';
import { Car, LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            const messages = {
                'auth/user-not-found': 'Email không tồn tại.',
                'auth/wrong-password': 'Mật khẩu không đúng.',
                'auth/invalid-credential': 'Email hoặc mật khẩu không đúng.',
                'auth/too-many-requests': 'Quá nhiều lần thử. Vui lòng thử lại sau.',
                'auth/invalid-email': 'Email không hợp lệ.',
            };
            setError(messages[err.code] || 'Đăng nhập thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary-500/30">
                        <Car size={40} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">123 GO</h1>
                    <p className="text-blue-300 mt-1">Hệ thống quản lý nội bộ</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Đăng nhập</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="email@123go.vn"
                                required
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="input-field pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full justify-center mt-2 disabled:opacity-60"
                        >
                            {loading ? (
                                <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            ) : (
                                <><LogIn size={18} /> Đăng nhập</>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-blue-400 text-sm mt-6">
                    Liên hệ quản trị viên để được cấp tài khoản
                </p>
            </div>
        </div>
    );
}
