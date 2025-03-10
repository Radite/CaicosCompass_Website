import axios from "axios";

export const refreshAccessToken = async () => {
  try {
    const response = await axios.post("http://localhost:5000/api/users/refresh", {}, { withCredentials: true });

    if (response.status === 200) {
      const { accessToken } = response.data;
      localStorage.setItem("authToken", accessToken);
      return accessToken;
    }
  } catch (error) {
    console.error("Token refresh failed", error);
    handleLogout(); // Logout user if refresh fails
  }
};

export const handleLogout = async () => {
  try {
    await axios.post("http://localhost:5000/api/users/logout", {}, { withCredentials: true });
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  } catch (error) {
    console.error("Logout failed", error);
  }
};
