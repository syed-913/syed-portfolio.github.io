export const ADMIN_SESSION_KEY = 'portfolio_admin_session_v2';
export const markAdminSession = () => sessionStorage.setItem(ADMIN_SESSION_KEY, 'active');
export const clearAdminSession = () => sessionStorage.removeItem(ADMIN_SESSION_KEY);
export const hasAdminSession = () => sessionStorage.getItem(ADMIN_SESSION_KEY) === 'active';
