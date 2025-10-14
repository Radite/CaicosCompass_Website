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
  faGift,
  faStore,
  faChartLine,
  faCoins,
  faShoppingCart,
  faUserShield // NEW: For admin icon
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import logo2 from "../assets/logo2.png";
import { useSafeCart } from "../hooks/useSafeCart";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const { isAuthenticated: authContextIsAuthenticated } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInitials, setUserInitials] = useState("JM");
  const [userRole, setUserRole] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [vendorData, setVendorData] = useState(null);
  const [caicosCredits, setCaicosCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const { itemCount } = useSafeCart();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRole");
    
    if (token) {
      setIsLoggedIn(true);
      setUserRole(role || "");
      
      if (role === 'business-manager') {
        fetchVendorData();
      } else if (role === 'admin') {
        fetchAdminData(); // NEW: Separate fetch for admins
      } else {
        fetchUserData();
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const [profileResponse, creditsResponse] = await Promise.all([
        axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/profile`,
          { headers: getAuthHeaders() }
        ),
        axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/caicos-credits`,
          { headers: getAuthHeaders() }
        )
      ]);
      
      if (profileResponse.data.name) {
        const names = profileResponse.data.name.split(' ');
        const initials = names.map(name => name.charAt(0).toUpperCase()).join('').substring(0, 2);
        setUserInitials(initials);
      }
      
      setCaicosCredits(creditsResponse.data.caicosCredits || 0);
      
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorData = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/profile`,
        { headers: getAuthHeaders() }
      );
      setVendorData(response.data);
      
      if (response.data.name) {
        const names = response.data.name.split(' ');
        const initials = names.map(name => name.charAt(0).toUpperCase()).join('').substring(0, 2);
        setUserInitials(initials);
      }
    } catch (error) {
      console.error('Error fetching vendor data:', error);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Fetch admin data
  const fetchAdminData = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/profile`,
        { headers: getAuthHeaders() }
      );
      
      if (response.data.name) {
        const names = response.data.name.split(' ');
        const initials = names.map(name => name.charAt(0).toUpperCase()).join('').substring(0, 2);
        setUserInitials(initials);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("authToken");
  
      if (!token) {
        console.error("No auth token found.");
        return;
      }
  
      await axios.post(
        "http://localhost:5000/api/users/logout",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
  
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleVendorDashboard = () => {
    router.push("/vendor/dashboard");
  };

  // NEW: Handle admin dashboard
  const handleAdminDashboard = () => {
    router.push("/admin/dashboard");
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleCartClick = () => {
    if (!authContextIsAuthenticated) {
      router.push('/login?redirect=/cart');
    } else {
      router.push('/cart');
    }
  };

  const CartIcon = () => (
    <button
      onClick={handleCartClick}
      className="btn position-relative border-0 bg-transparent"
      style={{
        padding: "8px 12px",
        marginRight: "10px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "visible"
      }}
      title={authContextIsAuthenticated ? `Cart (${itemCount} items)` : "Cart (Login required)"}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = "scale(1.1)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <FontAwesomeIcon 
        icon={faShoppingCart} 
        size="lg"
        style={{ color: "#0C54CF" }}
      />
      {authContextIsAuthenticated && itemCount > 0 && (
        <span 
          className="badge rounded-pill"
          style={{
            position: "absolute",
            top: "-5px",
            right: "-8px",
            background: "linear-gradient(135deg, #ef4444, #dc2626)",
            color: "white",
            fontSize: "0.65rem",
            fontWeight: "700",
            padding: "0.3em 0.5em",
            boxShadow: "0 2px 6px rgba(220, 38, 38, 0.4)",
            border: "2px solid white",
            minWidth: "20px",
            lineHeight: "1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );

  // NEW: Admin interface - NO credits, NO cart
  const renderAdminInterface = () => (
    <>
      <li className="nav-item d-flex align-items-center">
        <button
          onClick={handleAdminDashboard}
          className="btn d-flex align-items-center border-0 bg-transparent"
          style={{ cursor: "pointer" }}
          title="Admin Dashboard"
        >
          <div
            style={{
              width: 45,
              height: 45,
              borderRadius: "8px",
              background: "linear-gradient(135deg, #DC2626, #991B1B)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "10px",
              fontWeight: 600,
              boxShadow: "0 4px 15px rgba(220, 38, 38, 0.3)",
              transition: "all 0.3s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(220, 38, 38, 0.4)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(220, 38, 38, 0.3)";
            }}
          >
            <FontAwesomeIcon icon={faUserShield} size="lg" />
          </div>
          <div className="d-flex flex-column align-items-start">
            <span style={{ 
              color: "#DC2626", 
              fontWeight: "600", 
              fontSize: "0.9rem",
              lineHeight: "1.2"
            }}>
              Admin Panel
            </span>
            <span style={{ 
              color: "#666", 
              fontSize: "0.75rem",
              lineHeight: "1"
            }}>
              System Administrator
            </span>
          </div>
        </button>
      </li>
    </>
  );

  // UPDATED: Vendor interface - NO credits, NO cart
  const renderVendorInterface = () => {
    const businessName = vendorData?.businessProfile?.businessName || "Business Portal";
    const businessLogo = vendorData?.businessProfile?.logo;
    
    return (
      <>
        {/* REMOVED: Cart Icon for vendors */}
        
        <li className="nav-item d-flex align-items-center">
          <button
            onClick={handleVendorDashboard}
            className="btn d-flex align-items-center border-0 bg-transparent"
            style={{ cursor: "pointer" }}
            title="Vendor Dashboard"
          >
            <div
              style={{
                width: 45,
                height: 45,
                borderRadius: "8px",
                background: businessLogo ? "transparent" : "linear-gradient(135deg, #0C54CF, #D4AF37)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "10px",
                fontWeight: 600,
                boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
                transition: "all 0.3s ease",
                overflow: "hidden",
                border: businessLogo ? "2px solid #e0e0e0" : "none"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.2)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.15)";
              }}
            >
              {businessLogo ? (
                <img 
                  src={businessLogo} 
                  alt="Business Logo"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "6px"
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement.style.background = "linear-gradient(135deg, #0C54CF, #D4AF37)";
                    e.currentTarget.parentElement.innerHTML = '<i class="fas fa-store"></i>';
                  }}
                />
              ) : (
                <FontAwesomeIcon icon={faStore} size="lg" />
              )}
            </div>
            <div className="d-flex flex-column align-items-start">
              <span style={{ 
                color: "#0C54CF", 
                fontWeight: "600", 
                fontSize: "0.9rem",
                lineHeight: "1.2",
                maxWidth: "180px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>
                {businessName}
              </span>
              <span style={{ 
                color: "#666", 
                fontSize: "0.75rem",
                lineHeight: "1"
              }}>
                {vendorData?.businessProfile?.isApproved ? "✓ Verified Business" : "Pending Approval"}
              </span>
            </div>
          </button>
        </li>
      </>
    );
  };

  // Regular user interface - WITH credits and cart
  const renderUserInterface = () => (
    <>
      {/* Credits Badge */}
      <li className="nav-item">
        <div 
          className="d-flex align-items-center px-3 py-1"
          style={{
            background: "linear-gradient(135deg, #D4AF37, #F4D03F)",
            borderRadius: "20px",
            boxShadow: "0 2px 8px rgba(212, 175, 55, 0.3)",
            transition: "all 0.3s ease",
            marginRight: "8px"
          }}
          title="Caicos Credits"
        >
          <FontAwesomeIcon 
            icon={faCoins} 
            style={{ color: "#0C54CF", marginRight: "6px" }} 
            size="sm"
          />
          <span style={{ 
            color: "#0C54CF", 
            fontWeight: "700",
            fontSize: "0.9rem",
            letterSpacing: "0.5px"
          }}>
            {caicosCredits.toLocaleString()}
          </span>
        </div>
      </li>

      {/* Cart Icon */}
      <li className="nav-item">
        <CartIcon />
      </li>

      {/* Profile Dropdown */}
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
            <Link href="/cart" className="dropdown-item py-2">
              <FontAwesomeIcon icon={faShoppingCart} className="me-2" style={{ color: "#0C54CF" }} />
              Cart {itemCount > 0 && `(${itemCount})`}
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
            <Link href="/faq" className="dropdown-item py-2">
              <FontAwesomeIcon icon={faQuestionCircle} className="me-2" style={{ color: "#0C54CF" }} />
              FAQ
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
    </>
  );

  if (loading && isLoggedIn) {
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
          <div className="ms-auto">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

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
            {/* UPDATED: Check for admin, business-manager, or regular user */}
            {isLoggedIn ? (
              userRole === 'admin' ? renderAdminInterface() :
              userRole === 'business-manager' ? renderVendorInterface() : 
              renderUserInterface()
            ) : (
              <>
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
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}