import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Search, Map, User, PlusSquare, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const Layout: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <main className="flex-1 flex flex-col pb-16">
        <Outlet />
      </main>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-neutral-200">
        <div className="flex justify-around px-2 py-2">
          <NavItem to="/search" isActive={isActive('/search')} icon={<Search />} label="Search" />
          <NavItem to="/map" isActive={isActive('/map')} icon={<Map />} label="Map" />
          <NavItem to="/create" isActive={isActive('/create')} icon={<PlusSquare />} label="Create" />
          <NavItem to="/profile" isActive={isActive('/profile')} icon={<User />} label="Profile" />
          <NavItem to="/settings" isActive={isActive('/settings')} icon={<Settings />} label="Settings" />
        </div>
      </nav>
    </div>
  );
};

interface NavItemProps {
  to: string;
  isActive: boolean;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, isActive, icon, label }) => {
  return (
    <Link to={to} className="relative flex flex-col items-center justify-center w-full">
      <div className="relative py-1 px-3">
        {isActive && (
          <motion.div
            layoutId="navIndicator"
            className="absolute inset-0 bg-primary-50 rounded-xl"
            initial={false}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30
            }}
          />
        )}
        <span className={`relative text-2xl ${isActive ? 'text-primary-600' : 'text-neutral-400'}`}>
          {icon}
        </span>
      </div>
      <span className={`text-xs ${isActive ? 'text-primary-600 font-medium' : 'text-neutral-500'}`}>
        {label}
      </span>
    </Link>
  );
};

export default Layout;