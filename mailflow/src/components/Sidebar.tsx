'use client';

import Link from 'next/link';
import { Home, Edit, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Compose', href: '/emails/new', icon: Edit },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6 text-2xl font-bold border-b border-gray-800">
        MailFlow
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                isActive ? 'bg-blue-600' : 'hover:bg-gray-800'
              }`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
