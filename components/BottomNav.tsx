
import React from 'react';
import { Icon } from './icons';

type Page = 'home' | 'saved' | 'profile';

interface BottomNavProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

const NavItem: React.FC<{ icon: 'home' | 'saved' | 'profile'; label: string; isActive: boolean; onClick: () => void }> = ({ icon, label, isActive, onClick }) => {
  const activeClass = 'text-telegram-button';
  const inactiveClass = 'text-telegram-hint';

  return (
    <button onClick={onClick} className="flex flex-col items-center justify-center flex-1 p-2">
      <Icon name={icon} className={`w-7 h-7 mb-0.5 transition-colors ${isActive ? activeClass : inactiveClass}`} />
      <span className={`text-xs transition-colors ${isActive ? activeClass : inactiveClass}`}>{label}</span>
    </button>
  );
};

export const BottomNav: React.FC<BottomNavProps> = ({ activePage, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-telegram-secondary-bg border-t border-white/10 flex justify-around">
      <NavItem icon="home" label="Home" isActive={activePage === 'home'} onClick={() => onNavigate('home')} />
      <NavItem icon="saved" label="Saved" isActive={activePage === 'saved'} onClick={() => onNavigate('saved')} />
      <NavItem icon="profile" label="Profile" isActive={activePage === 'profile'} onClick={() => onNavigate('profile')} />
    </nav>
  );
};
