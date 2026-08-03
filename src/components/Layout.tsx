import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserPlus, 
  Users, 
  ClipboardList, 
  Settings, 
  Eye, 
  Search,
  Menu,
  X,
  Printer,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/', label: 'لوحة التحكم' },
    { name: 'New Exam', icon: Eye, path: '/exam/new', label: 'فحص جديد' },
    { name: 'Patients', icon: Users, path: '/patients', label: 'السجلات' },
    { name: 'Analytics', icon: ClipboardList, path: '/analytics', label: 'التحليلات' },
    { name: 'Settings', icon: Settings, path: '/settings', label: 'الإعدادات' },
  ];

  return (
    <div className="min-h-screen bg-[#f0f4f8] text-slate-800 font-sans selection:bg-sky-100" dir="rtl">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isSidebarOpen ? (isMobile ? '240px' : '220px') : '0px',
          x: isSidebarOpen ? 0 : 240
        }}
        className={cn(
          "fixed top-0 right-0 bottom-0 bg-white border-l border-slate-200 z-50 overflow-hidden transition-all duration-300",
          !isSidebarOpen && "border-none"
        )}
      >
        <div className="flex flex-col h-full w-[220px]">
          {/* Logo */}
          <div className="p-8 pb-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              V
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight leading-none">SVA PRO</h1>
              <p className="text-[10px] text-sky-600 font-bold uppercase tracking-widest mt-1">Eye Analyzer</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium",
                  isActive 
                    ? "bg-sky-50 text-sky-700 font-bold" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                )}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Bottom Profile */}
          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-slate-300 overflow-hidden flex items-center justify-center text-white text-xs font-bold">
                NN
              </div>
              <div className="overflow-hidden">
                <p className="text-[11px] font-bold truncate"> </p>
                <p className="text-[9px] text-slate-400 font-medium">أخصائي بصريات</p>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main 
        className={cn(
          "transition-all duration-300 min-h-screen flex flex-col",
          isSidebarOpen && !isMobile ? "mr-[220px]" : "mr-0"
        )}
      >
        {/* Header */}
        <header className="px-8 py-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-1">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 transition-colors"
              >
                <Menu size={20} />
              </button>
              <h2 className="text-2xl font-bold tracking-tight">لوحة التحكم الذكية</h2>
            </div>
            <p className="text-slate-500 text-sm mr-10"> : تطبيق فحص النظر الذكي  </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="بحث برقم الهاتف..."
                className="bg-white border border-slate-200 rounded-xl py-2 pr-9 pl-4 w-64 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <button className="px-5 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors">
              حفظ السجل
            </button>
          </div>
        </header>

        <div className="px-8 flex-grow overflow-hidden">
          {children}
        </div>

        {/* Footer */}
        <footer className="mt-auto px-8 pb-6 flex justify-between text-[10px] font-medium text-slate-400">
           <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg border border-slate-200">
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> متصل بقاعدة البيانات</span>
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-sky-500 rounded-full"></div> محرك التشخيص v1.0</span>
          </div>
          <div className="flex items-center gap-1 self-center">
             <span>Smart Vision Analyzer Pro © 2026</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
