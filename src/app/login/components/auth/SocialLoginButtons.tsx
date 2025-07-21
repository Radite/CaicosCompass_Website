import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faFacebookF, faApple } from "@fortawesome/free-brands-svg-icons";
import styles from "@/app/login/login.module.css";
import { API_BASE_URL } from "../constants/authConstants";

export default function SocialLoginButtons() {
  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };
  
  const handleFacebookLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/facebook`;
  };
  
  const handleAppleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/apple`;
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