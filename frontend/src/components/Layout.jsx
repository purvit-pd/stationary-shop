import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  LayoutDashboard, BookOpen, Users, Package, ShoppingCart,
  ArrowLeftRight, BarChart3, FileSpreadsheet, LogOut, Menu, X,
  BookUp, ChevronDown
} from 'lucide-react';

const navItems = [
  { section: 'Dashboard', items: [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  ]},
  { section: 'Masters', items: [
    { label: 'Standards', path: '/standards', icon: BookUp },
    { label: 'Books', path: '/books', icon: BookOpen },
    { label: 'Suppliers', path: '/suppliers', icon: Users },
  ]},
  { section: 'Transactions', items: [
    { label: 'Purchase Entry', path: '/purchases', icon: Package },
    { label: 'Billing', path: '/sales', icon: ShoppingCart },
    { label: 'Returns', path: '/returns', icon: ArrowLeftRight },
  ]},
  { section: 'Reports', items: [
    { label: 'Stock Report', path: '/reports/stock', icon: BarChart3 },
    { label: 'Sales Report', path: '/reports/sales', icon: FileSpreadsheet },
    { label: 'Purchase Report', path: '/reports/purchases', icon: FileSpreadsheet },
  ]},
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <Link to="/" className="text-lg font-bold text-gray-900">Stationery Shop</Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden"><X className="h-5 w-5" /></button>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {navItems.map((group) => (
            <div key={group.section}>
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">{group.section}</div>
              {group.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 pr-3 border-r">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm leading-tight">
                <p className="font-medium text-gray-900">{user?.name || 'Admin'}</p>
                <p className="text-gray-500 text-xs">{user?.email}</p>
              </div>
            </div>
            <Button variant="outline" size="icon" onClick={handleLogout} title="Logout" className="h-9 w-9 text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
