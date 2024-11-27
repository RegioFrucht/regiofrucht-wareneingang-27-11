import React from 'react';
import { ClipboardList, Users, Archive, Search } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navigation = ({ activeTab, setActiveTab }: NavigationProps) => {
  const navItems = [
    { id: 'wareneingang', icon: <ClipboardList className="w-5 h-5" />, text: 'Wareneingang' },
    { id: 'lieferanten', icon: <Users className="w-5 h-5" />, text: 'Lieferanten' },
    { id: 'archiv', icon: <Archive className="w-5 h-5" />, text: 'Archiv' },
    { id: 'suche', icon: <Search className="w-5 h-5" />, text: 'Suche' },
  ];

  return (
    <nav className="flex gap-2 bg-white p-1 rounded-lg shadow-sm border border-gray-200">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === item.id
              ? 'bg-emerald-100 text-emerald-700'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          {item.icon}
          <span className="font-medium">{item.text}</span>
        </button>
      ))}
    </nav>
  );
};