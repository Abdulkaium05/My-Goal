import React from 'react';
import { Home, Wallet, Timer, Film, Moon } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavItemProps {
  key?: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem = ({ icon: Icon, label, isActive, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center w-full py-2 transition-all duration-300",
      isActive ? "text-accent scale-110" : "text-slate-400 hover:text-slate-200"
    )}
  >
    <Icon size={24} className={cn(isActive && "drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]")} />
    <span className="text-[10px] mt-1 font-medium">{label}</span>
  </button>
);

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar = ({ activeTab, setActiveTab }: NavbarProps) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'finance', icon: Wallet, label: 'Finance' },
    { id: 'recover', icon: Timer, label: 'Recover' },
    { id: 'anime', icon: Film, label: 'Anime' },
    { id: 'prayer', icon: Moon, label: 'Prayer' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2">
      <div className="max-w-md mx-auto glass rounded-2xl flex items-center justify-around px-2 py-1 shadow-2xl border-white/10">
        {tabs.map((tab) => (
          <NavItem
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </div>
    </nav>
  );
};
