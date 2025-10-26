import { NavLink } from "react-router-dom";
import { Home, History, User } from "lucide-react";
import { motion } from "framer-motion";

const Navigation = () => {
  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/history", icon: History, label: "History" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg shadow-lg border-t border-gray-200/50 dark:border-gray-800/50 md:top-0 md:bottom-auto md:border-t-0 md:border-b"
    >
      <div className="max-w-5xl mx-auto flex justify-around items-center py-3 px-4 md:py-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-primary scale-105 bg-primary/10"
                  : "text-muted-foreground hover:text-primary hover:scale-105"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-5 h-5 md:w-6 md:h-6 ${isActive ? "animate-pulse" : ""}`} />
                <span className="text-[10px] md:text-sm font-medium tracking-wide">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </motion.nav>
  );
};

export default Navigation;
