import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Upload, BarChart3, ShieldCheck } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Upload Heritage', path: '/upload', icon: Upload },
    { name: 'Benchmarks', path: '/benchmarks', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <header className="bg-heritage-slate text-stone-100 border-b-4 border-heritage-gold sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-10 h-10 text-heritage-gold" />
            <div>
              <h1 className="text-2xl font-serif tracking-tight m-0 text-stone-50">VietHeritage-QSafe</h1>
              <p className="text-xs text-stone-400 font-sans tracking-widest uppercase">Quantum-Safe Digital Archive</p>
            </div>
          </div>
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-2 text-sm font-medium transition-colors duration-200",
                    isActive ? "text-heritage-gold" : "text-stone-300 hover:text-stone-100"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-stone-100 border-t border-stone-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-stone-500 text-sm">
            VietHeritage-QSafe Research Prototype &copy; 2024. 
            Built for Quantum-Safe Cultural Heritage Preservation.
          </p>
          <div className="mt-2 flex justify-center space-x-4 text-xs text-stone-400">
            <span>FastAPI</span>
            <span>React</span>
            <span>Tailwind</span>
            <span>Post-Quantum ML-DSA Demo</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
