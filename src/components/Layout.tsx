import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  PiggyBank,
  PieChart,
  LogOut,
  Menu,
  X,
  CreditCard
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
    <div className="min-h-screen bg-[#0B0F1A] text-white flex transition-colors duration-300 bg-[url('https://cdn.sassoapps.com/lana/lanabg.png')] bg-cover bg-fixed">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0B0F1A]/80 backdrop-blur-[20px] border-r border-white/10 fixed h-full z-10">
        <div className="p-6 border-b border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="https://cdn.sassoapps.com/lana/lanalogo.png" alt="Lana Logo" className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(110,231,249,0.8)]" />
            <span className="text-xl font-bold text-white font-heading tracking-wide">Lana</span>
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
                    ? "bg-white/10 text-[#6EE7F9] shadow-[0_0_15px_rgba(110,231,249,0.2)] border border-[#6EE7F9]/30"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
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

        <div className="p-4 border-t border-white/10 space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-sm text-gray-400">Tema</span>
            <ThemeToggle />
          </div>
          
          <div className="pt-2">
            <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-white/5 rounded-lg border border-white/5 hover:border-white/20 transition-all">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#A78BFA] to-[#F472B6] flex items-center justify-center text-white font-bold shadow-lg">
                {user?.email?.[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate font-heading">
                  {user?.user_metadata?.full_name || 'Usuario'}
                </p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-[#0B0F1A]/80 backdrop-blur-[20px] border-b border-white/10 z-20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="https://cdn.sassoapps.com/lana/lanalogo.png" alt="Lana Logo" className="w-8 h-8 object-contain" />
          <span className="font-bold text-white font-heading text-lg">Lana</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-300 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-10" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute top-[61px] left-0 right-0 bg-[#0B0F1A] border-b border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
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
                        ? "bg-white/10 text-[#6EE7F9] border border-[#6EE7F9]/30"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    )
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              ))}
              <div className="border-t border-white/10 my-2 pt-2">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
        <header className="hidden md:flex items-center justify-between px-8 py-6 bg-[#0B0F1A]/50 backdrop-blur-sm border-b border-white/5 sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-white font-heading tracking-wide drop-shadow-md">{getPageTitle()}</h1>
        </header>
        <div className="flex-1 p-4 md:p-8 overflow-x-hidden text-white">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
