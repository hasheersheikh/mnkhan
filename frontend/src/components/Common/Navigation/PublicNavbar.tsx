import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { getCart } from "../../../api/cart";
import Login from "../../../pages/Landing/Login";

interface PublicNavbarProps {
  onLoginSuccess: () => void;
  onLogout: () => void;
  showLogin: boolean;
  setShowLogin: (show: boolean) => void;
  isAuthenticated: boolean;
}

const PublicNavbar: React.FC<PublicNavbarProps> = ({
  onLoginSuccess,
  onLogout,
  showLogin,
  setShowLogin,
  isAuthenticated,
}) => {
  const location = useLocation();
  const [authError, setAuthError] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = React.useRef<HTMLDivElement>(null);

  const userString = localStorage.getItem("mnkhan_user");
  const user = userString ? JSON.parse(userString) : null;
  const isClient = user?.role === "client";

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const fetchCartCount = async () => {
    if (!isAuthenticated || !isClient) return;
    try {
      const res = await getCart();
      if (res.data.success) {
        setCartCount(res.data.cart?.items?.length || 0);
      }
    } catch (err) {
      console.error("Failed to fetch cart count:", err);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("unauthorized")) {
      setAuthError(true);
      setShowLogin(true);
      const timer = setTimeout(() => setAuthError(false), 5000);
      return () => clearTimeout(timer);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [location]);

  useEffect(() => {
    if (isAuthenticated && isClient) {
      fetchCartCount();
    } else {
      setCartCount(0);
    }
  }, [isAuthenticated, isClient, location.pathname]);

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinkClass = (path: string) =>
    `transition-colors hover:text-mnkhan-orange flex items-center gap-2 ${isActive(path) ? "text-mnkhan-orange font-bold" : "text-mnkhan-charcoal"}`;

  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <>
      {authError && (
        <div className="bg-red-600 text-white text-[10px] uppercase font-bold tracking-[0.2em] py-2 text-center animate-in slide-in-from-top duration-300">
          Access Denied: Please login to access the Edge Portal
        </div>
      )}
      <nav className="relative z-50 flex items-center justify-between px-6 md:px-8 py-6 backdrop-blur-sm border-b border-mnkhan-gray-border/50 bg-white/80">
        <div className="text-left">
          <Link to="/" className="hover:opacity-80 transition-opacity block">
            <span className="text-xl md:text-2xl font-bold tracking-widest uppercase text-black">
              MN KHAN<span className="text-mnkhan-orange">.</span>
            </span>
            <span className="block text-[8px] md:text-[10px] font-semibold uppercase text-mnkhan-text-muted tracking-[0.55em] -mt-1">
              & Associates
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10 font-semibold text-sm">
          <Link to="/services" className={navLinkClass("/services")}>
            Services
          </Link>
          <Link to="/people" className={navLinkClass("/people")}>
            People
          </Link>
          <Link to="/knowledge" className={navLinkClass("/knowledge")}>
            Knowledge Center
          </Link>
          {isAuthenticated && isClient && (
            <Link to="/cart" className={navLinkClass("/cart")}>
              <span className="flex items-center">
                Cart{" "}
                {cartCount > 0 && (
                  <span className="ml-2 bg-mnkhan-orange text-white text-[8px] px-2 py-1 rounded-full">
                    {cartCount}
                  </span>
                )}
              </span>
            </Link>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-6">
              {isClient && (
                <Link
                  to="/services"
                  className="text-mnkhan-orange font-bold hover:underline underline-offset-4"
                >
                  Buy Services
                </Link>
              )}

              <div className="relative" ref={profileDropdownRef}>
                <div
                  className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                >
                  <div className="h-[32px] w-[32px] rounded-full bg-mnkhan-orange flex items-center justify-center text-white font-bold text-xs shadow-md">
                    {getInitials(user?.name || "User")}
                  </div>
                  <span
                    className={`text-[8px] transition-transform duration-200 ${showProfileDropdown ? "rotate-180" : ""}`}
                  >
                    ▼
                  </span>
                </div>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-3 w-56 bg-white border border-mnkhan-gray-border shadow-2xl rounded py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-mnkhan-gray-border mb-1">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-mnkhan-text-muted mb-1">
                        Account
                      </p>
                      <p className="text-sm font-bold truncate text-mnkhan-charcoal">
                        {user?.name}
                      </p>
                      <p className="text-[10px] truncate text-mnkhan-text-muted">
                        {user?.email}
                      </p>
                    </div>
                    <Link
                      to="/portal/overview"
                      className="block px-4 py-2 text-sm hover:bg-mnkhan-gray-bg transition-colors"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      Edge Portal
                    </Link>
                    <Link
                      to="/portal/account-security"
                      className="block px-4 py-2 text-sm hover:bg-mnkhan-gray-bg transition-colors"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      Reset Password
                    </Link>
                    <button
                      onClick={() => {
                        onLogout();
                        setShowProfileDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-mnkhan-orange hover:bg-mnkhan-orange/5 font-semibold transition-colors mt-1"
                    >
                      Logout Session
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="bg-mnkhan-charcoal text-white px-6 py-2.5 rounded hover:bg-mnkhan-orange transition-all duration-300 shadow-lg shadow-black/10"
            >
              Secure Client Access
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-4">
          {isAuthenticated && isClient && cartCount > 0 && (
            <Link to="/cart" className="relative">
              <span className="text-mnkhan-charcoal">🛒</span>
              <span className="absolute -top-2 -right-2 bg-mnkhan-orange text-white text-[8px] px-1.5 py-0.5 rounded-full">
                {cartCount}
              </span>
            </Link>
          )}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="text-mnkhan-charcoal p-2"
          >
            {showMobileMenu ? (
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Drawer */}
        {showMobileMenu && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-mnkhan-gray-border shadow-xl md:hidden animate-in slide-in-from-top duration-300">
            <div className="flex flex-col p-6 gap-6 font-semibold">
              <Link
                to="/services"
                onClick={() => setShowMobileMenu(false)}
                className={navLinkClass("/services")}
              >
                Services
              </Link>
              <Link
                to="/people"
                onClick={() => setShowMobileMenu(false)}
                className={navLinkClass("/people")}
              >
                People
              </Link>
              <Link
                to="/knowledge"
                onClick={() => setShowMobileMenu(false)}
                className={navLinkClass("/knowledge")}
              >
                Knowledge Center
              </Link>

              {isAuthenticated ? (
                <div className="pt-6 border-t border-mnkhan-gray-border space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-mnkhan-orange flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {getInitials(user?.name || "User")}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-mnkhan-charcoal">
                        {user?.name}
                      </p>
                      <p className="text-[10px] text-mnkhan-text-muted">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/portal/overview"
                    onClick={() => setShowMobileMenu(false)}
                    className="block py-3 text-sm text-mnkhan-charcoal border-b border-mnkhan-gray-light"
                  >
                    Edge Portal
                  </Link>
                  <button
                    onClick={() => {
                      onLogout();
                      setShowMobileMenu(false);
                    }}
                    className="w-full text-left py-3 text-sm text-mnkhan-orange font-bold"
                  >
                    Logout Session
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowLogin(true);
                    setShowMobileMenu(false);
                  }}
                  className="w-full bg-mnkhan-charcoal text-white py-4 rounded font-bold uppercase tracking-widest text-xs"
                >
                  Secure Client Access
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Login Modal Overlay */}
      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
          onSuccess={() => {
            setShowLogin(false);
            onLoginSuccess();
          }}
        />
      )}
    </>
  );
};

export default PublicNavbar;
