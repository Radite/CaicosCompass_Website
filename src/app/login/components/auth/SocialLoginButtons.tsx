import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faFacebookF, faApple } from "@fortawesome/free-brands-svg-icons";
import styles from "@/app/login/login.module.css";
import { API_BASE_URL } from "../constants/authConstants";

export default function SocialLoginButtons() {
  const handleGoogleLogin = () => {
    // Fixed: Changed from /api/auth/google to /api/users/auth/google
    window.location.href = `${API_BASE_URL}/api/users/auth/google`;
  };
  
  const handleFacebookLogin = () => {
    // Fixed: Changed from /api/auth/facebook to /api/users/auth/facebook
    window.location.href = `${API_BASE_URL}/api/users/auth/facebook`;
  };
  
  const handleAppleLogin = () => {
    // Fixed: Changed from /api/auth/apple to /api/users/auth/apple
    window.location.href = `${API_BASE_URL}/api/users/auth/apple`;
  };

  return (
    <div className={styles.socialLogin}>
      <p className={styles.socialText}>Or continue with</p>
      <div className={styles.socialButtons}>
        <button type="button" className={styles.socialBtn} onClick={handleGoogleLogin}>
          <FontAwesomeIcon icon={faGoogle} />
        </button>
        <button type="button" className={styles.socialBtn} onClick={handleFacebookLogin}>
          <FontAwesomeIcon icon={faFacebookF} />
        </button>
        <button type="button" className={styles.socialBtn} onClick={handleAppleLogin}>
          <FontAwesomeIcon icon={faApple} />
        </button>
      </div>
    </div>
  );
}