// src/app/components/ProtectedRoute.tsx
"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

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
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Not authenticated - redirect to login
      if (!isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      // Check role requirements
      if (requiredRole && user) {
        const hasRequiredRole = Array.isArray(requiredRole) 
          ? requiredRole.includes(user.role)
          : user.role === requiredRole;

        if (!hasRequiredRole) {
          // Redirect based on user's actual role
          switch (user.role) {
            case 'admin':
              router.push('/admin');
              break;
            case 'business_manager':
              router.push('/business-dashboard');
              break;
            default:
              router.push('/unauthorized');
          }
          return;
        }
      }
    }
  }, [isAuthenticated, user, loading, router, requiredRole, redirectTo]);

  // Show loading spinner while checking authentication
  if (loading) {
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

  // Not authenticated
  if (!isAuthenticated) {
    return fallbackComponent || (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="alert alert-warning text-center">
              <h4>Authentication Required</h4>
              <p>Please log in to access this page.</p>
              <button 
                className="btn btn-primary"
                onClick={() => router.push('/login')}
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check role authorization
  if (requiredRole && user) {
    const hasRequiredRole = Array.isArray(requiredRole) 
      ? requiredRole.includes(user.role)
      : user.role === requiredRole;

    if (!hasRequiredRole) {
      return fallbackComponent || (
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="alert alert-danger text-center">
                <h4>Access Denied</h4>
                <p>You don't have permission to access this page.</p>
                <p><strong>Required role:</strong> {Array.isArray(requiredRole) ? requiredRole.join(', ') : requiredRole}</p>
                <p><strong>Your role:</strong> {user.role}</p>
                <button 
                  className="btn btn-secondary"
                  onClick={() => router.push('/')}
                >
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // All checks passed, render children
  return <>{children}</>;
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