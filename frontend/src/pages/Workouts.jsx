import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';
import { initDynamoDB, getWorkouts, addWorkout, deleteWorkout } from '../services/dynamodb';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { Dumbbell, Plus, Trash2, Clock, Flame, Activity, X } from 'lucide-react';

const workoutTypes = [
  { value: 'strength', label: 'Strength Training', icon: '💪' },
  { value: 'cardio', label: 'Cardio', icon: '🏃' },
  { value: 'hiit', label: 'HIIT', icon: '⚡' },
  { value: 'yoga', label: 'Yoga', icon: '🧘' },
  { value: 'swimming', label: 'Swimming', icon: '🏊' },
  { value: 'cycling', label: 'Cycling', icon: '🚴' },
  { value: 'other', label: 'Other', icon: '🎯' },
];

export default function Workouts() {
  const { user, credentials } = useAuth();
  const { viewAsUser, isViewingAsUser } = useAdmin();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '', visible: false });
  const [exercises, setExercises] = useState([{ name: '', sets: '', reps: '', weight: '' }]);

  // Use viewed user's ID if in view-as mode, otherwise use current user
  const activeUserId = isViewingAsUser ? viewAsUser.cognitoId : user.sub;

  const [formData, setFormData] = useState({
    name: '',
    type: 'strength',
    duration: '',
    calories: '',
    notes: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    if (credentials) {
      initDynamoDB(credentials);
      loadWorkouts();
    }
  }, [credentials, activeUserId]);

  const loadWorkouts = async () => {
    setLoading(true);
    try {
      const data = await getWorkouts(activeUserId);
      setWorkouts(data);
    } catch (error) {
      showToast('Error loading workouts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const workout = {
        workoutId: uuidv4(),
        ...formData,
        duration: parseInt(formData.duration),
        calories: parseInt(formData.calories),
        exercises: exercises.filter((ex) => ex.name),
      };
      await addWorkout(user.sub, workout);
      setWorkouts([workout, ...workouts]);
      setModalOpen(false);
      resetForm();
      showToast('Workout added successfully!', 'success');
    } catch (error) {
      showToast('Error adding workout', 'error');
    }
  };

  const handleDelete = async (workoutId) => {
    try {
      await deleteWorkout(user.sub, workoutId);
      setWorkouts(workouts.filter((w) => w.workoutId !== workoutId));
      showToast('Workout deleted', 'success');
    } catch (error) {
      showToast('Error deleting workout', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'strength',
      duration: '',
      calories: '',
      notes: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    });
    setExercises([{ name: '', sets: '', reps: '', weight: '' }]);
  };

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: '', reps: '', weight: '' }]);
  };

  const updateExercise = (index, field, value) => {
    const updated = [...exercises];
    updated[index][field] = value;
    setExercises(updated);
  };

  const removeExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Workouts</h1>
          <p className="page-subtitle">
            <Dumbbell size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Track your training sessions
          </p>
        </div>
        {!isViewingAsUser && (
          <motion.button
            className="retro-button"
            onClick={() => setModalOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Add Workout
          </motion.button>
        )}
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: 32 }}>
        <motion.div className="stats-card" whileHover={{ scale: 1.02 }}>
          <div className="stats-card-label">Total Workouts</div>
          <div className="stats-card-value">{workouts.length}</div>
        </motion.div>
        <motion.div className="stats-card" whileHover={{ scale: 1.02 }}>
          <div className="stats-card-label">Total Calories Burned</div>
          <div className="stats-card-value">
            {workouts.reduce((sum, w) => sum + (w.calories || 0), 0)}
          </div>
        </motion.div>
        <motion.div className="stats-card" whileHover={{ scale: 1.02 }}>
          <div className="stats-card-label">Total Minutes</div>
          <div className="stats-card-value">
            {workouts.reduce((sum, w) => sum + (w.duration || 0), 0)}
          </div>
        </motion.div>
      </div>

      {/* Workouts List */}
      <motion.div
        className="retro-card"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AnimatePresence>
            {workouts.map((workout) => (
              <motion.div
                key={workout.workoutId}
                className="list-item"
                variants={itemVariants}
                layout
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="list-item-icon">
                  <span style={{ fontSize: 24 }}>
                    {workoutTypes.find((t) => t.value === workout.type)?.icon || '🎯'}
                  </span>
                </div>
                <div className="list-item-content" style={{ flex: 1 }}>
                  <div className="list-item-title">{workout.name}</div>
                  <div className="list-item-subtitle">
                    <Clock size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                    {workout.duration} min
                    <span style={{ margin: '0 8px' }}>·</span>
                    <Activity size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                    {workoutTypes.find((t) => t.value === workout.type)?.label}
                    <span style={{ margin: '0 8px' }}>·</span>
                    {format(new Date(workout.date), 'MMM d')}
                  </div>
                  {workout.exercises?.length > 0 && (
                    <div style={{ marginTop: 8, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                      {workout.exercises.map((ex) => ex.name).join(', ')}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div className="list-item-value">
                    <Flame size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                    {workout.calories} cal
                  </div>
                  {!isViewingAsUser && (
                    <motion.button
                      onClick={() => handleDelete(workout.workoutId)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--neon-pink)',
                        cursor: 'pointer',
                        padding: 8,
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 size={18} />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {workouts.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.5)' }}>
              <Dumbbell size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
              <p>No workouts logged yet. Start tracking your fitness journey!</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Add Workout Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Log Workout">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Workout Name</label>
            <input
              type="text"
              className="retro-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Morning Lift"
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                className="retro-input"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                {workoutTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="retro-input"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Duration (minutes)</label>
              <input
                type="text"
                className="retro-input"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="45"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Calories Burned</label>
              <input
                type="text"
                className="retro-input"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                placeholder="300"
                required
              />
            </div>
          </div>

          {/* Exercises */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Exercises</label>
              <button
                type="button"
                onClick={addExercise}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--neon-blue)',
                  color: 'var(--neon-blue)',
                  padding: '4px 12px',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontFamily: 'var(--font-display)',
                }}
              >
                + Add Exercise
              </button>
            </div>
            {exercises.map((exercise, index) => (
              <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  type="text"
                  className="retro-input"
                  placeholder="Exercise name"
                  value={exercise.name}
                  onChange={(e) => updateExercise(index, 'name', e.target.value)}
                  style={{ flex: 2 }}
                />
                <input
                  type="text"
                  className="retro-input"
                  placeholder="Sets"
                  value={exercise.sets}
                  onChange={(e) => updateExercise(index, 'sets', e.target.value)}
                  style={{ flex: 1 }}
                />
                <input
                  type="text"
                  className="retro-input"
                  placeholder="Reps"
                  value={exercise.reps}
                  onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                  style={{ flex: 1 }}
                />
                <input
                  type="text"
                  className="retro-input"
                  placeholder="Weight"
                  value={exercise.weight}
                  onChange={(e) => updateExercise(index, 'weight', e.target.value)}
                  style={{ flex: 1 }}
                />
                {exercises.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExercise(index)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--neon-pink)',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              className="retro-input"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="How did the workout feel?"
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          <motion.button
            type="submit"
            className="retro-button"
            style={{ width: '100%' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Save Workout
          </motion.button>
        </form>
      </Modal>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </motion.div>
  );
}
