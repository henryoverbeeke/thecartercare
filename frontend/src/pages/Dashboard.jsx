import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { useAuth } from '../contexts/AuthContext';
import { initDynamoDB, getWorkouts, getMeals, getProgress } from '../services/dynamodb';
import { initS3 } from '../services/s3';
import { format, subDays, startOfDay, isAfter } from 'date-fns';
import { Flame, Dumbbell, Target, TrendingUp, Zap, Calendar, Lightbulb, RefreshCw, Brain, Stethoscope } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const doctorFacts = [
  // Dr. Sheri Dewan - Neurosurgeon
  { fact: "Your brain uses 20% of your body's total energy, even though it's only 2% of your body weight.", doctor: "Dr. Sheri Dewan", specialty: "Neurosurgeon" },
  { fact: "The brain can process images in as little as 13 milliseconds - faster than you can blink.", doctor: "Dr. Sheri Dewan", specialty: "Neurosurgeon" },
  { fact: "Your brain generates enough electricity to power a small light bulb when you're awake.", doctor: "Dr. Sheri Dewan", specialty: "Neurosurgeon" },
  { fact: "Physical exercise increases blood flow to the brain, promoting the growth of new neurons.", doctor: "Dr. Sheri Dewan", specialty: "Neurosurgeon" },
  { fact: "The brain's hippocampus, crucial for memory, can actually grow with regular aerobic exercise.", doctor: "Dr. Sheri Dewan", specialty: "Neurosurgeon" },
  { fact: "Dehydration can cause your brain to temporarily shrink, affecting concentration and mood.", doctor: "Dr. Sheri Dewan", specialty: "Neurosurgeon" },
  { fact: "Your brain continues to develop and change well into your 20s and beyond through neuroplasticity.", doctor: "Dr. Sheri Dewan", specialty: "Neurosurgeon" },
  { fact: "Sleep is when your brain clears out toxins - getting quality rest is essential for brain health.", doctor: "Dr. Sheri Dewan", specialty: "Neurosurgeon" },
  { fact: "Learning new skills creates new neural pathways, keeping your brain young and adaptable.", doctor: "Dr. Sheri Dewan", specialty: "Neurosurgeon" },
  { fact: "Chronic stress can physically damage the brain's structure - exercise is a powerful antidote.", doctor: "Dr. Sheri Dewan", specialty: "Neurosurgeon" },
  { fact: "Your brain has about 86 billion neurons, each connected to thousands of others.", doctor: "Dr. Sheri Dewan", specialty: "Neurosurgeon" },
  { fact: "Walking just 30 minutes a day can significantly reduce your risk of cognitive decline.", doctor: "Dr. Sheri Dewan", specialty: "Neurosurgeon" },
  { fact: "The brain's prefrontal cortex, responsible for decision-making, is highly sensitive to sleep deprivation.", doctor: "Dr. Sheri Dewan", specialty: "Neurosurgeon" },
  { fact: "Music activates more areas of the brain simultaneously than any other activity.", doctor: "Dr. Sheri Dewan", specialty: "Neurosurgeon" },
  { fact: "Your brain can form new connections at any age - it's never too late to learn.", doctor: "Dr. Sheri Dewan", specialty: "Neurosurgeon" },

  // Dr. Daniel Amen - Psychiatrist & Brain Health Expert
  { fact: "Your brain is involved in everything you do - when your brain works right, you work right.", doctor: "Dr. Daniel Amen", specialty: "Psychiatrist" },
  { fact: "What's good for your heart is good for your brain - cardiovascular exercise boosts brain function.", doctor: "Dr. Daniel Amen", specialty: "Psychiatrist" },
  { fact: "ANTs (Automatic Negative Thoughts) can poison your brain - learn to challenge them daily.", doctor: "Dr. Daniel Amen", specialty: "Psychiatrist" },
  { fact: "Your brain is soft like butter and housed in a hard skull - protect it from injury.", doctor: "Dr. Daniel Amen", specialty: "Psychiatrist" },
  { fact: "The foods you eat directly affect your brain's structure and function within hours.", doctor: "Dr. Daniel Amen", specialty: "Psychiatrist" },
  { fact: "Gratitude practices can literally change your brain chemistry and boost happiness.", doctor: "Dr. Daniel Amen", specialty: "Psychiatrist" },
  { fact: "Your brain makes about 35,000 decisions each day - fuel it well for better choices.", doctor: "Dr. Daniel Amen", specialty: "Psychiatrist" },
  { fact: "Omega-3 fatty acids are essential for brain health - your brain is 60% fat.", doctor: "Dr. Daniel Amen", specialty: "Psychiatrist" },
  { fact: "Brain health is the foundation of mental health - you can change your brain, change your life.", doctor: "Dr. Daniel Amen", specialty: "Psychiatrist" },
  { fact: "Meditation can increase the size of your hippocampus in just 8 weeks of regular practice.", doctor: "Dr. Daniel Amen", specialty: "Psychiatrist" },
  { fact: "Sugar is pro-inflammatory and can damage your brain - limit it for better mental clarity.", doctor: "Dr. Daniel Amen", specialty: "Psychiatrist" },
  { fact: "Your brain needs healthy fats, not a low-fat diet - avocados, nuts, and fish are brain food.", doctor: "Dr. Daniel Amen", specialty: "Psychiatrist" },
  { fact: "Loneliness is as bad for your brain as smoking - nurture your social connections.", doctor: "Dr. Daniel Amen", specialty: "Psychiatrist" },
  { fact: "The gut-brain connection is real - a healthy gut microbiome supports mental wellness.", doctor: "Dr. Daniel Amen", specialty: "Psychiatrist" },
  { fact: "You can boost your brain's reserve by continuously learning new things throughout life.", doctor: "Dr. Daniel Amen", specialty: "Psychiatrist" },
];

