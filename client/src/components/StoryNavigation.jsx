import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

export default function StoryNavigation() {
  const [visible, setVisible] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let timeout;

    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;

      setMouse({ x, y });
      setVisible(true);

      clearTimeout(timeout);
      timeout = setTimeout(() => setVisible(false), 2500);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const links = [
    { name: "Dashboard", path: "/", pos: { top: "20%", left: "15%" } },
    { name: "Analyze", path: "/analyze", pos: { top: "40%", right: "20%" } },
    { name: "Portfolio", path: "/portfolio", pos: { bottom: "30%", left: "25%" } },
    { name: "Activity", path: "/activity", pos: { top: "65%", right: "30%" } },
    { name: "Config", path: "/config", pos: { bottom: "15%", right: "15%" } },
  ];

  return (
    <AnimatePresence>
      {visible &&
        links.map((link, i) => (
          <motion.div
            key={link.path}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: mouse.x * (20 + i * 5),
              y: mouse.y * (20 + i * 5),
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6 }}
            className="fixed z-50 text-slate-300 text-lg tracking-widest"
            style={link.pos}
          >
            <NavLink
              to={link.path}
              className={({ isActive }) =>
                `
                transition-all duration-300
                ${
                  isActive
                    ? "text-white drop-shadow-[0_0_15px_rgba(56,189,248,0.6)]"
                    : "hover:text-white hover:drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]"
                }
              `
              }
            >
              {link.name}
            </NavLink>
          </motion.div>
        ))}
    </AnimatePresence>
  );
}
