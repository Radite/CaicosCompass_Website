// middleware.ts (in your root directory)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get auth information from cookies or headers
  const token = request.cookies.get('authToken')?.value;
  const userRole = request.cookies.get('userRole')?.value;
  
  // Define protected routes and their required roles
  const protectedRoutes: Record<string, string | string[]> = {
    '/vendor/dashboard': 'business-manager',
    '/vendor': 'business-manager',
    '/admin': 'admin',
    '/admin/dashboard': 'admin',
  };

  // Check if current path is protected
  const requiredRole = Object.entries(protectedRoutes).find(([route]) => 
    pathname.startsWith(route)
  )?.[1];

  if (requiredRole) {
    // No token - redirect to login
    if (!token || !userRole) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check role authorization
    const hasAccess = Array.isArray(requiredRole) 
      ? requiredRole.includes(userRole)
      : userRole === requiredRole;

    if (!hasAccess) {
      // Redirect to appropriate dashboard based on user role
      let redirectPath = '/';
      switch (userRole) {
        case 'admin':
          redirectPath = '/admin';
          break;
        case 'business-manager':
          redirectPath = '/vendor/dashboard';
          break;
        case 'user':
        default:
          redirectPath = '/';
          break;
      }
      
      // Don't redirect if already at the correct path
      if (pathname !== redirectPath) {
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/vendor/:path*',
    '/admin/:path*',
    // Add other protected routes as needed
  ]
};

// Alternative: Update your authService.js to set cookies
// src/app/login/components/services/authService.js
import axios from "axios";

export const login = async ({ email, password }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/users/login`, {
      email,
      password
    });

    if (response.status === 200 && response.data) {
      const { token, user } = response.data;

      if (token) {
        // Set localStorage (for client-side)
        localStorage.setItem("authToken", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userRole", user.role);

        // Set cookies (for middleware)
        document.cookie = `authToken=${token}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
        document.cookie = `userRole=${user.role}; path=/; max-age=${7 * 24 * 60 * 60}`;

        // Determine redirect based on role
        switch (user.role) {
          case 'admin':
            return { success: true, redirectUrl: '/admin' };
          case 'business-manager':
            return { 
              success: true, 
              redirectUrl: user.businessProfile?.isApproved 
                ? '/vendor/dashboard' 
                : '/vendor/pending-approval'
            };
          case 'user':
          default:
            return { success: true, redirectUrl: '/' };
        }
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Login failed' 
    };
  }
};

export const logout = () => {
  // Clear localStorage
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  localStorage.removeItem("userRole");
  
  // Clear cookies
  document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  
  window.location.href = '/login';
};