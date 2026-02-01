import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';
import { motion } from 'framer-motion';
import { Home, Dumbbell, Utensils, Camera, LogOut, User, Heart, Shield, Eye, EyeOff, Crown } from 'lucide-react';

export default function Layout({ children }) {
  const { user, signOut, isAdmin, isSuperAdmin } = useAuth();
  const { viewAsUser, stopViewingAs, isViewingAsUser } = useAdmin();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <div className="app">
      {/* View As User Banner */}
      {isViewingAsUser && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          className="view-as-banner"
        >
          <div className="view-as-content">
            <Eye size={18} />
            <span>Viewing as: <strong>{viewAsUser.name || viewAsUser.email}</strong></span>
            <span className="view-as-note">(Read-only view - no changes will be made)</span>
          </div>
          <button onClick={stopViewingAs} className="btn-exit-view">
            <EyeOff size={16} />
            Exit View Mode
          </button>
        </motion.div>
      )}

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
          {isAdmin && (
            <li>
              <NavLink to="/admin" className={({ isActive }) => `nav-link admin-link ${isSuperAdmin ? 'developer-link' : ''} ${isActive ? 'active' : ''}`}>
                {isSuperAdmin ? <Crown size={18} color="#ef4444" /> : <Shield size={18} />}
                Admin
              </NavLink>
            </li>
          )}
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
            {isAdmin && (
              <span className={`admin-badge ${isSuperAdmin ? 'developer' : ''}`}>
                {isSuperAdmin ? 'Developer' : 'Admin'}
              </span>
            )}
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
