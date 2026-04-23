const STORAGE_KEYS = {
    DRIVERS: 'taxi123go_drivers',
    DEPOSITS: 'taxi123go_deposits',
    REVENUES: 'taxi123go_revenues',
    ADVANCES: 'taxi123go_advances',
    EXPENSES: 'taxi123go_expenses',
    NIGHT_SHIFTS: 'taxi123go_night_shifts',
};

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const getItems = (key) => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
};

const setItems = (key, items) => {
    localStorage.setItem(key, JSON.stringify(items));
};

export const initializeData = (mockDrivers, mockDeposits, mockRevenues, mockAdvances, mockExpenses, mockNightShifts) => {
    if (!getItems(STORAGE_KEYS.DRIVERS)) setItems(STORAGE_KEYS.DRIVERS, mockDrivers);
    if (!getItems(STORAGE_KEYS.DEPOSITS)) setItems(STORAGE_KEYS.DEPOSITS, mockDeposits);
    if (!getItems(STORAGE_KEYS.REVENUES)) setItems(STORAGE_KEYS.REVENUES, mockRevenues);
    if (mockAdvances && !getItems(STORAGE_KEYS.ADVANCES)) setItems(STORAGE_KEYS.ADVANCES, mockAdvances);
    if (mockExpenses && !getItems(STORAGE_KEYS.EXPENSES)) setItems(STORAGE_KEYS.EXPENSES, mockExpenses);
    if (mockNightShifts && !getItems(STORAGE_KEYS.NIGHT_SHIFTS)) setItems(STORAGE_KEYS.NIGHT_SHIFTS, mockNightShifts);
};

export const driverService = {
    getAll: () => getItems(STORAGE_KEYS.DRIVERS) || [],
    getById: (id) => (getItems(STORAGE_KEYS.DRIVERS) || []).find(d => d.id === id),
    create: (driver) => {
        const drivers = getItems(STORAGE_KEYS.DRIVERS) || [];
        const newDriver = { ...driver, id: generateId() };
        drivers.push(newDriver);
        setItems(STORAGE_KEYS.DRIVERS, drivers);
        return newDriver;
    },
    update: (id, updates) => {
        const drivers = getItems(STORAGE_KEYS.DRIVERS) || [];
        const index = drivers.findIndex(d => d.id === id);
        if (index !== -1) {
            drivers[index] = { ...drivers[index], ...updates };
            setItems(STORAGE_KEYS.DRIVERS, drivers);
            return drivers[index];
        }
        return null;
    },
    delete: (id) => {
        const filtered = (getItems(STORAGE_KEYS.DRIVERS) || []).filter(d => d.id !== id);
        setItems(STORAGE_KEYS.DRIVERS, filtered);
    }
};

export const depositService = {
    getAll: () => getItems(STORAGE_KEYS.DEPOSITS) || [],
    getByDriverId: (driverId) => (getItems(STORAGE_KEYS.DEPOSITS) || []).find(d => d.driverId === driverId),
    create: (deposit) => {
        const deposits = getItems(STORAGE_KEYS.DEPOSITS) || [];
        const newDeposit = { ...deposit, id: generateId() };
        deposits.push(newDeposit);
        setItems(STORAGE_KEYS.DEPOSITS, deposits);
        return newDeposit;
    },
    update: (id, updates) => {
        const deposits = getItems(STORAGE_KEYS.DEPOSITS) || [];
        const index = deposits.findIndex(d => d.id === id);
        if (index !== -1) {
            const updated = { ...deposits[index], ...updates };
            if (updated.paidAmount >= updated.requiredAmount) updated.status = 'paid';
            else if (updated.paidAmount > 0) updated.status = 'partial';
            else updated.status = 'unpaid';
            deposits[index] = updated;
            setItems(STORAGE_KEYS.DEPOSITS, deposits);
            return deposits[index];
        }
        return null;
    },
    delete: (id) => {
        const filtered = (getItems(STORAGE_KEYS.DEPOSITS) || []).filter(d => d.id !== id);
        setItems(STORAGE_KEYS.DEPOSITS, filtered);
    }
};

