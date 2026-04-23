export const mockDrivers = [
    { id: '1', name: 'Nguyễn Văn An', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=An', licensePlate: '51A-123.45', vehicleType: 'Toyota Vios', vehicleCode: 'TX-001', phone: '0901234567', joinDate: '2024-01-15', status: 'active' },
    { id: '2', name: 'Trần Văn Bình', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Binh', licensePlate: '51A-234.56', vehicleType: 'Hyundai i10', vehicleCode: 'TX-002', phone: '0902345678', joinDate: '2024-02-20', status: 'active' },
    { id: '3', name: 'Lê Thị Cúc', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cuc', licensePlate: '51A-345.67', vehicleType: 'Toyota Vios', vehicleCode: 'TX-003', phone: '0903456789', joinDate: '2024-03-10', status: 'active' },
    { id: '4', name: 'Phạm Văn Dũng', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dung', licensePlate: '51A-456.78', vehicleType: 'Kia Morning', vehicleCode: 'TX-004', phone: '0904567890', joinDate: '2024-04-05', status: 'inactive' },
    { id: '5', name: 'Hoàng Văn Em', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Em', licensePlate: '51A-567.89', vehicleType: 'Toyota Vios', vehicleCode: 'TX-005', phone: '0905678901', joinDate: '2024-05-18', status: 'active' }
];

export const mockDeposits = [
    { id: '1', driverId: '1', driverName: 'Nguyễn Văn An', requiredAmount: 5000000, paidAmount: 5000000, status: 'paid' },
    { id: '2', driverId: '2', driverName: 'Trần Văn Bình', requiredAmount: 5000000, paidAmount: 3000000, status: 'partial' },
    { id: '3', driverId: '3', driverName: 'Lê Thị Cúc', requiredAmount: 5000000, paidAmount: 5000000, status: 'paid' },
    { id: '4', driverId: '4', driverName: 'Phạm Văn Dũng', requiredAmount: 5000000, paidAmount: 0, status: 'unpaid' },
    { id: '5', driverId: '5', driverName: 'Hoàng Văn Em', requiredAmount: 5000000, paidAmount: 2500000, status: 'partial' }
];

export const mockRevenues = [
    { id: '1', driverId: '1', driverName: 'Nguyễn Văn An', vehicleCode: 'TX-001', month: '2024-01', amount: 15000000 },
    { id: '2', driverId: '1', driverName: 'Nguyễn Văn An', vehicleCode: 'TX-001', month: '2024-02', amount: 18000000 },
    { id: '3', driverId: '2', driverName: 'Trần Văn Bình', vehicleCode: 'TX-002', month: '2024-01', amount: 12000000 },
    { id: '4', driverId: '2', driverName: 'Trần Văn Bình', vehicleCode: 'TX-002', month: '2024-02', amount: 14000000 },
    { id: '5', driverId: '3', driverName: 'Lê Thị Cúc', vehicleCode: 'TX-003', month: '2024-01', amount: 16000000 },
    { id: '6', driverId: '3', driverName: 'Lê Thị Cúc', vehicleCode: 'TX-003', month: '2024-02', amount: 17000000 },
    { id: '7', driverId: '5', driverName: 'Hoàng Văn Em', vehicleCode: 'TX-005', month: '2024-02', amount: 13000000 }
];

export const mockAdvances = [
    { id: 'a1', driverId: '1', driverName: 'Nguyễn Văn An', driverAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=An', date: '2026-04-02', amount: 2000000, reason: 'ca nhan', status: 'pending', note: '' },
    { id: 'a2', driverId: '2', driverName: 'Trần Văn Bình', driverAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Binh', date: '2026-04-05', amount: 1500000, reason: 'CA NHAN', status: 'pending', note: '' },
    { id: 'a3', driverId: '3', driverName: 'Lê Thị Cúc', driverAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cuc', date: '2026-04-08', amount: 3000000, reason: 'ca nhan', status: 'completed', note: 'Đã hoàn trả' },
    { id: 'a4', driverId: '5', driverName: 'Hoàng Văn Em', driverAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Em', date: '2026-04-10', amount: 2500000, reason: 'ca nhan', status: 'pending', note: '' },
    { id: 'a5', driverId: '1', driverName: 'Nguyễn Văn An', driverAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=An', date: '2026-03-15', amount: 1000000, reason: 'xăng xe', status: 'completed', note: '' },
];

export const mockExpenses = [
    { id: 'e1', date: '2026-04-01', category: 'Xăng dầu', description: 'Đổ xăng xe văn phòng', amount: 500000, note: '' },
    { id: 'e2', date: '2026-04-03', category: 'Bảo dưỡng', description: 'Thay nhớt xe TX-001', amount: 1200000, note: 'Định kỳ 3 tháng' },
    { id: 'e3', date: '2026-04-05', category: 'Văn phòng phẩm', description: 'Mua giấy tờ văn phòng', amount: 350000, note: '' },
    { id: 'e4', date: '2026-04-10', category: 'Bảo hiểm', description: 'Bảo hiểm xe TX-003', amount: 2500000, note: 'Bảo hiểm 1 năm' },
    { id: 'e5', date: '2026-03-20', category: 'Bảo dưỡng', description: 'Sửa điều hòa TX-002', amount: 800000, note: '' },
    { id: 'e6', date: '2026-03-25', category: 'Khác', description: 'Chi phí phát sinh', amount: 300000, note: '' },
];

export const mockNightShifts = [
    { id: 'n1', driverId: '1', driverName: 'Nguyễn Văn An', driverAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=An', date: '2026-04-01', note: '' },
    { id: 'n2', driverId: '2', driverName: 'Trần Văn Bình', driverAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Binh', date: '2026-04-02', note: '' },
    { id: 'n3', driverId: '3', driverName: 'Lê Thị Cúc', driverAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cuc', date: '2026-04-03', note: '' },
    { id: 'n4', driverId: '5', driverName: 'Hoàng Văn Em', driverAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Em', date: '2026-04-04', note: '' },
    { id: 'n5', driverId: '1', driverName: 'Nguyễn Văn An', driverAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=An', date: '2026-04-07', note: '' },
    { id: 'n6', driverId: '2', driverName: 'Trần Văn Bình', driverAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Binh', date: '2026-04-08', note: '' },
];

export const vehicleTypes = ['Toyota Vios', 'Hyundai i10', 'Kia Morning', 'Toyota Innova', 'Hyundai Accent', 'Mazda 3'];

export const expenseCategories = ['Xăng dầu', 'Bảo dưỡng', 'Bảo hiểm', 'Văn phòng phẩm', 'Lương nhân viên', 'Khác'];
