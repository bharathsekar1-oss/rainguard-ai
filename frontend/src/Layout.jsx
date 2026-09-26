import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Map, Brain, AlertTriangle, Clock, Info, Shield, Menu, X } from 'lucide-react';

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/map', label: 'Risk Map', icon: Map },
    { path: '/prediction', label: 'Prediction', icon: Brain },
    { path: '/alerts', label: 'Alerts', icon: AlertTriangle },
    { path: '/history', label: 'History', icon: Clock },
    { path: '/about', label: 'About', icon: Info },
  ];

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-slate-900 text-slate-300 font-sans">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700 bg-slate-900 md:bg-slate-800">
          <div className="flex items-center space-x-2 text-white">
            <Shield className="w-8 h-8 text-blue-500" />
            <span className="text-xl font-bold">RainGuard AI</span>
          </div>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={closeMenu}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMenu}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between h-16 px-4 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center space-x-2 text-white">
            <Shield className="w-6 h-6 text-blue-500" />
            <span className="text-lg font-bold">RainGuard AI</span>
          </div>
          <button className="text-slate-400 hover:text-white" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
