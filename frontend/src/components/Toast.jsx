import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function Toast({ message, type = 'info', isVisible, onClose }) {
  const icons = {
    success: <CheckCircle size={20} color="var(--cyber-green)" />,
    error: <AlertCircle size={20} color="var(--neon-pink)" />,
    info: <Info size={20} color="var(--neon-blue)" />,
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`toast ${type}`}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={onClose}
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
        >
          {icons[type]}
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
