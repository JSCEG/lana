import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  PiggyBank,
  PieChart,
  LogOut,
  Menu,
  X,
  CreditCard,
  UserCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import ThemeToggle from './ThemeToggle';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/transactions', icon: CreditCard, label: 'Movimientos' },
    { to: '/budgets', icon: PieChart, label: 'Presupuestos' },
    { to: '/savings', icon: PiggyBank, label: 'Ahorros' },
    { to: '/investments', icon: TrendingUp, label: 'Inversiones' },
  ];

  const getPageTitle = () => {
    const currentItem = navItems.find(item => item.to === location.pathname);
    return currentItem ? currentItem.label : 'Finanzas';
  };

  return (
    <div className="min-h-screen bg-[--lana-bg] text-[--lana-text] flex transition-colors duration-300">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 glass fixed h-full z-10">
        <div className="p-6 border-b border-[var(--glass-border)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="https://cdn.sassoapps.com/lana/l_lana.png" alt="Lana Logo" className="w-16 h-16 object-contain drop-shadow-[0_0_8px_rgba(110,231,249,0.8)]" />
            <span className="text-xl font-bold font-heading tracking-wide">Lana</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300",
                  isActive
                    ? "bg-[--lana-cyan]/10 text-[--lana-cyan] shadow-[0_0_15px_rgba(110,231,249,0.2)] border border-[--lana-cyan]/30"
                    : "text-gray-500 dark:text-gray-400 hover:bg-[var(--glass-border)] hover:text-[--lana-text]"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn("w-5 h-5 transition-transform duration-300", isActive && "scale-110 drop-shadow-[0_0_5px_currentColor]")} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[var(--glass-border)] space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Tema</span>
            <ThemeToggle />
          </div>
          
          <div className="pt-2">
            <Link to="/profile" className="flex items-center gap-3 px-4 py-3 mb-2 bg-[var(--glass-bg)] rounded-lg border border-[var(--glass-border)] hover:border-[--lana-cyan]/30 transition-all cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[--lana-violet] to-[--lana-pink] flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                {user?.email?.[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate font-heading group-hover:text-[--lana-cyan] transition-colors">
                  {user?.user_metadata?.full_name || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              </div>
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-[--lana-pink] hover:bg-[--lana-pink]/10 border border-transparent hover:border-[--lana-pink]/30 rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 glass z-20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="https://cdn.sassoapps.com/lana/l_lana.png" alt="Lana Logo" className="w-12 h-12 object-contain" />
          <span className="font-bold font-heading text-lg">Lana</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-500 dark:text-gray-300 hover:bg-[var(--glass-border)] rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-10" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute top-[61px] left-0 right-0 bg-[--lana-bg] border-b border-[var(--glass-border)] shadow-2xl" onClick={e => e.stopPropagation()}>
            <nav className="p-4 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[--lana-cyan]/10 text-[--lana-cyan] border border-[--lana-cyan]/30"
                        : "text-gray-500 dark:text-gray-400 hover:bg-[var(--glass-border)] hover:text-[--lana-text]"
                    )
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              ))}
              <div className="border-t border-[var(--glass-border)] my-2 pt-2">
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-[var(--glass-border)] hover:text-[--lana-text] rounded-lg transition-colors"
                >
                  <UserCircle className="w-5 h-5" />
                  Mi Perfil
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Cerrar Sesión
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col pt-[61px] md:pt-0 transition-all duration-300 ease-in-out">
        <header className="hidden md:flex items-center justify-between px-8 py-6 glass sticky top-0 z-10">
          <h1 className="text-2xl font-bold font-heading tracking-wide drop-shadow-md">{getPageTitle()}</h1>
        </header>
        <div className="flex-1 p-4 md:p-8 overflow-x-hidden text-[--lana-text]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
