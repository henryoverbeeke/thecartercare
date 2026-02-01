import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';
import {
  initAdminDB,
  getAllUsers,
  updateUserDisabledStatus,
  getPlatformLockdown,
  setPlatformLockdown,
  getUserStats,
} from '../services/admin';
import { initDynamoDB, getWorkouts, getMeals, getProgress } from '../services/dynamodb';
import { format } from 'date-fns';
import {
  Users,
  Shield,
  ShieldAlert,
  ShieldOff,
  Eye,
  EyeOff,
  UserX,
  UserCheck,
  Lock,
  Unlock,
  Activity,
  Dumbbell,
  Utensils,
  TrendingUp,
  AlertTriangle,
  Crown,
  BarChart3,
} from 'lucide-react';

export default function AdminPanel() {
  const { user, credentials, isSuperAdmin } = useAuth();
  const { startViewingAs, viewAsUser, stopViewingAs, isViewingAsUser } = useAdmin();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lockdownEnabled, setLockdownEnabled] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 0,
    totalWorkouts: 0,
    totalMeals: 0,
    totalProgress: 0,
    avgWorkoutsPerUser: 0,
    avgCaloriesBurned: 0,
    avgCaloriesConsumed: 0,
  });
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (credentials) {
      initAdminDB(credentials);
      initDynamoDB(credentials);
      loadData();
    }
  }, [credentials]);

  const loadData = async () => {
    try {
      const [usersData, lockdownData] = await Promise.all([
        getAllUsers(),
        getPlatformLockdown(),
      ]);

      setUsers(usersData);
      setLockdownEnabled(lockdownData.enabled);

      // Calculate platform-wide stats
      let totalWorkouts = 0;
      let totalMeals = 0;
      let totalProgress = 0;
      let totalCaloriesBurned = 0;
      let totalCaloriesConsumed = 0;

      for (const u of usersData) {
        try {
          const [workouts, meals, progress] = await Promise.all([
            getWorkouts(u.cognitoId),
            getMeals(u.cognitoId),
            getProgress(u.cognitoId),
          ]);

          totalWorkouts += workouts.length;
          totalMeals += meals.length;
          totalProgress += progress.length;
          totalCaloriesBurned += workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
          totalCaloriesConsumed += meals.reduce((sum, m) => sum + (m.calories || 0), 0);
        } catch (e) {
          console.error(`Error loading stats for user ${u.email}:`, e);
        }
      }

      setPlatformStats({
        totalUsers: usersData.length,
        totalWorkouts,
        totalMeals,
        totalProgress,
        avgWorkoutsPerUser: usersData.length ? Math.round(totalWorkouts / usersData.length) : 0,
        avgCaloriesBurned: usersData.length ? Math.round(totalCaloriesBurned / usersData.length) : 0,
        avgCaloriesConsumed: usersData.length ? Math.round(totalCaloriesConsumed / usersData.length) : 0,
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLockdown = async () => {
    if (!isSuperAdmin) return;

    setActionLoading('lockdown');
    try {
      const newState = !lockdownEnabled;
      await setPlatformLockdown(newState, user.email);
      setLockdownEnabled(newState);
    } catch (error) {
      console.error('Error toggling lockdown:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleUserStatus = async (userEmail, currentStatus) => {
    if (!isSuperAdmin) return;

    setActionLoading(userEmail);
    try {
      await updateUserDisabledStatus(userEmail, !currentStatus);
      setUsers(users.map(u =>
        u.email === userEmail ? { ...u, isDisabled: !currentStatus } : u
      ));
    } catch (error) {
      console.error('Error toggling user status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewUserStats = async (userData) => {
    setSelectedUser(userData);
    setLoadingStats(true);
    setUserStats(null);

    try {
      const [workouts, meals, progress] = await Promise.all([
        getWorkouts(userData.cognitoId),
        getMeals(userData.cognitoId),
        getProgress(userData.cognitoId),
      ]);

      const totalCaloriesBurned = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
      const totalCaloriesConsumed = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
      const totalWorkoutMinutes = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);

      setUserStats({
        workoutCount: workouts.length,
        mealCount: meals.length,
        progressCount: progress.length,
        totalCaloriesBurned,
        totalCaloriesConsumed,
        totalWorkoutMinutes,
        workouts: workouts.slice(0, 10),
        meals: meals.slice(0, 10),
        // Progress without photos for privacy
        progress: progress.slice(0, 10).map(p => ({
          ...p,
          photoUrl: null,
        })),
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleViewAsUser = (userData) => {
    startViewingAs(userData);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* View As User Banner */}
      {isViewingAsUser && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="admin-view-banner"
        >
          <Eye size={20} />
          <span>Viewing as: <strong>{viewAsUser.name || viewAsUser.email}</strong></span>
          <button onClick={stopViewingAs} className="btn-exit-view">
            <EyeOff size={16} />
            Exit View Mode
          </button>
        </motion.div>
      )}

      <motion.div className="page-header" variants={itemVariants}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Shield size={32} color={isSuperAdmin ? "#ef4444" : "#d4a853"} />
          <div>
            <h1 className="page-title" style={isSuperAdmin ? { color: '#ef4444' } : {}}>
              {isSuperAdmin ? 'Developer Panel' : 'Admin Panel'}
            </h1>
            <p className="page-subtitle">
              {isSuperAdmin ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Crown size={14} color="#ef4444" />
                  Full Platform Access
                </span>
              ) : (
                'Admin Access'
              )}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Platform Stats */}
      <motion.div className="grid-4" style={{ marginBottom: 32 }} variants={itemVariants}>
        <motion.div className="stats-card" whileHover={{ scale: 1.02 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Users size={24} color="#d4a853" />
            <span className="stats-card-label">Total Users</span>
          </div>
          <div className="stats-card-value">{platformStats.totalUsers}</div>
        </motion.div>

        <motion.div className="stats-card" whileHover={{ scale: 1.02 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Dumbbell size={24} color="#1a1a1a" />
            <span className="stats-card-label">Total Workouts</span>
          </div>
          <div className="stats-card-value">{platformStats.totalWorkouts}</div>
        </motion.div>

        <motion.div className="stats-card" whileHover={{ scale: 1.02 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Utensils size={24} color="#b8923d" />
            <span className="stats-card-label">Total Meals</span>
          </div>
          <div className="stats-card-value">{platformStats.totalMeals}</div>
        </motion.div>

        <motion.div className="stats-card" whileHover={{ scale: 1.02 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <BarChart3 size={24} color="#d4a853" />
            <span className="stats-card-label">Avg Workouts/User</span>
          </div>
          <div className="stats-card-value">{platformStats.avgWorkoutsPerUser}</div>
        </motion.div>
      </motion.div>

      {/* Average Stats */}
      <motion.div className="grid-2" style={{ marginBottom: 32 }} variants={itemVariants}>
        <div className="stats-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Activity size={24} color="#d4a853" />
            <span className="stats-card-label">Avg Calories Burned (Per User)</span>
          </div>
          <div className="stats-card-value">{platformStats.avgCaloriesBurned.toLocaleString()}</div>
        </div>

        <div className="stats-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <TrendingUp size={24} color="#1a1a1a" />
            <span className="stats-card-label">Avg Calories Consumed (Per User)</span>
          </div>
          <div className="stats-card-value">{platformStats.avgCaloriesConsumed.toLocaleString()}</div>
        </div>
      </motion.div>

      {/* Super Admin Controls */}
      {isSuperAdmin && (
        <motion.div variants={itemVariants} style={{ marginBottom: 32 }}>
          <div className="admin-control-card">
            <div className="admin-control-header">
              <ShieldAlert size={24} color="#ef4444" />
              <h3>Platform Management</h3>
            </div>
            <div className="admin-control-body">
              <div className="lockdown-control">
                <div className="lockdown-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {lockdownEnabled ? (
                      <Lock size={20} color="#ef4444" />
                    ) : (
                      <Unlock size={20} color="#22c55e" />
                    )}
                    <div>
                      <h4>Platform Lockdown</h4>
                      <p>
                        {lockdownEnabled
                          ? 'Platform is in lockdown. Only you can access it.'
                          : 'Platform is accessible to all users.'}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleToggleLockdown}
                  disabled={actionLoading === 'lockdown'}
                  className={`lockdown-toggle ${lockdownEnabled ? 'active' : ''}`}
                >
                  {actionLoading === 'lockdown' ? (
                    <div className="spinner-small" />
                  ) : lockdownEnabled ? (
                    <>
                      <Unlock size={16} />
                      Disable Lockdown
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      Enable Lockdown
                    </>
                  )}
                </button>
              </div>
              {lockdownEnabled && (
                <div className="lockdown-warning">
                  <AlertTriangle size={16} />
                  <span>Warning: All users except you are currently locked out of the platform.</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* User List */}
      <motion.div variants={itemVariants}>
        <div className="admin-users-card">
          <div className="admin-users-header">
            <Users size={24} color="#d4a853" />
            <h3>All Users</h3>
            <span className="user-count">{users.length} users</span>
          </div>
          <div className="admin-users-list">
            {users.map((u) => (
              <div
                key={u.email}
                className={`admin-user-item ${u.isDisabled ? 'disabled' : ''}`}
              >
                <div className="admin-user-info">
                  <div className="admin-user-avatar">
                    {u.name ? u.name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="admin-user-details">
                    <div className="admin-user-name">
                      {u.name || 'No name'}
                      {u.isDisabled && (
                        <span className="disabled-badge">Disabled</span>
                      )}
                    </div>
                    <div className="admin-user-email">{u.email}</div>
                    <div className="admin-user-meta">
                      Joined: {u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : 'Unknown'}
                      {u.lastLoginAt && ` · Last login: ${format(new Date(u.lastLoginAt), 'MMM d, yyyy')}`}
                    </div>
                  </div>
                </div>
                <div className="admin-user-actions">
                  <button
                    onClick={() => handleViewUserStats(u)}
                    className="btn-admin-action"
                    title="View Stats"
                  >
                    <BarChart3 size={16} />
                    Stats
                  </button>
                  <button
                    onClick={() => handleViewAsUser(u)}
                    className="btn-admin-action"
                    title="View as User"
                  >
                    <Eye size={16} />
                    View As
                  </button>
                  {isSuperAdmin && u.email !== user.email && (
                    <button
                      onClick={() => handleToggleUserStatus(u.email, u.isDisabled)}
                      disabled={actionLoading === u.email}
                      className={`btn-admin-action ${u.isDisabled ? 'enable' : 'disable'}`}
                      title={u.isDisabled ? 'Enable User' : 'Disable User'}
                    >
                      {actionLoading === u.email ? (
                        <div className="spinner-small" />
                      ) : u.isDisabled ? (
                        <>
                          <UserCheck size={16} />
                          Enable
                        </>
                      ) : (
                        <>
                          <UserX size={16} />
                          Disable
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="no-users">No users found</div>
            )}
          </div>
        </div>
      </motion.div>

      {/* User Stats Modal */}
      {selectedUser && (
        <div className="admin-modal-overlay" onClick={() => setSelectedUser(null)}>
          <motion.div
            className="admin-modal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3>
                <BarChart3 size={20} />
                Stats for {selectedUser.name || selectedUser.email}
              </h3>
              <button onClick={() => setSelectedUser(null)} className="btn-close">×</button>
            </div>
            <div className="admin-modal-body">
              {loadingStats ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                  <div className="spinner" />
                </div>
              ) : userStats ? (
                <>
                  <div className="stats-grid-modal">
                    <div className="stat-item">
                      <Dumbbell size={20} color="#d4a853" />
                      <div>
                        <div className="stat-value">{userStats.workoutCount}</div>
                        <div className="stat-label">Workouts</div>
                      </div>
                    </div>
                    <div className="stat-item">
                      <Utensils size={20} color="#1a1a1a" />
                      <div>
                        <div className="stat-value">{userStats.mealCount}</div>
                        <div className="stat-label">Meals</div>
                      </div>
                    </div>
                    <div className="stat-item">
                      <Activity size={20} color="#d4a853" />
                      <div>
                        <div className="stat-value">{userStats.totalCaloriesBurned.toLocaleString()}</div>
                        <div className="stat-label">Calories Burned</div>
                      </div>
                    </div>
                    <div className="stat-item">
                      <TrendingUp size={20} color="#1a1a1a" />
                      <div>
                        <div className="stat-value">{userStats.totalCaloriesConsumed.toLocaleString()}</div>
                        <div className="stat-label">Calories Consumed</div>
                      </div>
                    </div>
                  </div>

                  <div className="stats-section">
                    <h4>Recent Workouts</h4>
                    {userStats.workouts.length > 0 ? (
                      <div className="stats-list">
                        {userStats.workouts.map((w) => (
                          <div key={w.workoutId} className="stats-list-item">
                            <span>{w.name}</span>
                            <span>{w.duration} min · {w.calories} cal</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-data">No workouts logged</p>
                    )}
                  </div>

                  <div className="stats-section">
                    <h4>Recent Meals</h4>
                    {userStats.meals.length > 0 ? (
                      <div className="stats-list">
                        {userStats.meals.map((m) => (
                          <div key={m.mealId} className="stats-list-item">
                            <span>{m.name}</span>
                            <span>{m.calories} cal</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-data">No meals logged</p>
                    )}
                  </div>

                  <div className="stats-section">
                    <h4>Progress Entries</h4>
                    <p className="privacy-note">
                      <ShieldOff size={14} />
                      Photos hidden for privacy
                    </p>
                    {userStats.progress.length > 0 ? (
                      <div className="stats-list">
                        {userStats.progress.map((p) => (
                          <div key={p.progressId} className="stats-list-item">
                            <span>{format(new Date(p.date), 'MMM d, yyyy')}</span>
                            <span>
                              {p.weight && `${p.weight} lbs`}
                              {p.bodyFat && ` · ${p.bodyFat}% BF`}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-data">No progress entries</p>
                    )}
                  </div>
                </>
              ) : (
                <p>Error loading stats</p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
