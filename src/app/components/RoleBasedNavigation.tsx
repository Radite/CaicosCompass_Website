// src/app/components/RoleBasedNavigation.tsx
"use client";
import React from 'react';
import Link from 'next/link';

interface NavItem {
  href: string;
  label: string;
  requiredRole?: string | string[];
  icon?: React.ReactNode;
}

interface RoleBasedNavigationProps {
  navItems: NavItem[];
  currentUserRole?: string;
  className?: string;
}

export function RoleBasedNavigation({ 
  navItems, 
  currentUserRole, 
  className = '' 
}: RoleBasedNavigationProps) {
  const hasAccess = (requiredRole?: string | string[]) => {
    if (!requiredRole) return true; // No role requirement
    if (!currentUserRole) return false; // No user role available
    
    return Array.isArray(requiredRole) 
      ? requiredRole.includes(currentUserRole)
      : currentUserRole === requiredRole;
  };

  const visibleItems = navItems.filter(item => hasAccess(item.requiredRole));

  return (
    <nav className={className}>
      {visibleItems.map((item, index) => (
        <Link 
          key={index} 
          href={item.href}
          className="nav-link"
        >
          {item.icon && <span className="nav-icon">{item.icon}</span>}
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

// Hook for checking user permissions
export function useAuth() {
  const [user, setUser] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    const userData = localStorage.getItem('user');

    if (token && userRole && userData) {
      try {
        setUser({
          ...JSON.parse(userData),
          role: userRole
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const hasRole = (requiredRole: string | string[]) => {
    if (!user?.role) return false;
    return Array.isArray(requiredRole) 
      ? requiredRole.includes(user.role)
      : user.role === requiredRole;
  };

  const canAccess = (path: string) => {
    // Define path-to-role mappings
    const roleRequirements: Record<string, string | string[]> = {
      '/vendor/dashboard': 'business-manager',
      '/admin': 'admin',
      '/admin/dashboard': 'admin',
    };

    const requiredRole = roleRequirements[path];
    return hasRole(requiredRole || []);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    hasRole,
    canAccess
  };
}

// Example usage in your main navigation component
export function MainNavigation() {
  const { user, canAccess } = useAuth();

  const navItems: NavItem[] = [
    { href: '/', label: 'Home' },
    { href: '/search', label: 'Search' },
    { 
      href: '/vendor/dashboard', 
      label: 'Vendor Dashboard',
      requiredRole: 'business-manager'
    },
    { 
      href: '/admin', 
      label: 'Admin Panel',
      requiredRole: 'admin'
    },
  ];

  return (
    <div className="navigation">
      <RoleBasedNavigation 
        navItems={navItems}
        currentUserRole={user?.role}
        className="main-nav"
      />
      
      {/* Alternative approach - conditional rendering */}
      <div className="alternative-nav">
        <Link href="/">Home</Link>
        <Link href="/search">Search</Link>
        
        {canAccess('/vendor/dashboard') && (
          <Link href="/vendor/dashboard">Vendor Dashboard</Link>
        )}
        
        {canAccess('/admin') && (
          <Link href="/admin">Admin Panel</Link>
        )}
      </div>
    </div>
  );
}