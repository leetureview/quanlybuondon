import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * @param {string[]} [roles] - if provided, only these roles can access
 * @param {string} [redirect] - where to send unauthorized users (default '/')
 */
export default function ProtectedRoute({ children, roles, redirect = '/' }) {
    const { user, role, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;

    if (roles && !roles.includes(role)) return <Navigate to={redirect} replace />;

    return children;
}
