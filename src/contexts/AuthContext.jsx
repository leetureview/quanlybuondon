import { createContext, useContext, useEffect, useState } from 'react';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import { auth, db, secondaryAuth } from '../services/firebase';

const AuthContext = createContext(null);

export const ROLES = {
    ADMIN: 'admin',
    USER: 'user',
    INVESTOR: 'investor',
};

export const ROLE_LABELS = {
    admin: 'Quản trị viên',
    user: 'Nhân viên',
    investor: 'Nhà đầu tư',
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const profileRef = doc(db, 'users', firebaseUser.uid);
                    const profileSnap = await getDoc(profileRef);

                    if (profileSnap.exists()) {
                        const profile = profileSnap.data();
                        setUser({ uid: firebaseUser.uid, email: firebaseUser.email, ...profile });
                        setRole(profile.role);
                    } else {
                        // First-ever user → admin, else user
                        const usersSnap = await getDocs(collection(db, 'users'));
                        const assignedRole = usersSnap.empty ? ROLES.ADMIN : ROLES.USER;
                        const profile = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            name: firebaseUser.email.split('@')[0],
                            role: assignedRole,
                            createdAt: new Date().toISOString(),
                        };
                        await setDoc(profileRef, profile);
                        setUser(profile);
                        setRole(assignedRole);
                    }
                } catch {
                    setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
                    setRole(ROLES.USER);
                }
            } else {
                setUser(null);
                setRole(null);
            }
            setLoading(false);
        });
        return unsub;
    }, []);

    const login = (email, password) =>
        signInWithEmailAndPassword(auth, email, password);

    const logout = () => signOut(auth);

    // Admin creates a new account without signing out current session
    const createUser = async (email, password, name, userRole) => {
        const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        await setDoc(doc(db, 'users', cred.user.uid), {
            uid: cred.user.uid,
            email,
            name,
            role: userRole,
            createdAt: new Date().toISOString(),
        });
        await secondaryAuth.signOut();
        return cred.user;
    };

    const updateUserRole = (uid, newRole) =>
        updateDoc(doc(db, 'users', uid), { role: newRole });

    const getAllUsers = async () => {
        const snap = await getDocs(collection(db, 'users'));
        return snap.docs.map(d => d.data());
    };

    return (
        <AuthContext.Provider value={{ user, role, loading, login, logout, createUser, updateUserRole, getAllUsers }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
