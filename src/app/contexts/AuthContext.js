// AuthContext.js - Context provider for managing authentication state
"use client";

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  initializeSession, 
  startTokenRefreshTimer, 
  stopTokenRefreshTimer,
  getCurrentUser,
  isAuthenticated as checkIsAuthenticated,
  handleLogout 
} from '../login/components/services/authService';

// Create context
const AuthContext = createContext();

// Auth action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  SESSION_EXPIRED: 'SESSION_EXPIRED'
};

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        loading: false,
        error: null
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null
      };
    
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: action.payload
      };
    
    case AUTH_ACTIONS.SESSION_EXPIRED:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: 'Session expired. Please log in again.'
      };
    
    default:
      return state;
  }
};

// Auth Context Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  let refreshTimerId = null;

  // Initialize session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
        
        const { isAuthenticated, user } = await initializeSession();
        
        if (isAuthenticated && user) {
          dispatch({ 
            type: AUTH_ACTIONS.LOGIN_SUCCESS, 
            payload: { user } 
          });
          
          // Start token refresh timer
          refreshTimerId = startTokenRefreshTimer();
        } else {
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } catch (error) {
        console.error('Session initialization failed:', error);
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      } finally {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    initAuth();

    // Cleanup function
    return () => {
      if (refreshTimerId) {
        stopTokenRefreshTimer(refreshTimerId);
      }
    };
  }, []);

  // Listen for storage changes (for multi-tab logout)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'authToken' && !e.newValue) {
        // Token was removed, user logged out in another tab
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
        if (refreshTimerId) {
          stopTokenRefreshTimer(refreshTimerId);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Auth methods
  const login = (user) => {
    dispatch({ 
      type: AUTH_ACTIONS.LOGIN_SUCCESS, 
      payload: { user } 
    });
    
    // Start token refresh timer
    refreshTimerId = startTokenRefreshTimer();
  };

  const logout = async () => {
    try {
      await handleLogout();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      
      if (refreshTimerId) {
        stopTokenRefreshTimer(refreshTimerId);
        refreshTimerId = null;
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Force local logout even if server call fails
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  const updateUser = (updatedUser) => {
    dispatch({ 
      type: AUTH_ACTIONS.UPDATE_USER, 
      payload: updatedUser 
    });
    
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const checkAuthStatus = () => {
    const isAuth = checkIsAuthenticated();
    const currentUser = getCurrentUser();
    
    if (!isAuth || !currentUser) {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      return false;
    }
    
    return true;
  };

  // Context value
  const value = {
    ...state,
    login,
    logout,
    updateUser,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// HOC for protected routes
export const withAuth = (WrappedComponent) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};