// Get today's doctor fact based on the date (changes daily)
const getDailyDoctorFact = () => {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  return doctorFacts[dayOfYear % doctorFacts.length];
};

const motivationalFacts = [
  { fact: "Muscle burns more calories at rest than fat. Building muscle boosts your metabolism 24/7!", category: "Fitness" },
  { fact: "Just 30 minutes of walking can improve your mood and reduce symptoms of depression.", category: "Mental Health" },
  { fact: "Drinking water before meals can help you eat less and lose weight more effectively.", category: "Nutrition" },
  { fact: "Your body replaces about 330 billion cells every day. Fuel it with good nutrition!", category: "Health" },
  { fact: "Consistency beats intensity. Small daily habits lead to big transformations.", category: "Motivation" },
  { fact: "Sleep is when your muscles repair and grow. Aim for 7-9 hours for optimal recovery.", category: "Recovery" },
  { fact: "Protein helps you feel full longer and preserves muscle mass during weight loss.", category: "Nutrition" },
  { fact: "Exercise releases endorphins - your body's natural mood boosters and painkillers.", category: "Science" },
  { fact: "It takes 21 days to build a habit and 90 days to make it a lifestyle. Keep going!", category: "Motivation" },
  { fact: "Your heart beats about 100,000 times per day. Cardio makes each beat stronger!", category: "Health" },
  { fact: "Stretching improves flexibility, reduces injury risk, and can lower stress levels.", category: "Fitness" },
  { fact: "The human body is 60% water. Staying hydrated improves energy and brain function.", category: "Health" },
  { fact: "Compound exercises like squats and deadlifts work multiple muscle groups efficiently.", category: "Fitness" },
  { fact: "Progress photos can be more accurate than the scale - muscle weighs more than fat!", category: "Motivation" },
  { fact: "Even a 5-minute workout is better than no workout. Every step counts!", category: "Motivation" },
  { fact: "Your metabolism peaks in the morning. A healthy breakfast kickstarts your day!", category: "Nutrition" },
  { fact: "Regular exercise can add up to 7 years to your life expectancy.", category: "Science" },
  { fact: "Laughing for 15 minutes burns up to 40 calories. Enjoy your fitness journey!", category: "Fun Fact" },
  { fact: "The strongest muscle in your body relative to its size is the masseter (jaw muscle).", category: "Fun Fact" },
  { fact: "Walking 10,000 steps burns approximately 400-500 calories depending on your weight.", category: "Fitness" },
];

