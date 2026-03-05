import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, NavLink } from "react-router-dom";
import IntelligenceScene from "../components/IntelligenceScene";
import api from "../api/axios";

export default function AppLayout({ children }) {
  const location = useLocation();
  const [navVisible, setNavVisible] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = async () => {
  try {
    await api.post("/auth/logout");
    localStorage.setItem("logout", Date.now());
    window.location.href = "/login";
  } catch (err) {
    console.error("Logout failed");
  }
};

const isAuthPage =
  location.pathname === "/login" ||
  location.pathname === "/register";

  // Background intensity per route
  let intensity = 1;
  if (location.pathname.includes("analyze")) intensity = 1.3;
  if (location.pathname.includes("portfolio")) intensity = 0.9;

  // Reveal navigation on edge interaction
  useEffect(() => {
    let timeout;

    const showNav = () => {
      setNavVisible(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setNavVisible(false), 3000);
    };

    const handleMouseMove = (e) => {
      // 👇 Only desktop
      if (window.innerWidth < 768) return;

      const nearTop = e.clientY < 60;
      const nearLeft = e.clientX < 60;
      const nearRight = e.clientX > window.innerWidth - 60;

      if (nearTop || nearLeft || nearRight) {
        showNav();
      }
    };

    if (location.pathname.includes("config")) intensity = 1.4;

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const syncAuth = (event) => {
      if (event.key === "logout") {
        window.location.href = "/login";
      }

      if (event.key === "login") {
        window.location.href = "/dashboard";
      }
    };

    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  return (
    <div className="relative w-full min-h-screen text-zinc-100">

      {/* HAMBURGER BUTTON (MOBILE ONLY) */}
      {!isAuthPage && (
        <button
          onClick={() => setMobileNavOpen(prev => !prev)}
          className="
            sm:hidden
            fixed top-6 right-6 z-50
            w-10 h-10
            flex items-center justify-center
            bg-zinc-900/60 backdrop-blur-xl
            border border-zinc-700
            rounded-xl
          "
        >
          <div className="space-y-1">
            <span className="block w-5 h-[2px] bg-zinc-200"></span>
            <span className="block w-5 h-[2px] bg-zinc-200"></span>
            <span className="block w-5 h-[2px] bg-zinc-200"></span>
          </div>
        </button>
        )}


      {/* 3D Environment */}
      <IntelligenceScene intensity={intensity} />

      {/* Cinematic Logo Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.12 }}
        transition={{ duration: 2 }}
        className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none"
      >
        <h1
          className="
            text-[14vw]
            font-thin
            tracking-[0.4em]
            bg-gradient-to-b from-white via-zinc-400 to-transparent
            bg-clip-text text-transparent
            select-none
          "
          style={{
            WebkitTextStroke: "1px rgba(255,255,255,0.08)"
          }}
        >
          VERDEX
        </h1>
      </motion.div>

      {/* Soft Focus Overlay (Performance Safe) */}
      <AnimatePresence>
        {(navVisible || mobileNavOpen) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.50 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-20 bg-black pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Cinematic Floating Navigation */}
<AnimatePresence>
  {!isAuthPage && (
    <>
      {/* DESKTOP NAV */}
      {navVisible && (
        <div className="hidden sm:block">

          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.6 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-40 flex gap-12 text-lg tracking-wide"
          >
            <NavItem to="/">Dashboard</NavItem>
            <NavItem to="/analyze">Analyze</NavItem>
            <NavItem to="/portfolio">Portfolio</NavItem>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ duration: 0.6 }}
            className="fixed right-12 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-8 text-lg"
          >
            <NavItem to="/activity">Activity</NavItem>
            <NavItem to="/config">Config</NavItem>
            <NavItem to="/profile">Profile</NavItem>
            <button
              onClick={handleLogout}
              className="text-zinc-400 hover:text-white transition-all duration-300"
            >
              Logout
            </button>
          </motion.div>

        </div>
      )}

      {/* MOBILE NAV */}
      {mobileNavOpen && (
        <motion.div
          onClick={() => setMobileNavOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="
            sm:hidden
            fixed inset-0 z-40
            flex flex-col items-center justify-center gap-8
            text-xl tracking-wide
          "
        >
          <NavItem to="/">Dashboard</NavItem>
          <NavItem to="/analyze">Analyze</NavItem>
          <NavItem to="/portfolio">Portfolio</NavItem>
          <NavItem to="/activity">Activity</NavItem>
          <NavItem to="/config">Config</NavItem>
          <NavItem to="/profile">Profile</NavItem>
          <button
            onClick={handleLogout}
            className="text-zinc-400 hover:text-white transition-all duration-300"
          >
            Logout
          </button>
        </motion.div>
      )}

    </>
)}
  
</AnimatePresence>


      {/* Page Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 120 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -120 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          className={isAuthPage ? "" : "relative z-10 w-full min-h-screen flex items-start justify-center px-10 pt-32 pb-20"}
        >
          {children}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}

/* Floating Nav Item */
function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `
        relative group transition-all duration-300
        ${
          isActive
            ? "text-white"
            : "text-zinc-400 hover:text-white"
        }
        `
      }
    >
      <span className="relative z-10">{children}</span>

      <span className="
        absolute left-0 bottom-[-6px]
        w-0 h-[2px]
        bg-cyan-400
        transition-all duration-300
        group-hover:w-full
      " />
    </NavLink>
  );
}
