import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative text-slate-900 overflow-x-hidden">
      
      {/* Premium subtle background accents */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-cyan-100/30 rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute top-40 left-0 w-[600px] h-[500px] bg-blue-100/30 rounded-full blur-[100px] opacity-50"></div>
      </div>

      {/* Navbar fixed at top */}
      <div className="sticky top-0 z-50">
        <Navbar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
