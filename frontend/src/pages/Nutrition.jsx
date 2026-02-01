import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { initDynamoDB, getMeals, addMeal, deleteMeal } from '../services/dynamodb';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { Utensils, Plus, Trash2, Flame, Beef, Wheat, Droplet } from 'lucide-react';

const mealTypes = [
  { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { value: 'lunch', label: 'Lunch', icon: '☀️' },
  { value: 'dinner', label: 'Dinner', icon: '🌙' },
  { value: 'snack', label: 'Snack', icon: '🍎' },
];

export default function Nutrition() {
  const { user, credentials } = useAuth();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '', visible: false });

  const [formData, setFormData] = useState({
    name: '',
    type: 'lunch',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    notes: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    if (credentials) {
      initDynamoDB(credentials);
      loadMeals();
    }
  }, [credentials]);

  const loadMeals = async () => {
    try {
      const data = await getMeals(user.sub);
      setMeals(data);
    } catch (error) {
      showToast('Error loading meals', 'error');
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
      const meal = {
        mealId: uuidv4(),
        ...formData,
        calories: parseInt(formData.calories) || 0,
        protein: parseInt(formData.protein) || 0,
        carbs: parseInt(formData.carbs) || 0,
        fat: parseInt(formData.fat) || 0,
      };
      await addMeal(user.sub, meal);
      setMeals([meal, ...meals]);
      setModalOpen(false);
      resetForm();
      showToast('Meal logged successfully!', 'success');
    } catch (error) {
      showToast('Error adding meal', 'error');
    }
  };

  const handleDelete = async (mealId) => {
    try {
      await deleteMeal(user.sub, mealId);
      setMeals(meals.filter((m) => m.mealId !== mealId));
      showToast('Meal deleted', 'success');
    } catch (error) {
      showToast('Error deleting meal', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'lunch',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      notes: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  const todayMeals = meals.filter((m) => m.date === format(new Date(), 'yyyy-MM-dd'));
  const todayCalories = todayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const todayProtein = todayMeals.reduce((sum, m) => sum + (m.protein || 0), 0);
  const todayCarbs = todayMeals.reduce((sum, m) => sum + (m.carbs || 0), 0);
  const todayFat = todayMeals.reduce((sum, m) => sum + (m.fat || 0), 0);

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
          <h1 className="page-title">Nutrition</h1>
          <p className="page-subtitle">
            <Utensils size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Track your meals and macros
          </p>
        </div>
        <motion.button
          className="retro-button"
          onClick={() => setModalOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Log Meal
        </motion.button>
      </div>

      {/* Today's Stats */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        <motion.div className="stats-card" whileHover={{ scale: 1.02 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Flame size={20} color="var(--neon-pink)" />
            <span className="stats-card-label">Today's Calories</span>
          </div>
          <div className="stats-card-value">{todayCalories}</div>
        </motion.div>
        <motion.div className="stats-card" whileHover={{ scale: 1.02 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Beef size={20} color="var(--neon-blue)" />
            <span className="stats-card-label">Protein</span>
          </div>
          <div className="stats-card-value">{todayProtein}g</div>
        </motion.div>
        <motion.div className="stats-card" whileHover={{ scale: 1.02 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Wheat size={20} color="var(--neon-purple)" />
            <span className="stats-card-label">Carbs</span>
          </div>
          <div className="stats-card-value">{todayCarbs}g</div>
        </motion.div>
        <motion.div className="stats-card" whileHover={{ scale: 1.02 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Droplet size={20} color="var(--cyber-green)" />
            <span className="stats-card-label">Fat</span>
          </div>
          <div className="stats-card-value">{todayFat}g</div>
        </motion.div>
      </div>

      {/* Meals List */}
      <motion.div
        className="retro-card"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AnimatePresence>
            {meals.map((meal) => (
              <motion.div
                key={meal.mealId}
                className="list-item"
                variants={itemVariants}
                layout
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="list-item-icon">
                  <span style={{ fontSize: 24 }}>
                    {mealTypes.find((t) => t.value === meal.type)?.icon || '🍽️'}
                  </span>
                </div>
                <div className="list-item-content" style={{ flex: 1 }}>
                  <div className="list-item-title">{meal.name}</div>
                  <div className="list-item-subtitle">
                    {mealTypes.find((t) => t.value === meal.type)?.label}
                    <span style={{ margin: '0 8px' }}>·</span>
                    {format(new Date(meal.date), 'MMM d')}
                  </div>
                  <div style={{ marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                    P: {meal.protein || 0}g · C: {meal.carbs || 0}g · F: {meal.fat || 0}g
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div className="list-item-value">
                    <Flame size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                    {meal.calories} cal
                  </div>
                  <motion.button
                    onClick={() => handleDelete(meal.mealId)}
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
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {meals.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.5)' }}>
              <Utensils size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
              <p>No meals logged yet. Start tracking your nutrition!</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Add Meal Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Log Meal">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Meal Name</label>
            <input
              type="text"
              className="retro-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Grilled Chicken Salad"
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Meal Type</label>
              <select
                className="retro-input"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                {mealTypes.map((type) => (
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

          <div className="form-group">
            <label className="form-label">Calories</label>
            <input
              type="text"
              className="retro-input"
              value={formData.calories}
              onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
              placeholder="500"
              required
            />
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Protein (g)</label>
              <input
                type="text"
                className="retro-input"
                value={formData.protein}
                onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                placeholder="30"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Carbs (g)</label>
              <input
                type="text"
                className="retro-input"
                value={formData.carbs}
                onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                placeholder="50"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Fat (g)</label>
              <input
                type="text"
                className="retro-input"
                value={formData.fat}
                onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                placeholder="15"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              className="retro-input"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes..."
              rows={2}
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
            Save Meal
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