export const revenueService = {
    getAll: () => getItems(STORAGE_KEYS.REVENUES) || [],
    getByDriverAndMonth: (driverId, month) =>
        (getItems(STORAGE_KEYS.REVENUES) || []).find(r => r.driverId === driverId && r.month === month),
    getByDriver: (driverId) => (getItems(STORAGE_KEYS.REVENUES) || []).filter(r => r.driverId === driverId),
    getByMonth: (month) => (getItems(STORAGE_KEYS.REVENUES) || []).filter(r => r.month === month),
    create: (revenue) => {
        const revenues = getItems(STORAGE_KEYS.REVENUES) || [];
        const newRevenue = { ...revenue, id: generateId() };
        revenues.push(newRevenue);
        setItems(STORAGE_KEYS.REVENUES, revenues);
        return newRevenue;
    },
    update: (id, updates) => {
        const revenues = getItems(STORAGE_KEYS.REVENUES) || [];
        const index = revenues.findIndex(r => r.id === id);
        if (index !== -1) {
            revenues[index] = { ...revenues[index], ...updates };
            setItems(STORAGE_KEYS.REVENUES, revenues);
            return revenues[index];
        }
        return null;
    },
    delete: (id) => {
        const filtered = (getItems(STORAGE_KEYS.REVENUES) || []).filter(r => r.id !== id);
        setItems(STORAGE_KEYS.REVENUES, filtered);
    },
    getTotalByMonth: (month) =>
        (getItems(STORAGE_KEYS.REVENUES) || [])
            .filter(r => r.month === month)
            .reduce((sum, r) => sum + r.amount, 0)
};

// Advance service: { id, driverId, driverName, driverAvatar, date, amount, reason, status, note }
export const advanceService = {
    getAll: () => getItems(STORAGE_KEYS.ADVANCES) || [],
    getByMonth: (month) =>
        (getItems(STORAGE_KEYS.ADVANCES) || []).filter(a => a.date && a.date.startsWith(month)),
    getByDriver: (driverId) =>
        (getItems(STORAGE_KEYS.ADVANCES) || []).filter(a => a.driverId === driverId),
    create: (advance) => {
        const advances = getItems(STORAGE_KEYS.ADVANCES) || [];
        const newAdvance = { ...advance, id: generateId() };
        advances.unshift(newAdvance);
        setItems(STORAGE_KEYS.ADVANCES, advances);
        return newAdvance;
    },
    update: (id, updates) => {
        const advances = getItems(STORAGE_KEYS.ADVANCES) || [];
        const index = advances.findIndex(a => a.id === id);
        if (index !== -1) {
            advances[index] = { ...advances[index], ...updates };
            setItems(STORAGE_KEYS.ADVANCES, advances);
            return advances[index];
        }
        return null;
    },
    delete: (id) => {
        const filtered = (getItems(STORAGE_KEYS.ADVANCES) || []).filter(a => a.id !== id);
        setItems(STORAGE_KEYS.ADVANCES, filtered);
    }
};

// Expense service: { id, date, category, description, amount, note }
export const expenseService = {
    getAll: () => getItems(STORAGE_KEYS.EXPENSES) || [],
    getByMonth: (month) =>
        (getItems(STORAGE_KEYS.EXPENSES) || []).filter(e => e.date && e.date.startsWith(month)),
    create: (expense) => {
        const expenses = getItems(STORAGE_KEYS.EXPENSES) || [];
        const newExpense = { ...expense, id: generateId() };
        expenses.unshift(newExpense);
        setItems(STORAGE_KEYS.EXPENSES, expenses);
        return newExpense;
    },
    update: (id, updates) => {
        const expenses = getItems(STORAGE_KEYS.EXPENSES) || [];
        const index = expenses.findIndex(e => e.id === id);
        if (index !== -1) {
            expenses[index] = { ...expenses[index], ...updates };
            setItems(STORAGE_KEYS.EXPENSES, expenses);
            return expenses[index];
        }
        return null;
    },
    delete: (id) => {
        const filtered = (getItems(STORAGE_KEYS.EXPENSES) || []).filter(e => e.id !== id);
        setItems(STORAGE_KEYS.EXPENSES, filtered);
    }
};

// Night shift service: { id, driverId, driverName, driverAvatar, date, note }
export const nightShiftService = {
    getAll: () => getItems(STORAGE_KEYS.NIGHT_SHIFTS) || [],
    getByMonth: (year, month) => {
        const prefix = `${year}-${String(month).padStart(2, '0')}`;
        return (getItems(STORAGE_KEYS.NIGHT_SHIFTS) || []).filter(s => s.date && s.date.startsWith(prefix));
    },
    getByDate: (date) =>
        (getItems(STORAGE_KEYS.NIGHT_SHIFTS) || []).filter(s => s.date === date),
    create: (shift) => {
        const shifts = getItems(STORAGE_KEYS.NIGHT_SHIFTS) || [];
        const newShift = { ...shift, id: generateId() };
        shifts.push(newShift);
        setItems(STORAGE_KEYS.NIGHT_SHIFTS, shifts);
        return newShift;
    },
    delete: (id) => {
        const filtered = (getItems(STORAGE_KEYS.NIGHT_SHIFTS) || []).filter(s => s.id !== id);
        setItems(STORAGE_KEYS.NIGHT_SHIFTS, filtered);
    }
};

export const clearAllData = () => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
};
