import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

const Navbar = () => {
  const [profile, setProfile] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Detect scroll + login state
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const token = localStorage.getItem("token");

    const isValid =
      token &&
      token !== "undefined" &&
      token !== "null" &&
      token.length > 20;

    setIsLoggedIn(!!isValid);

    if (isValid) {
      api
        .get("/api/v1/auth/profile")
        .then((res) => setProfile(res.data))
        .catch((err) => console.error(err));
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  };

  // ✅ NEW: Developer click handler
  const handleDeveloperClick = () => {
  if (isLoggedIn) {
    window.location.href = "https://portfolio-plum-six-b8v893n1d3.vercel.app";
  } else {
    navigate("/register");
  }
};


  const navButtonClass = (path: string) =>
    `relative group transition duration-300 ${
      location.pathname === path
        ? "text-white"
        : "text-gray-300 hover:text-white"
    }`;

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-black/70 backdrop-blur-xl border-b border-white/10"
          : "bg-black/40 backdrop-blur-xl"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="cursor-pointer text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text"
        >
          {"</>"} CodeEasy
        </div>

        {/* Middle Navigation */}
        <div className="hidden md:flex space-x-10 font-medium">

          <button
            onClick={() => navigate("/")}
            className={navButtonClass("/")}
          >
            Home
            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className={navButtonClass("/dashboard")}
          >
            Explore
            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
          </button>

          <button
            onClick={() => navigate("/problems")}
            className={navButtonClass("/problems")}
          >
            Problems
            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
          </button>

          {/* ✅ Updated Developer Button */}
          <button
            onClick={handleDeveloperClick}
            className={navButtonClass("/developer")}
          >
            Developer
            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
          </button>
        <button
    onClick={() => navigate("/admin-login")}
    className={navButtonClass("/admin")}
  >
    Admin
    <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
  </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">

          {!isLoggedIn ? (
            <>
              <button
                onClick={() => navigate("/login")}
                className="px-5 py-2 rounded-lg font-medium
                text-white border border-white/20
                hover:border-cyan-400 hover:text-cyan-400
                transition-all duration-300
                hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]
                active:scale-95"
              >
                Sign In
              </button>

              <button
                onClick={() => navigate("/register")}
                className="relative px-6 py-2.5 rounded-lg font-semibold text-black
                bg-gradient-to-r from-cyan-400 to-blue-500
                transition-all duration-300
                hover:scale-105
                hover:shadow-[0_0_25px_rgba(34,211,238,0.6)]
                active:scale-95"
              >
                Get Started
              </button>
            </>
          ) : (
            <div ref={dropdownRef} className="relative">
              <img
                src={profile?.avatar || "/default-avatar.png"}
                alt="avatar"
                className="w-10 h-10 rounded-full cursor-pointer border border-cyan-400"
                onClick={() => setOpen(!open)}
              />

              {open && (
                <div className="absolute right-0 mt-3 w-44 bg-[#0f172a] rounded-lg shadow-lg border border-white/10">
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-[#1e293b]"
                  >
                    View Profile
                  </button>

                  <button
                    onClick={() => {
                      navigate("/profile/edit");
                      setOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-[#1e293b]"
                  >
                    Edit Profile
                  </button>

                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-red-400 hover:bg-[#1e293b]"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
