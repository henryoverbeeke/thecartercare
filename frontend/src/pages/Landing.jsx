import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, Dumbbell, Utensils, Camera, TrendingUp, Sparkles, ArrowRight, Check, Star, Users, Award, Zap } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const [keySequence, setKeySequence] = useState('');
  const [showSecretReview, setShowSecretReview] = useState(false);
  const [showSecretReview2, setShowSecretReview2] = useState(false);
  const [showSecretReview3, setShowSecretReview3] = useState(false);
  const [showSecretReview4, setShowSecretReview4] = useState(false);
  const [showSecretReview5, setShowSecretReview5] = useState(false);
  const [showSecretReview6, setShowSecretReview6] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only capture numeric keys
      if (e.key >= '0' && e.key <= '9') {
        setKeySequence(prev => {
          const newSequence = (prev + e.key).slice(-3); // Keep only last 3 digits
          
          // Check if the sequence is 999
          if (newSequence === '999') {
            setShowSecretReview(true);
            return '';
          }

          // Check if the sequence is 222
          if (newSequence === '222') {
            setShowSecretReview2(true);
            return '';
          }

          // Check if the sequence is 111
          if (newSequence === '111') {
            setShowSecretReview3(true);
            return '';
          }

          // Check if the sequence is 444
          if (newSequence === '444') {
            setShowSecretReview4(true);
            return '';
          }

          // Check if the sequence is 333
          if (newSequence === '333') {
            setShowSecretReview5(true);
            return '';
          }

          // Check if the sequence is 555
          if (newSequence === '555') {
            setShowSecretReview6(true);
            return '';
          }
          
          return newSequence;
        });

        // Clear the sequence after 2 seconds of no typing
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          setKeySequence('');
        }, 2000);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const features = [
    {
      icon: <Dumbbell size={32} />,
      title: 'Workout Tracking',
      description: 'Log your exercises, track sets, reps, and calories burned with ease.',
    },
    {
      icon: <Utensils size={32} />,
      title: 'Nutrition Logging',
      description: 'Track your meals, macros, and daily calorie intake effortlessly.',
    },
    {
      icon: <Camera size={32} />,
      title: 'Progress Photos',
      description: 'Document your transformation with progress photos and measurements.',
    },
    {
      icon: <TrendingUp size={32} />,
      title: 'Analytics Dashboard',
      description: 'Visualize your progress with beautiful charts and insights.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Create Your Account',
      description: 'Sign up in seconds and set your fitness goals.',
    },
    {
      number: '02',
      title: 'Log Your Activities',
      description: 'Track workouts, meals, and progress photos daily.',
    },
    {
      number: '03',
      title: 'See Your Progress',
      description: 'Watch your transformation with detailed analytics.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Lost 30 lbs',
      quote: 'Carter Care made tracking my fitness journey so simple. The dashboard keeps me motivated every day!',
      rating: 5,
    },
    {
      name: 'Mike T.',
      role: 'Gained 15 lbs muscle',
      quote: 'Finally an app that tracks both workouts AND nutrition in one place. Game changer for my bulk.',
      rating: 5,
    },
    {
      name: 'Emily R.',
      role: 'Marathon Runner',
      quote: 'The progress photos feature is amazing. Seeing my transformation over time keeps me going.',
      rating: 5,
    },
  ];

  // Secret testimonial that appears when user types 999
  const secretTestimonial = {
    name: 'Vivian B.',
    role: 'Gained 1,000 lbs',
    quote: 'I can\'t believe how amazing Carter Care has been for me! When I started, I never imagined I\'d gain 1,000 pounds so fast! The tracking features made it incredibly easy to monitor my progress every single day. This transformation happened so quickly, and I owe it all to Carter Care. Absolutely life-changing!',
    rating: 5,
    isSecret: true,
  };

  // Secret testimonial that appears when user types 222
  const secretTestimonial2 = {
    name: 'Big Dave K.',
    role: 'Lost 100 lbs (700 → 600)',
    quote: 'I used to be 700 pounds, but thanks to Carter Care I\'m down to 600! The app really helped me track my meals. I still eat 3 quarter pounders a day but now I log every single one. My doctor said he\'s never seen progress like this. Carter Care helped me realize that accountability is everything. 10/10 would recommend to anyone on a similar journey!',
    rating: 5,
    isSecret: true,
  };

  // Secret testimonial that appears when user types 111
  const secretTestimonial3 = {
    name: 'Gary W.',
    role: 'Lost 1 lb',
    quote: 'I lost a whole pound! Sure, I still eat 1,000 quarter pounders a day, but hey that\'s better than the 10,000 I was eating before. Carter Care really opened my eyes to portion control. The meal tracker was a wake up call — I didn\'t even realize I was hitting 2.5 million calories a day. Baby steps, people. Baby steps.',
    rating: 5,
    isSecret: true,
  };

  // Secret testimonial that appears when user types 444
  const secretTestimonial4 = {
    name: 'Big Neck Jr.',
    role: 'Drank 100,000 grimace shakes',
    quote: 'ok so i drink like 100000 grimase shakes a day and also like 200 oreo blizards and carter care helpd me track all of them!! my mom says i need to stop but i told her im on a meal plan now so its fine. the app is relly good becuz it counts all my caleries and stuff. i also ate 47 happy meals yesterday but thats not as bad as last week wen it was 50 so im improveing. best app ever i give it 5 stars!!!',
    rating: 5,
    isSecret: true,
  };

  // Secret testimonial that appears when user types 333
  const secretTestimonial5 = {
    name: 'Tony "Thunder" R.',
    role: 'Survived the storm',
    quote: 'Before Carter Care I had explosive diarrhea every single day. Like EVERY day. I\'m talking code red situations at work, at the gym, at my kid\'s soccer game. Turns out I was eating 14 gas station burritos a day and didn\'t even realize it until I started logging my meals. Now I\'m down to 6 and the situation has improved dramatically. My coworkers finally sit near me at lunch again. This app literally saved my social life. Thank you Carter Care!!!',
    rating: 5,
    isSecret: true,
  };

  // Secret testimonial that appears when user types 555
  const secretTestimonial6 = {
    name: 'Ronald M.',
    role: 'Lives at McDonald\'s',
    quote: 'So I basically live at McDonald\'s. Like I literally live there. I sleep in the booth by the PlayPlace and the night crew just lets me stay. Carter Care helped me realize I was eating 37 Big Macs a day which is apparently "not normal" according to my doctor. The app also tracked that I haven\'t left the building in 8 months. But the free wifi is great and I log all my meals right from my booth. 5 stars, would recommend to anyone who calls McDonald\'s home.',
    rating: 5,
    isSecret: true,
  };

  // Combine testimonials, adding secret ones if unlocked
  const displayedTestimonials = [
    ...testimonials,
    ...(showSecretReview ? [secretTestimonial] : []),
    ...(showSecretReview2 ? [secretTestimonial2] : []),
    ...(showSecretReview3 ? [secretTestimonial3] : []),
    ...(showSecretReview4 ? [secretTestimonial4] : []),
    ...(showSecretReview5 ? [secretTestimonial5] : []),
    ...(showSecretReview6 ? [secretTestimonial6] : []),
  ];

  const stats = [
    { value: '10K+', label: 'Active Users' },
    { value: '500K+', label: 'Workouts Logged' },
    { value: '1M+', label: 'Meals Tracked' },
    { value: '98%', label: 'Satisfaction' },
  ];

  return (
    <div className="landing">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-nav-content">
          <div className="nav-logo">
            <Heart size={24} className="heart-icon" />
            <span className="gradient-text">Carter Care</span>
          </div>
          <div className="landing-nav-buttons">
            <button className="btn-text" onClick={() => navigate('/login')}>
              Sign In
            </button>
            <motion.button
              className="btn-primary btn-small"
              onClick={() => navigate('/login')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles size={16} />
            <span>Your Fitness Journey Starts Here</span>
          </motion.div>

          <h1 className="hero-title">
            Track Your Health,
            <br />
            <span className="gradient-text">Transform Your Life</span>
          </h1>

          <p className="hero-subtitle">
            Carter Care helps you stay on top of your workouts, nutrition, and progress.
            Simple, beautiful, and designed to help you succeed.
          </p>

          <div className="hero-buttons">
            <motion.button
              className="btn-primary"
              onClick={() => navigate('/login')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started Free
              <ArrowRight size={20} />
            </motion.button>
            <motion.button
              className="btn-secondary"
              onClick={() => navigate('/login')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign In
            </motion.button>
          </div>

          <div className="hero-trust">
            <div className="hero-trust-avatars">
              <div className="avatar">S</div>
              <div className="avatar">M</div>
              <div className="avatar">E</div>
              <div className="avatar">+</div>
            </div>
            <span>Join 10,000+ users transforming their health</span>
          </div>
        </motion.div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="hero-card">
            <div className="hero-card-header">
              <Heart size={24} className="heart-icon" />
              <span>Today's Progress</span>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-value">1,847</span>
                <span className="hero-stat-label">Calories Burned</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-value">45</span>
                <span className="hero-stat-label">Min Workout</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-value">128g</span>
                <span className="hero-stat-label">Protein</span>
              </div>
            </div>
            <div className="hero-progress-bar">
              <div className="hero-progress-fill" style={{ width: '73%' }} />
            </div>
            <span className="hero-progress-label">73% of daily goal</span>
          </div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="stats-bar">
        <div className="stats-bar-content">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="stats-bar-item"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <span className="stats-bar-value">{stat.value}</span>
              <span className="stats-bar-label">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <motion.div
          className="features-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2>Everything You Need</h2>
          <p>Powerful features to help you reach your fitness goals</p>
        </motion.div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <motion.div
          className="how-it-works-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2>How It Works</h2>
          <p>Get started in three simple steps</p>
        </motion.div>

        <div className="steps-grid">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              className="step-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
            >
              <span className="step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <motion.div
          className="testimonials-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2>Loved by Thousands</h2>
          <p>See what our users have to say</p>
        </motion.div>

        <div className="testimonials-grid">
          {displayedTestimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              className={`testimonial-card ${testimonial.isSecret ? 'secret-testimonial' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              {testimonial.isSecret && (
                <div className="secret-badge">
                  <Sparkles size={14} />
                  <span>Secret Unlocked!</span>
                </div>
              )}
              <div className="testimonial-stars">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="#d4a853" color="#d4a853" />
                ))}
              </div>
              <p className="testimonial-quote">"{testimonial.quote}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{testimonial.name[0]}</div>
                <div>
                  <div className="testimonial-name">{testimonial.name}</div>
                  <div className="testimonial-role">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="benefits">
        <div className="benefits-content">
          <motion.div
            className="benefits-text"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2>Why Choose Carter Care?</h2>
            <p>We're more than just a tracking app. We're your partner in achieving your health goals.</p>
            <ul className="benefits-list">
              <li>
                <Check size={20} />
                <span>All-in-one fitness tracking</span>
              </li>
              <li>
                <Check size={20} />
                <span>Beautiful, intuitive interface</span>
              </li>
              <li>
                <Check size={20} />
                <span>Secure cloud storage for your data</span>
              </li>
              <li>
                <Check size={20} />
                <span>Progress visualization with charts</span>
              </li>
              <li>
                <Check size={20} />
                <span>Works on any device</span>
              </li>
            </ul>
          </motion.div>
          <motion.div
            className="benefits-visual"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="benefits-cards">
              <div className="benefit-mini-card">
                <Users size={24} />
                <span>Community Support</span>
              </div>
              <div className="benefit-mini-card">
                <Award size={24} />
                <span>Achievement Badges</span>
              </div>
              <div className="benefit-mini-card">
                <Zap size={24} />
                <span>Fast & Reliable</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <motion.div
          className="cta-content"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2>Ready to Start Your Journey?</h2>
          <p>Join thousands of people transforming their health with Carter Care</p>
          <motion.button
            className="btn-primary btn-large"
            onClick={() => navigate('/login')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Create Free Account
            <ArrowRight size={20} />
          </motion.button>
          <span className="cta-hint">No credit card required</span>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <Heart size={24} className="heart-icon" />
            <span>Carter Care</span>
          </div>
          <p>Made with love for your health journey</p>
        </div>
      </footer>
    </div>
  );
}
