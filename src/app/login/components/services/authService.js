import axios from "axios";
import { API_BASE_URL, USER_ROLES, REDIRECT_URLS } from "../constants/authConstants";

// Configure axios defaults
axios.defaults.withCredentials = true;

// Helper function to set cookies
const setCookie = (name, value, days = 7) => {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
};

// Helper function to delete cookies
const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};

// Login function
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
        setCookie("authToken", token, 7); // 7 days
        setCookie("userRole", user.role, 7);

        // Determine redirect URL based on user role
        let redirectUrl = REDIRECT_URLS.USER;

        switch (user.role) {
          case USER_ROLES.ADMIN:
            redirectUrl = REDIRECT_URLS.ADMIN;
            break;
          case USER_ROLES.BUSINESS_MANAGER:
            redirectUrl = user.businessProfile?.isApproved
              ? REDIRECT_URLS.BUSINESS_APPROVED
              : REDIRECT_URLS.BUSINESS_PENDING;
            break;
          default:
            redirectUrl = REDIRECT_URLS.USER;
        }

        return {
          success: true,
          user,
          token,
          redirectUrl
        };
      }

      return {
        success: false,
        message: 'Authentication token is missing'
      };
    }

    return {
      success: false,
      message: response.data.message || 'Invalid login credentials'
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message: error.response?.data?.message || 'An error occurred during login'
    };
  }
};

// Regular user registration
export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/users/register`, userData);
    
    if (response.status === 201 && response.data) {
      return { 
        success: true, 
        message: response.data.message 
      };
    }
    
    return { 
      success: false, 
      message: response.data.message || 'Registration failed' 
    };
  } catch (error) {
    console.error("Registration error:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'An error occurred during registration' 
    };
  }
};

// Business registration
export const registerBusiness = async (businessData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/users/register`, businessData);
    
    if (response.status === 201 && response.data) {
      return { 
        success: true, 
        message: response.data.message 
      };
    }
    
    return { 
      success: false, 
      message: response.data.message || 'Business registration failed' 
    };
  } catch (error) {
    console.error("Business registration error:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'An error occurred during business registration' 
    };
  }
};

// Updated logout function
export const logout = () => {
  // Clear localStorage
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
  localStorage.removeItem("userRole");
  
  // Clear cookies
  deleteCookie("authToken");
  deleteCookie("userRole");
  
  window.location.href = "/login";
};

// Get current user
export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

// Get auth token
export const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Initialize session (for AuthContext if you're using it)
export const initializeSession = async () => {
  const token = getAuthToken();
  const user = getCurrentUser();
  
  if (token && user) {
    return {
      isAuthenticated: true,
      user
    };
  }
  
  return {
    isAuthenticated: false,
    user: null
  };
};

// Token refresh functionality (optional - for advanced setups)
export const refreshAccessToken = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/users/refresh`, {}, { 
      withCredentials: true 
    });

    if (response.status === 200) {
      const { accessToken } = response.data;
      localStorage.setItem("authToken", accessToken);
      setCookie("authToken", accessToken, 7);
      return accessToken;
    }
  } catch (error) {
    console.error("Token refresh failed", error);
    logout(); // Logout user if refresh fails
  }
};

// Handle logout (for server communication if needed)
export const handleLogout = async () => {
  try {
    await axios.post(`${API_BASE_URL}/api/users/logout`, {}, { 
      withCredentials: true 
    });
  } catch (error) {
    console.error("Logout API call failed", error);
  } finally {
    logout(); // Always clear local data
  }
};

// Timer functions for token refresh (optional - for advanced setups)
export const startTokenRefreshTimer = () => {
  // Refresh token every 50 minutes (assuming 1-hour expiry)
  return setInterval(() => {
    refreshAccessToken();
  }, 50 * 60 * 1000);
};

export const stopTokenRefreshTimer = (timerId) => {
  if (timerId) {
    clearInterval(timerId);
  }
};