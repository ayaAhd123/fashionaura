import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

function getDashboardPath(role) {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'boutique_owner') return '/boutique/dashboard';
    return '/';
}

export default function LandingAuthNav({ onNavigate, className = '' }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();

    const handleNav = (path) => {
        onNavigate?.();
        navigate(path);
    };

    const handleLogout = async () => {
        onNavigate?.();
        await logout();
        navigate('/');
    };

    if (isAuthenticated && user) {
        return (
            <div className={`navbar-auth ${className}`.trim()}>
                <button
                    type="button"
                    className="navbar-auth__btn navbar-auth__btn--outline"
                    onClick={() => handleNav(getDashboardPath(user.role))}
                >
                    {user.role === 'admin' && t('landing.auth_admin_space')}
                    {user.role === 'boutique_owner' && t('landing.auth_boutique_space')}
                    {(user.role === 'customer' || user.role === 'client' || !user.role) && t('landing.auth_my_account')}
                </button>
                <button
                    type="button"
                    className="navbar-auth__btn navbar-auth__btn--ghost"
                    onClick={handleLogout}
                >
                    {t('landing.auth_logout')}
                </button>
            </div>
        );
    }

    return (
        <div className={`navbar-auth ${className}`.trim()}>
            <button
                type="button"
                className="navbar-auth__btn navbar-auth__btn--ghost"
                onClick={() => handleNav('/login')}
            >
                {t('landing.auth_login')}
            </button>
            <button
                type="button"
                className="navbar-auth__btn navbar-auth__btn--outline"
                onClick={() => handleNav('/register')}
            >
                {t('landing.auth_signup')}
            </button>
            <span className="navbar-auth__sep navbar-auth__sep--desktop" aria-hidden="true" />
            <button
                type="button"
                className="navbar-auth__btn navbar-auth__btn--link navbar-auth__boutique"
                onClick={() => handleNav('/register?type=boutique')}
            >
                {t('landing.auth_signup_boutique')}
            </button>
        </div>
    );
}
