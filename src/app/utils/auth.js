import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const refreshAccessToken = async () => {
  try {
    const response = await axios.post(
      `${API_URL}/api/users/refresh`, 
      {}, 
      { withCredentials: true }
    );

    if (response.status === 200) {
      const { accessToken } = response.data;
      localStorage.setItem("authToken", accessToken);
      return accessToken;
    }
  } catch (error) {
    console.error("Token refresh failed", error);
    handleLogout();
  }
};

export const handleLogout = async () => {
  try {
    await axios.post(
      `${API_URL}/api/users/logout`, 
      {}, 
      { withCredentials: true }
    );
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  } catch (error) {
    console.error("Logout failed", error);
  }
};