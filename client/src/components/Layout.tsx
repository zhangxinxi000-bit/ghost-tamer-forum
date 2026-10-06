import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import {
  Home,
  MessageSquare,
  Target,
  AlertTriangle,
  Handshake,
  Bell,
  LogIn,
  UserPlus,
  LogOut,
  User,
  Shield,
  FileText,
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
}

const navItems: NavItem[] = [
  { to: '/', label: '首页', icon: <Home size={16} />, end: true },
  {
    to: '/board/intelligence',
    label: '情报交流区',
    icon: <MessageSquare size={16} />,
  },
  { to: '/bounties', label: '悬赏榜', icon: <Target size={16} /> },
  { to: '/wanted', label: '通缉令', icon: <AlertTriangle size={16} /> },
  { to: '/trades', label: '交易区', icon: <Handshake size={16} /> },
  { to: '/announcements', label: '论坛公告', icon: <Bell size={16} /> },
  { to: '/hq', label: '总部专区', icon: <Shield size={16} /> },
  { to: '/applications', label: '申请中心', icon: <FileText size={16} /> },
];

const SidebarContent: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (): void => {
    logout();
    navigate('/');
  };

  return (
    <aside className="w-[220px] flex-shrink-0 bg-[#0f0f0f] border-r border-[#1f1f1f] flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-[#1f1f1f]">
        <Link to="/" className="block">
          <h1 className="text-base font-bold text-[#d4af37] tracking-wide">
            驭鬼者情报站
          </h1>
          <p className="mt-1 text-xs text-[#737373]">灵异论坛 · 机密</p>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3">
        <ul className="space-y-0.5">
          {navItems.map((item: NavItem) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }: { isActive: boolean }) =>
                  `flex items-center gap-3 text-sm transition-colors border-l-2 pl-4 py-2 ${
                    isActive
                      ? 'text-[#d4af37] border-[#d4af37] pl-[14px] bg-[#141414]'
                      : 'text-[#a3a3a3] border-transparent hover:text-[#e5e5e5] hover:bg-[#141414]'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User area */}
      <div className="border-t border-[#1f1f1f] pt-4 pb-4 px-4">
        {user ? (
          <div className="space-y-3">
            <Link
              to={`/profile/${user.username}`}
              className="flex items-center gap-2 text-sm text-[#e5e5e5] hover:text-[#d4af37] transition-colors"
            >
              <User size={16} className="text-[#a3a3a3]" />
              <span className="truncate">{user.displayName}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-[#737373] hover:text-[#dc2626] transition-colors w-full"
            >
              <LogOut size={16} />
              <span>登出</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-sm">
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-[#a3a3a3] hover:text-[#d4af37] transition-colors"
            >
              <LogIn size={16} />
              <span>登录</span>
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-1.5 text-[#a3a3a3] hover:text-[#d4af37] transition-colors"
            >
              <UserPlus size={16} />
              <span>注册</span>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
};

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-[#e5e5e5]">
      <AuthProvider>
        <SidebarContent />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </AuthProvider>
    </div>
  );
};

export default Layout;
