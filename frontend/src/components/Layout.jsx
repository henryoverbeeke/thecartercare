import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';
import { motion } from 'framer-motion';
import { Home, Dumbbell, Utensils, Camera, LogOut, User, Heart, Shield, Eye, EyeOff, Crown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function Layout({ children }) {
  const { user, signOut, isAdmin, isDeveloper, adminEmails } = useAuth();
  const { viewAsUser, stopViewingAs, isViewingAsUser, devViewMode, setDevViewMode } = useAdmin();
  const navigate = useNavigate();
  
  // Secret developer mode toggle
  const [zPressCount, setZPressCount] = useState(0);
  const [showModeNotification, setShowModeNotification] = useState(false);
  const [modeNotificationText, setModeNotificationText] = useState('');
  const zTimeoutRef = useRef(null);

  useEffect(() => {
    if (!isDeveloper) return;

    const handleKeyPress = (e) => {
      if (e.key.toLowerCase() === 'z') {
        setZPressCount(prev => {
          const newCount = prev + 1;
          
          // Clear existing timeout
          if (zTimeoutRef.current) {
            clearTimeout(zTimeoutRef.current);
          }
          
          // Handle mode changes
          if (newCount === 3) {
            setDevViewMode('admin');
            setModeNotificationText('🔧 Viewing as Admin');
            setShowModeNotification(true);
            setTimeout(() => setShowModeNotification(false), 3000);
            console.log('🔧 Developer viewing as: Admin');
          } else if (newCount === 6) {
            setDevViewMode('user');
            setModeNotificationText('🔧 Viewing as Regular User');
            setShowModeNotification(true);
            setTimeout(() => setShowModeNotification(false), 3000);
            console.log('🔧 Developer viewing as: Regular User');
          } else if (newCount >= 7) {
            setDevViewMode('developer');
            setModeNotificationText('🔧 Back to Developer Mode');
            setShowModeNotification(true);
            setTimeout(() => setShowModeNotification(false), 3000);
            console.log('🔧 Developer viewing as: Developer (normal)');
            return 0; // Reset count
          }
          
          // Reset after 2 seconds of no z presses
          zTimeoutRef.current = setTimeout(() => {
            setZPressCount(0);
          }, 2000);
          
          return newCount;
        });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (zTimeoutRef.current) {
        clearTimeout(zTimeoutRef.current);
      }
    };
  }, [isDeveloper, setDevViewMode]);

  // Determine what to show based on view mode
  const effectiveIsAdmin = isDeveloper 
    ? (devViewMode === 'developer' || devViewMode === 'admin')
    : isAdmin;
  
  const effectiveIsDeveloper = isDeveloper && devViewMode === 'developer';
  
  const showAdminLink = isDeveloper 
    ? (devViewMode === 'developer' || devViewMode === 'admin')
    : isAdmin;

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <div className="app">
      {/* Developer Mode Notification (disappears after 3 seconds) */}
      {showModeNotification && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 20, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            background: devViewMode === 'admin' 
              ? 'linear-gradient(135deg, #d4a853, #f5d98b)' 
              : devViewMode === 'user'
              ? 'linear-gradient(135deg, #3b82f6, #60a5fa)'
              : 'linear-gradient(135deg, #ef4444, #f87171)',
            color: '#000',
            padding: '12px 20px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            zIndex: 9999,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            border: '2px solid rgba(255,255,255,0.3)',
          }}
        >
          {modeNotificationText}
        </motion.div>
      )}

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
          {showAdminLink && (
            <li>
              <NavLink to="/admin" className={({ isActive }) => `nav-link admin-link ${effectiveIsDeveloper ? 'developer-link' : ''} ${isActive ? 'active' : ''}`}>
                {effectiveIsDeveloper ? <Crown size={18} color="#ef4444" /> : <Shield size={18} />}
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
            {effectiveIsAdmin && (
              <span className={`admin-badge ${effectiveIsDeveloper ? 'developer' : ''}`}>
                {effectiveIsDeveloper ? 'Developer' : 'Admin'}
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