export default function Dashboard() {
  const { user, credentials } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [meals, setMeals] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFact, setCurrentFact] = useState(() =>
    motivationalFacts[Math.floor(Math.random() * motivationalFacts.length)]
  );
  const [dailyDoctorFact] = useState(() => getDailyDoctorFact());

  const getNewFact = () => {
    let newFact;
    do {
      newFact = motivationalFacts[Math.floor(Math.random() * motivationalFacts.length)];
    } while (newFact.fact === currentFact.fact && motivationalFacts.length > 1);
    setCurrentFact(newFact);
  };

  useEffect(() => {
    if (credentials) {
      initDynamoDB(credentials);
      initS3(credentials);
      loadData();
    }
  }, [credentials]);

  const loadData = async () => {
    try {
      const [workoutData, mealData, progressData] = await Promise.all([
        getWorkouts(user.sub),
        getMeals(user.sub),
        getProgress(user.sub),
      ]);
      setWorkouts(workoutData);
      setMeals(mealData);
      setProgress(progressData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const today = startOfDay(new Date());
  const last7Days = subDays(today, 7);

  const todayWorkouts = workouts.filter((w) => w.date === format(today, 'yyyy-MM-dd'));
  const todayMeals = meals.filter((m) => m.date === format(today, 'yyyy-MM-dd'));
  const todayCaloriesBurned = todayWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0);
  const todayCaloriesConsumed = todayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);

  const weekWorkouts = workouts.filter((w) => isAfter(new Date(w.date), last7Days));
  const weekCaloriesBurned = weekWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0);

  // Chart data
  const last7DaysLabels = Array.from({ length: 7 }, (_, i) =>
    format(subDays(today, 6 - i), 'EEE')
  );

  const caloriesChartData = {
    labels: last7DaysLabels,
    datasets: [
      {
        label: 'Calories Burned',
        data: last7DaysLabels.map((_, i) => {
          const date = format(subDays(today, 6 - i), 'yyyy-MM-dd');
          return workouts
            .filter((w) => w.date === date)
            .reduce((sum, w) => sum + (w.calories || 0), 0);
        }),
        borderColor: '#d4a853',
        backgroundColor: 'rgba(212, 168, 83, 0.15)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Calories Consumed',
        data: last7DaysLabels.map((_, i) => {
          const date = format(subDays(today, 6 - i), 'yyyy-MM-dd');
          return meals
            .filter((m) => m.date === date)
            .reduce((sum, m) => sum + (m.calories || 0), 0);
        }),
        borderColor: '#1a1a1a',
        backgroundColor: 'rgba(26, 26, 26, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const macrosData = {
    labels: ['Protein', 'Carbs', 'Fat'],
    datasets: [
      {
        data: [
          todayMeals.reduce((sum, m) => sum + (m.protein || 0), 0),
          todayMeals.reduce((sum, m) => sum + (m.carbs || 0), 0),
          todayMeals.reduce((sum, m) => sum + (m.fat || 0), 0),
        ],
        backgroundColor: ['#d4a853', '#1a1a1a', '#e8a4b8'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#374151',
          font: { family: 'Inter, sans-serif' },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#6b7280' },
        grid: { color: '#e5e7eb' },
      },
      y: {
        ticks: { color: '#6b7280' },
        grid: { color: '#e5e7eb' },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#374151',
          font: { family: 'Inter, sans-serif' },
          padding: 20,
        },
      },
    },
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
      <motion.div className="page-header" variants={itemVariants}>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          <Calendar size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div className="grid-4" style={{ marginBottom: 32 }} variants={itemVariants}>
        <motion.div className="stats-card" whileHover={{ scale: 1.02 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Flame size={24} color="#d4a853" />
            <span className="stats-card-label">Calories Burned Today</span>
          </div>
          <div className="stats-card-value">{todayCaloriesBurned}</div>
        </motion.div>

        <motion.div className="stats-card" whileHover={{ scale: 1.02 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Zap size={24} color="#1a1a1a" />
            <span className="stats-card-label">Calories Consumed</span>
          </div>
          <div className="stats-card-value">{todayCaloriesConsumed}</div>
        </motion.div>

        <motion.div className="stats-card" whileHover={{ scale: 1.02 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Dumbbell size={24} color="#b8923d" />
            <span className="stats-card-label">Workouts Today</span>
          </div>
          <div className="stats-card-value">{todayWorkouts.length}</div>
        </motion.div>

        <motion.div className="stats-card" whileHover={{ scale: 1.02 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <TrendingUp size={24} color="#d4a853" />
            <span className="stats-card-label">Week Total Burned</span>
          </div>
          <div className="stats-card-value">{weekCaloriesBurned}</div>
        </motion.div>
      </motion.div>

      {/* Motivational Fact */}
      <motion.div
        className="motivation-card"
        variants={itemVariants}
        style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          borderRadius: 16,
          padding: 24,
          marginBottom: 32,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #d4a853 0%, #b8923d 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Lightbulb size={28} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#d4a853',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 6,
            }}
          >
            {currentFact.category}
          </div>
          <p style={{ color: 'white', fontSize: 16, lineHeight: 1.5, margin: 0 }}>
            {currentFact.fact}
          </p>
        </div>
        <motion.button
          onClick={getNewFact}
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: 8,
            padding: 10,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RefreshCw size={20} color="#d4a853" />
        </motion.button>
      </motion.div>

      {/* Daily Doctor Fact */}
      <motion.div
        className="doctor-fact-card"
        variants={itemVariants}
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          borderRadius: 16,
          padding: 24,
          marginBottom: 32,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 20,
          border: '2px solid #e8a4b8',
          boxShadow: '0 4px 20px rgba(232, 164, 184, 0.15)',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #e8a4b8 0%, #d4839a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {dailyDoctorFact.specialty === 'Neurosurgeon' ? (
            <Brain size={28} color="white" />
          ) : (
            <Stethoscope size={28} color="white" />
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: '#1a1a1a',
              }}
            >
              {dailyDoctorFact.doctor}
            </span>
            <span
              style={{
                fontSize: 12,
                color: '#6b7280',
                background: '#f3f4f6',
                padding: '2px 8px',
                borderRadius: 4,
              }}
            >
              {dailyDoctorFact.specialty}
            </span>
          </div>
          <p style={{ color: '#374151', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
            "{dailyDoctorFact.fact}"
          </p>
          <div
            style={{
              marginTop: 12,
              fontSize: 12,
              color: '#9ca3af',
              fontStyle: 'italic',
            }}
          >
            Daily Health Insight - Changes every day
          </div>
        </div>
      </motion.div>

      {/* Charts */}
      <motion.div className="grid-2" style={{ marginBottom: 32 }} variants={itemVariants}>
        <div className="chart-container">
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              marginBottom: 20,
              color: '#1a1a1a',
              fontSize: 14,
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            7-Day Calorie Trend
          </h3>
          <div style={{ height: 300 }}>
            <Line data={caloriesChartData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-container">
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              marginBottom: 20,
              color: '#1a1a1a',
              fontSize: 14,
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            Today's Macros
          </h3>
          <div style={{ height: 300 }}>
            <Doughnut data={macrosData} options={doughnutOptions} />
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div className="grid-2" variants={itemVariants}>
        <div className="retro-card">
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              marginBottom: 20,
              color: '#d4a853',
              fontSize: 14,
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            <Dumbbell size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Recent Workouts
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {workouts.slice(0, 5).map((workout) => (
              <div key={workout.workoutId} className="list-item">
                <div className="list-item-icon">
                  <Dumbbell size={20} color="white" />
                </div>
                <div className="list-item-content">
                  <div className="list-item-title">{workout.name}</div>
                  <div className="list-item-subtitle">
                    {workout.duration} min · {workout.type}
                  </div>
                </div>
                <div className="list-item-value">{workout.calories} cal</div>
              </div>
            ))}
            {workouts.length === 0 && (
              <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: 20 }}>
                No workouts logged yet
              </p>
            )}
          </div>
        </div>

        <div className="retro-card">
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              marginBottom: 20,
              color: '#d4a853',
              fontSize: 14,
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            <Target size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Recent Progress
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {progress.slice(0, 4).map((p) => (
              <div key={p.progressId} className="list-item">
                <div
                  style={{
                    width: 50,
                    height: 50,
                    backgroundImage: `url(${p.photoUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <div className="list-item-content">
                  <div className="list-item-title">{format(new Date(p.date), 'MMM d, yyyy')}</div>
                  <div className="list-item-subtitle">
                    {p.weight && `${p.weight} lbs`}
                    {p.bodyFat && ` · ${p.bodyFat}% BF`}
                  </div>
                </div>
              </div>
            ))}
            {progress.length === 0 && (
              <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: 20 }}>
                No progress photos yet
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
