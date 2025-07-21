import axios from "axios";
import { API_BASE_URL, USER_ROLES, REDIRECT_URLS } from "../constants/authConstants";

// Configure axios defaults
axios.defaults.withCredentials = true;

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
        localStorage.setItem("authToken", token);
        localStorage.setItem("user", JSON.stringify(user));
        
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

// Logout function
export const logout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
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