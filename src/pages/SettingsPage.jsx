import { useState, useEffect } from 'react';
import { Settings, Percent, User, Building2, Save, Check } from 'lucide-react';

const SETTINGS_KEY = 'taxi123go_settings';

const defaultSettings = {
    driverShare: 40,
    companyShare: 60,
};

export const settingsService = {
    get: () => {
        const data = localStorage.getItem(SETTINGS_KEY);
        return data ? JSON.parse(data) : defaultSettings;
    },
    save: (settings) => {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
};

export default function SettingsPage() {
    const [driverShare, setDriverShare] = useState(40);
    const [companyShare, setCompanyShare] = useState(60);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const s = settingsService.get();
        setDriverShare(s.driverShare);
        setCompanyShare(s.companyShare);
    }, []);

    const handleDriverShareChange = (value) => {
        const v = Math.max(0, Math.min(100, parseInt(value) || 0));
        setDriverShare(v);
        setCompanyShare(100 - v);
        setSaved(false);
    };

    const handleCompanyShareChange = (value) => {
        const v = Math.max(0, Math.min(100, parseInt(value) || 0));
        setCompanyShare(v);
        setDriverShare(100 - v);
        setSaved(false);
    };

    const handleSave = () => {
        settingsService.save({ driverShare, companyShare });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const formatVND = (n) =>
        new Intl.NumberFormat('vi-VN').format(n) + ' VND';

    const sampleRevenue = 10000000;
    const driverGet = Math.round(sampleRevenue * driverShare / 100);
    const companyGet = Math.round(sampleRevenue * companyShare / 100);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Settings className="w-7 h-7 text-gray-700" />
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
                    <p className="text-gray-500 mt-1">Cấu hình hệ thống quản lý taxi</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-3xl">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-100 rounded-lg">
                        <Percent className="w-5 h-5 text-amber-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Tỷ lệ ăn chia</h2>
                </div>
                <p className="text-sm text-gray-500 mt-1 ml-11">
                    Cài đặt phần trăm chia doanh thu giữa tài xế và công ty
                </p>

                <div className="mt-6 space-y-5">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-emerald-700 mb-2">
                            <User size={16} />
                            Tài xế nhận (%)
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={driverShare}
                            onChange={(e) => handleDriverShareChange(e.target.value)}
                            className="w-full text-center text-2xl font-bold text-gray-900 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                        />
                        <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 transition-all duration-300"
                                style={{ width: `${driverShare}%` }}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-blue-700 mb-2">
                            <Building2 size={16} />
                            Công ty nhận (%)
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={companyShare}
                            onChange={(e) => handleCompanyShareChange(e.target.value)}
                            className="w-full text-center text-2xl font-bold text-gray-900 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                        />
                        <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 transition-all duration-300"
                                style={{ width: `${companyShare}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <p className="font-semibold text-amber-800">Ví dụ minh họa</p>
                        <p className="text-sm text-amber-700 mt-2">
                            Với doanh thu <strong>{formatVND(sampleRevenue)}</strong>:
                        </p>
                        <ul className="text-sm mt-2 space-y-1 ml-4">
                            <li className="text-gray-700">
                                • Tài xế nhận: <strong className="text-emerald-700">{formatVND(driverGet)}</strong>
                            </li>
                            <li className="text-gray-700">
                                • Công ty nhận: <strong className="text-blue-700">{formatVND(companyGet)}</strong>
                            </li>
                        </ul>
                    </div>

                    <button
                        onClick={handleSave}
                        className={`w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all ${
                            saved
                                ? 'bg-emerald-500 hover:bg-emerald-600'
                                : 'bg-amber-500 hover:bg-amber-600'
                        }`}
                    >
                        {saved ? (
                            <>
                                <Check size={20} />
                                Đã lưu
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                Lưu cài đặt
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
