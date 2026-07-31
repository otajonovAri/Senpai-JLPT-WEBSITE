import { useState, useEffect, Suspense } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useMediaQuery } from '../hooks/useMediaQuery';
import PageLoader from './PageLoader';
import {
  Home, BookOpen, Search, Trophy, User, LogOut,
  Menu, X, Flame, Coins, GraduationCap, Settings,
  BarChart3, BookMarked, Map, ShoppingBag, Languages,
  Headphones, Users, Bell, ClipboardCheck, Star, UserPlus, Award, Bookmark,
  CreditCard, Mic, Gamepad2
} from 'lucide-react';

function getStudentNavItems(t) {
  return [
    { path: '/dashboard', label: t('nav.dashboard'), icon: Home },
    { path: '/roadmap', label: t('nav.roadmap'), icon: Map },
    { path: '/lessons', label: t('nav.lessons'), icon: BookOpen },
    { path: '/dictionary', label: t('nav.dictionary'), icon: Search },
    { path: '/kanji', label: t('nav.kanji'), icon: BookMarked },
    { path: '/hiragana', label: t('nav.kana'), icon: Languages },
    { path: '/podcasts', label: t('nav.podcasts'), icon: Headphones },
    { path: '/study-groups', label: t('nav.studyGroups'), icon: Users },
    { path: '/mock-test', label: t('nav.mockTest'), icon: ClipboardCheck },
    { path: '/review', label: t('nav.review'), icon: Star },
    { path: '/games', label: t('nav.games'), icon: Gamepad2 },
    { path: '/pronunciation', label: t('nav.pronunciation'), icon: Mic },
    { path: '/friends', label: t('nav.friends'), icon: UserPlus },
    { path: '/achievements', label: t('nav.achievements'), icon: Award },
    { path: '/saved', label: t('nav.saved'), icon: Bookmark },
    { path: '/leaderboard', label: t('nav.leaderboard'), icon: Trophy },
    { path: '/shop', label: t('nav.shop'), icon: ShoppingBag },
    { path: '/profile', label: t('nav.profile'), icon: User },
  ];
}

function getAdminNavItems(t) {
  return [
    { path: '/admin', label: t('admin.dashboard'), icon: Home },
    { path: '/admin/vocabulary', label: t('admin.dictionary'), icon: BookOpen },
    { path: '/admin/kanji', label: t('admin.kanji'), icon: BookMarked },
    { path: '/admin/grammar', label: t('admin.grammar'), icon: Map },
    { path: '/admin/lessons', label: t('admin.lessons'), icon: GraduationCap },
    { path: '/admin/shop-items', label: t('admin.shop'), icon: ShoppingBag },
    { path: '/admin/faq', label: t('admin.faq'), icon: Search },
    { path: '/admin/users', label: t('admin.users'), icon: User },
    { path: '/admin/achievements', label: t('admin.achievements'), icon: Award },
    { path: '/admin/subscription-plans', label: t('admin.subscriptions'), icon: CreditCard },
    { path: '/admin/podcasts', label: t('admin.podcasts'), icon: Mic },
    { path: '/admin/mock-tests', label: t('admin.mockTests'), icon: ClipboardCheck },
    { path: '/admin/study-groups', label: t('admin.studyGroups'), icon: Users },
  ];
}

