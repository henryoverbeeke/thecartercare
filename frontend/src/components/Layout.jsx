import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Home, Dumbbell, Utensils, Camera, LogOut, User, Heart } from 'lucide-react';

export default function Layout({ children }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <div className="app">
      <nav className="app-nav">
        <motion.div
          className="nav-logo"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Heart size={24} className="heart-icon" />
          <span className="gradient-text">Carter Care</span>
        </motion.div>

        <motion.ul
          className="nav-links"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <li>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Home size={18} />
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/workouts" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Dumbbell size={18} />
              Workouts
            </NavLink>
          </li>
          <li>
            <NavLink to="/nutrition" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Utensils size={18} />
              Nutrition
            </NavLink>
          </li>
          <li>
            <NavLink to="/progress" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Camera size={18} />
              Progress
            </NavLink>
          </li>
        </motion.ul>

        <motion.div
          className="nav-user"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="nav-user-name">
            <User size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            {user?.name || user?.email}
          </span>
          <button onClick={handleSignOut} className="btn-signout">
            <LogOut size={16} />
            Sign Out
          </button>
        </motion.div>
      </nav>

      <main className="main-container">
        {children}
      </main>
    </div>
  );
}
