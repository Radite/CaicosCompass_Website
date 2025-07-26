// src/app/components/ProtectedRoute.tsx
"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  redirectTo?: string;
  fallbackComponent?: React.ReactNode;
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  redirectTo?: string;
  fallbackComponent?: React.ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole = null,
  redirectTo = '/login',
  fallbackComponent = null
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const storedUserRole = localStorage.getItem('userRole');
      const storedUser = localStorage.getItem('user');

      console.log('🔐 ProtectedRoute Auth Check:');
      console.log('Token exists:', !!token);
      console.log('User role:', storedUserRole);

      // Not authenticated at all
      if (!token || !storedUserRole) {
        console.log('❌ No token or role, redirecting to login');
        router.replace(redirectTo);
        return;
      }

      setUserRole(storedUserRole);

      // Check role requirements
      if (requiredRole) {
        const hasRequiredRole = Array.isArray(requiredRole) 
          ? requiredRole.includes(storedUserRole)
          : storedUserRole === requiredRole;

        if (!hasRequiredRole) {
          console.log('❌ Role mismatch. Required:', requiredRole, 'Got:', storedUserRole);
          
          // Instead of showing access denied, redirect to appropriate dashboard
          switch (storedUserRole) {
            case 'admin':
              router.replace('/admin');
              break;
            case 'business-manager':
              router.replace('/vendor/dashboard');
              break;
            case 'user':
            default:
              router.replace('/');
              break;
          }
          return;
        }
      }

      console.log('✅ Auth check passed');
      setIsAuthorized(true);
    };

    checkAuth();
  }, [router, requiredRole, redirectTo]);

  // Show loading while checking
  if (isAuthorized === null) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Verifying access...</p>
        </div>
      </div>
    );
  }

  // User is authorized
  if (isAuthorized) {
    return <>{children}</>;
  }

  // Fallback (shouldn't reach here due to redirects, but just in case)
  return fallbackComponent || (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="alert alert-danger text-center">
            <h4>Access Denied</h4>
            <p>You don't have permission to access this page.</p>
            <button 
              className="btn btn-primary"
              onClick={() => router.push('/')}
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// HOC version for easier component wrapping
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredRole?: string | string[]
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute requiredRole={requiredRole}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };
}

// Specific role-based HOCs for convenience
export const withAdminAuth = <P extends object>(Component: React.ComponentType<P>) =>
  withAuth(Component, 'admin');

export const withBusinessAuth = <P extends object>(Component: React.ComponentType<P>) =>
  withAuth(Component, 'business_manager');

export const withAnyAuth = <P extends object>(Component: React.ComponentType<P>) =>
  withAuth(Component);