export default function Layout() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 900px)');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAdmin = user?.role === 'Admin' || user?.role === 'SuperAdmin';
  const navItems = isAdmin ? getAdminNavItems(t) : getStudentNavItems(t);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarVisible = !isMobile || sidebarOpen;

  return (
    <div style={styles.container}>
      {/* Mobile header */}
      {isMobile && (
        <header style={styles.header}>
          <button style={styles.menuBtn} className="press" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div style={styles.logo}>
            <span style={styles.logoJp} className="jp">先輩JLPT</span>
            <span style={styles.logoEn}>SenpaiJLPT</span>
          </div>
          <div style={styles.headerRight}>
            <div style={{ ...styles.headerStat, background: 'var(--warning-soft)', color: 'var(--warning-dark)' }}>
              <Flame size={16} color="var(--warning)" className="anim-flame-glow" />
              <span>{user?.currentStreak || 0}</span>
            </div>
            <div style={{ ...styles.headerStat, background: 'var(--accent-soft)', color: 'var(--accent-dark)' }}>
              <Coins size={16} color="var(--accent)" />
              <span>{user?.coins || 0}</span>
            </div>
          </div>
        </header>
      )}

      {/* Sidebar */}
      {isMobile && sidebarOpen && <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />}
      <aside
        style={{
          ...styles.sidebar,
          transform: sidebarVisible ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Brand */}
        <div style={styles.sidebarBrand}>
          <img src="/mascot/logo.png" alt="SenpaiJLPT" style={styles.sidebarLogo} />
          <div>
            <div style={styles.sidebarBrandName}>Senpai<span style={{ color: 'var(--primary)' }}>JLPT</span></div>
            <div style={styles.sidebarBrandJp} className="jp">先輩JLPT</div>
          </div>
        </div>

        {!isAdmin && (
          <div style={styles.sidebarTop}>
            <div style={styles.statsRow}>
              <div style={{ ...styles.miniStat, background: 'var(--warning-soft)' }} title="Streak">
                <Flame size={14} color="var(--warning)" className="anim-flame-glow" />
                <span style={{ ...styles.miniStatVal, color: 'var(--warning-dark)' }}>{user?.currentStreak || 0}</span>
              </div>
              <div style={{ ...styles.miniStat, background: 'var(--accent-soft)' }} title="Tanga">
                <Coins size={14} color="var(--accent)" />
                <span style={{ ...styles.miniStatVal, color: 'var(--accent-dark)' }}>{user?.coins || 0}</span>
              </div>
              <div style={{ ...styles.miniStat, background: 'var(--primary-soft)' }} title="XP">
                <BarChart3 size={14} color="var(--primary-dark)" />
                <span style={{ ...styles.miniStatVal, color: 'var(--primary-dark)' }}>{user?.xp || 0}</span>
              </div>
            </div>
          </div>
        )}

        <nav style={styles.nav}>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className="nav-link"
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              })}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={styles.sidebarBottom}>
          <NavLink to="/notifications" className="nav-link" style={styles.navItem}>
            <Bell size={20} />
            <span>{t('nav.notifications')}</span>
          </NavLink>
          <NavLink to="/settings" className="nav-link" style={styles.navItem}>
            <Settings size={20} />
            <span>{t('nav.settings')}</span>
          </NavLink>
          <button style={styles.logoutBtn} className="press" onClick={handleLogout}>
            <LogOut size={20} />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main
        style={{
          ...styles.main,
          marginLeft: isMobile ? 0 : 'var(--sidebar-width)',
          padding: isMobile ? '16px' : '24px 32px',
          paddingTop: isMobile ? 'calc(var(--nav-height) + 16px)' : '24px',
          paddingBottom: isMobile ? '80px' : '24px',
        }}
      >
        {/* key on pathname re-triggers the entrance animation on every route change */}
        <div key={location.pathname} className="page-transition">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </main>

      {/* Mobile bottom nav */}
      {isMobile && (
        <nav style={styles.bottomNav}>
          {(isAdmin
            ? navItems.slice(0, 5)
            : navItems.filter(i => ['/dashboard', '/lessons', '/dictionary', '/shop', '/profile'].includes(i.path))
          ).map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
              style={({ isActive }) => ({
                ...styles.bottomNavItem,
                ...(isActive ? styles.bottomNavItemActive : {}),
              })}
            >
              <item.icon size={20} />
              <span style={styles.bottomNavLabel}>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      )}

    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: 'var(--nav-height)',
    background: 'var(--bg-card)',
    borderBottom: '1px solid var(--border)',
    padding: '0 16px',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1000,
  },
  menuBtn: {
    background: 'none',
    padding: 8,
    color: 'var(--text)',
    display: 'flex',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  logoJp: {
    fontFamily: 'var(--font-jp)',
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--primary)',
  },
  logoEn: {
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--text)',
  },
  headerRight: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
  },
  headerStat: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 14,
    fontWeight: 800,
    padding: '4px 10px',
    borderRadius: 'var(--radius-full)',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    zIndex: 1001,
    animation: 'fadeIn 0.25s ease-out',
  },
  sidebar: {
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    width: 'var(--sidebar-width)',
    background: 'var(--bg-card)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1002,
    overflowY: 'auto',
  },
  sidebarBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '18px 16px 6px',
  },
  sidebarLogo: {
    width: 42,
    height: 42,
    objectFit: 'contain',
    borderRadius: 12,
  },
  sidebarBrandName: {
    fontSize: 19,
    fontWeight: 900,
    color: 'var(--text)',
    letterSpacing: -0.5,
    lineHeight: 1.1,
  },
  sidebarBrandJp: {
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--text-light)',
    letterSpacing: 1,
  },
  sidebarTop: {
    padding: '12px 16px 14px',
    borderBottom: '1px solid var(--border-light)',
  },
  statsRow: {
    display: 'flex',
    gap: 6,
  },
  miniStat: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    fontSize: 12,
    padding: '6px 4px',
    borderRadius: 'var(--radius-full)',
  },
  miniStatVal: {
    fontWeight: 800,
  },
  miniStatLabel: {
    color: 'var(--text-light)',
  },
  nav: {
    flex: 1,
    padding: '12px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 12px',
    borderRadius: 'var(--radius-md)',
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--text-secondary)',
    border: '2px solid transparent',
    transition: 'all 0.2s',
    textDecoration: 'none',
  },
  navItemActive: {
    background: 'var(--primary-soft)',
    border: '2px solid var(--primary)',
    color: 'var(--primary-dark)',
    fontWeight: 800,
  },
  sidebarBottom: {
    padding: '8px',
    borderTop: '1px solid var(--border-light)',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 'var(--radius-sm)',
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--danger)',
    background: 'none',
    width: '100%',
  },
  main: {
    flex: 1,
    minHeight: '100vh',
    width: '100%',
    maxWidth: '1100px',
  },
  bottomNav: {
    display: 'flex',
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'var(--bg-card)',
    borderTop: '1px solid var(--border)',
    justifyContent: 'space-around',
    padding: '6px 0 env(safe-area-inset-bottom)',
    zIndex: 1000,
  },
  bottomNavItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    padding: '6px 12px',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-light)',
    fontSize: 10,
    textDecoration: 'none',
    transition: 'color 0.2s, background 0.2s',
  },
  bottomNavItemActive: {
    color: 'var(--primary-dark)',
    background: 'var(--primary-soft)',
  },
  bottomNavLabel: {
    fontSize: 10,
    fontWeight: 700,
  },
};
