'use client'

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthUser, UserRole, NavItem } from '@/lib/types';
import { canAccessRoute } from '@/lib/auth';

interface RoleBasedNavProps {
  user: AuthUser | null;
}

const navigationItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: '📊',
    roles: ['super_admin', 'dealer_admin', 'sales_manager', 'sales_rep']
  },
  {
    label: 'Dealers',
    href: '/admin/dealers',
    icon: '🏢',
    roles: ['super_admin']
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: '👥',
    roles: ['super_admin', 'dealer_admin']
  },
  {
    label: 'Inventory',
    href: '/admin/inventory',
    icon: '🚗',
    roles: ['super_admin', 'dealer_admin', 'sales_manager']
  },
  {
    label: 'Leads',
    href: '/admin/leads',
    icon: '📋',
    roles: ['super_admin', 'dealer_admin', 'sales_manager', 'sales_rep']
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: '📈',
    roles: ['super_admin', 'dealer_admin', 'sales_manager']
  },
  {
    label: 'Billing',
    href: '/admin/billing',
    icon: '💳',
    roles: ['super_admin', 'dealer_admin']
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: '⚙️',
    roles: ['super_admin', 'dealer_admin']
  }
];

export default function RoleBasedNav({ user }: RoleBasedNavProps) {
  const pathname = usePathname();

  if (!user) {
    return null;
  }

  const filteredNavItems = navigationItems.filter(item => 
    item.roles.includes(user.role) && canAccessRoute(user, item.href)
  );

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/admin/dashboard" className="text-xl font-bold text-gray-900">
                {user.dealer_name} Admin
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {filteredNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Logged in as:</span>
              <span className="text-sm font-medium text-gray-900">{user.name}</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {getRoleDisplayName(user.role)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    'super_admin': 'SMA',
    'dealer_admin': 'DA',
    'sales_manager': 'SM',
    'sales_rep': 'SR'
  };
  return roleNames[role] || role;
}
