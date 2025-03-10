"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { 
  faBook, 
  faUser, 
  faHeart, 
  faQuestionCircle, 
  faSignOutAlt,
  faGift
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import logo2 from "../assets/logo2.png";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInitials, setUserInitials] = useState("JM");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("authToken"); // Get the access token before clearing it
  
      if (!token) {
        console.error("No auth token found.");
        return;
      }
  
      await axios.post(
        "http://localhost:5000/api/users/logout",
        {},
        {
          headers: { Authorization: `Bearer ${token}` }, // Include token in logout request
          withCredentials: true, // Include cookies (refresh token)
        }
      );
  
      localStorage.removeItem("authToken"); // Remove token only after successful logout
      window.location.href = "/login"; // Redirect to login page
    } catch (error) {
      console.error("Logout failed", error);
    }
  };
  
  
  

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light sticky-top" style={{ 
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(10px)",
      boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)" 
    }}>
      <div className="container d-flex align-items-center py-2">
        <Link href="/" className="navbar-brand d-flex align-items-center">
          <Image src={logo2} alt="CaicosCompass Logo" width={60} height={60} className="me-2" />
          <span style={{ 
            color: "#0C54CF", 
            fontWeight: "700", 
            fontSize: "1.5rem",
            letterSpacing: "0.5px"
          }}>
            Caicos<span style={{ color: "#D4AF37" }}>Compass</span>
          </span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav align-items-center">
            {isLoggedIn ? (
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle d-flex align-items-center border-0 bg-transparent"
                  onClick={toggleDropdown}
                  style={{ cursor: "pointer" }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #0C54CF, #D4AF37)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "8px",
                      fontWeight: 600,
                      boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
                    }}
                  >
                    {userInitials}
                  </div>
                  <i className="fa fa-chevron-down"></i>
                </button>
                <ul
                  className={`dropdown-menu dropdown-menu-end ${dropdownOpen ? "show" : ""}`}
                  style={{ 
                    display: dropdownOpen ? "block" : "none",
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    padding: "0.5rem 0"
                  }}
                >
                  <li>
                    <Link href="/profile" className="dropdown-item py-2">
                      <FontAwesomeIcon icon={faUser} className="me-2" style={{ color: "#0C54CF" }} />
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link href="/itinerary" className="dropdown-item py-2">
                      <FontAwesomeIcon icon={faBook} className="me-2" style={{ color: "#0C54CF" }} />
                      Bookings
                    </Link>
                  </li>
                  <li>
                    <Link href="/wishlist" className="dropdown-item py-2">
                      <FontAwesomeIcon icon={faHeart} className="me-2" style={{ color: "#0C54CF" }} />
                      Wishlist
                    </Link>
                  </li>
                  <li>
                    <Link href="/rewards" className="dropdown-item py-2">
                      <FontAwesomeIcon icon={faGift} className="me-2" style={{ color: "#0C54CF" }} />
                      Rewards
                    </Link>
                  </li>
                  <li>
                    <Link href="/help" className="dropdown-item py-2">
                      <FontAwesomeIcon icon={faQuestionCircle} className="me-2" style={{ color: "#0C54CF" }} />
                      Help
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" style={{ margin: "0.5rem 1rem" }} />
                  </li>
                  <li>
                    <button type="button" className="dropdown-item py-2" onClick={handleLogout}>
                      <FontAwesomeIcon icon={faSignOutAlt} className="me-2" style={{ color: "#0C54CF" }} />
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <li className="nav-item">
                <Link 
                  href="/login" 
                  className="nav-link btn btn-outline-primary rounded-pill px-4 py-2"
                  style={{ 
                    borderColor: "#0C54CF",
                    fontWeight: "600",
                    transition: "all 0.3s ease"
                  }}
                >
                  Login / Sign Up
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
