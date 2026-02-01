import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../contexts/AuthContext';
import { initDynamoDB, getProgress, addProgress, deleteProgress } from '../services/dynamodb';
import { initS3, uploadPhoto, deletePhoto, getSignedPhotoUrl } from '../services/s3';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { Camera, Plus, Trash2, Upload, Scale, Percent, Calendar } from 'lucide-react';

export default function Progress() {
  const { user, credentials } = useAuth();
  const [progressEntries, setProgressEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [toast, setToast] = useState({ message: '', type: '', visible: false });
  const [photoUrls, setPhotoUrls] = useState({}); // Cache for signed URLs

  const [formData, setFormData] = useState({
    weight: '',
    bodyFat: '',
    chest: '',
    waist: '',
    hips: '',
    arms: '',
    thighs: '',
    notes: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    if (credentials) {
      initDynamoDB(credentials);
      initS3(credentials);
      loadProgress();
    }
  }, [credentials]);

  const loadProgress = async () => {
    try {
      const data = await getProgress(user.sub);
      setProgressEntries(data);
      
      // Generate signed URLs for all photos
      const urls = {};
      for (const entry of data) {
        if (entry.photoUrl) {
          try {
            urls[entry.progressId] = await getSignedPhotoUrl(entry.photoUrl);
          } catch (error) {
            console.error('Error generating signed URL for', entry.progressId, error);
          }
        }
      }
      setPhotoUrls(urls);
    } catch (error) {
      showToast('Error loading progress', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  };

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedPhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif', '.heic', '.heif', '.bmp', '.tiff', '.tif', '.svg'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPhoto) {
      showToast('Please select a photo', 'error');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    try {
      const progressId = uuidv4();
      const photoKey = await uploadPhoto(
        user.sub, 
        selectedPhoto, 
        progressId,
        (percentage) => setUploadProgress(percentage)
      );

      const progress = {
        progressId,
        photoUrl: photoKey, // Store the S3 key
        weight: formData.weight ? parseFloat(formData.weight) : null,
        bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : null,
        measurements: {
          chest: formData.chest ? parseFloat(formData.chest) : null,
          waist: formData.waist ? parseFloat(formData.waist) : null,
          hips: formData.hips ? parseFloat(formData.hips) : null,
          arms: formData.arms ? parseFloat(formData.arms) : null,
          thighs: formData.thighs ? parseFloat(formData.thighs) : null,
        },
        notes: formData.notes,
        date: formData.date,
      };

      await addProgress(user.sub, progress);
      
      // Generate signed URL for the new photo
      const signedUrl = await getSignedPhotoUrl(photoKey);
      setPhotoUrls(prev => ({ ...prev, [progressId]: signedUrl }));
      
      setProgressEntries([progress, ...progressEntries]);
      setModalOpen(false);
      resetForm();
      showToast('Progress photo saved!', 'success');
    } catch (error) {
      console.error('Error saving progress:', error);
      showToast('Error saving progress', 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (entry) => {
    try {
      await deletePhoto(entry.photoUrl);
      await deleteProgress(user.sub, entry.progressId);
      setProgressEntries(progressEntries.filter((p) => p.progressId !== entry.progressId));
      
      // Remove the signed URL from cache
      setPhotoUrls(prev => {
        const updated = { ...prev };
        delete updated[entry.progressId];
        return updated;
      });
      
      showToast('Progress entry deleted', 'success');
    } catch (error) {
      showToast('Error deleting progress', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      weight: '',
      bodyFat: '',
      chest: '',
      waist: '',
      hips: '',
      arms: '',
      thighs: '',
      notes: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    });
    setSelectedPhoto(null);
    setPreviewUrl(null);
    setUploadProgress(0);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  };

  const latestEntry = progressEntries[0];
  const previousEntry = progressEntries[1];
  const weightChange = latestEntry && previousEntry
    ? (latestEntry.weight - previousEntry.weight).toFixed(1)
    : null;

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
          <h1 className="page-title">Progress</h1>
          <p className="page-subtitle">
            <Camera size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Track your transformation journey
          </p>
        </div>
        <motion.button
          className="retro-button"
          onClick={() => setModalOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Add Progress
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: 32 }}>
        <motion.div className="stats-card" whileHover={{ scale: 1.02 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Scale size={20} color="var(--neon-pink)" />
            <span className="stats-card-label">Current Weight</span>
          </div>
          <div className="stats-card-value">
            {latestEntry?.weight ? `${latestEntry.weight} lbs` : '--'}
          </div>
          {weightChange && (
            <div style={{
              fontSize: 12,
              color: parseFloat(weightChange) > 0 ? 'var(--neon-pink)' : 'var(--cyber-green)',
              marginTop: 4,
            }}>
              {parseFloat(weightChange) > 0 ? '+' : ''}{weightChange} lbs from last
            </div>
          )}
        </motion.div>
        <motion.div className="stats-card" whileHover={{ scale: 1.02 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Percent size={20} color="var(--neon-blue)" />
            <span className="stats-card-label">Body Fat</span>
          </div>
          <div className="stats-card-value">
            {latestEntry?.bodyFat ? `${latestEntry.bodyFat}%` : '--'}
          </div>
        </motion.div>
        <motion.div className="stats-card" whileHover={{ scale: 1.02 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Calendar size={20} color="var(--neon-purple)" />
            <span className="stats-card-label">Total Entries</span>
          </div>
          <div className="stats-card-value">{progressEntries.length}</div>
        </motion.div>
      </div>

      {/* Progress Photos Grid */}
      <motion.div
        className="grid-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ gap: 20 }}
      >
        <AnimatePresence>
          {progressEntries.map((entry) => (
            <motion.div
              key={entry.progressId}
              className="retro-card"
              variants={itemVariants}
              layout
              exit={{ opacity: 0, scale: 0.8 }}
              style={{ padding: 0, overflow: 'hidden' }}
            >
              <div
                style={{
                  aspectRatio: '3/4',
                  backgroundImage: photoUrls[entry.progressId] 
                    ? `url(${photoUrls[entry.progressId]})`
                    : 'linear-gradient(135deg, rgba(255,42,109,0.1), rgba(0,255,255,0.1))',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {!photoUrls[entry.progressId] && (
                  <div className="spinner" style={{ width: 40, height: 40 }} />
                )}
                <motion.button
                  onClick={() => handleDelete(entry)}
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    background: 'rgba(0,0,0,0.7)',
                    border: '1px solid var(--neon-pink)',
                    color: 'var(--neon-pink)',
                    cursor: 'pointer',
                    padding: 8,
                    borderRadius: 4,
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 size={16} />
                </motion.button>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--neon-blue)', marginBottom: 8 }}>
                  {format(new Date(entry.date), 'MMMM d, yyyy')}
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {entry.weight && (
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                      <Scale size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                      {entry.weight} lbs
                    </span>
                  )}
                  {entry.bodyFat && (
                    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                      <Percent size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                      {entry.bodyFat}%
                    </span>
                  )}
                </div>
                {entry.notes && (
                  <p style={{ marginTop: 8, fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>
                    {entry.notes}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {progressEntries.length === 0 && (
        <div className="retro-card" style={{ textAlign: 'center', padding: 60 }}>
          <Camera size={64} style={{ marginBottom: 20, opacity: 0.3, color: 'var(--neon-blue)' }} />
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>
            No progress photos yet. Start documenting your journey!
          </p>
        </div>
      )}

      {/* Add Progress Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); resetForm(); }} title="Add Progress Photo">
        <form onSubmit={handleSubmit}>
          {/* Photo Upload */}
          <div className="form-group">
            <label className="form-label">Progress Photo</label>
            <div
              {...getRootProps()}
              style={{
                border: `2px dashed ${isDragActive ? 'var(--neon-pink)' : 'rgba(255,255,255,0.2)'}`,
                borderRadius: 8,
                padding: 30,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
                background: isDragActive ? 'rgba(255,42,109,0.1)' : 'transparent',
              }}
            >
              <input {...getInputProps()} />
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 4 }}
                />
              ) : (
                <>
                  <Upload size={32} style={{ marginBottom: 12, color: 'var(--neon-blue)' }} />
                  <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
                    Drag & drop a photo here, or click to select
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                    Max size: 10MB · JPG, PNG, WebP, GIF, HEIC, BMP, TIFF, SVG
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Weight (lbs)</label>
              <input
                type="number"
                step="0.1"
                className="retro-input"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="185.5"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Body Fat %</label>
              <input
                type="number"
                step="0.1"
                className="retro-input"
                value={formData.bodyFat}
                onChange={(e) => setFormData({ ...formData, bodyFat: e.target.value })}
                placeholder="15.0"
              />
            </div>
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

          <details style={{ marginBottom: 20 }}>
            <summary style={{
              cursor: 'pointer',
              color: 'var(--neon-blue)',
              fontSize: 14,
              fontFamily: 'var(--font-display)',
              letterSpacing: 1,
            }}>
              + Body Measurements (Optional)
            </summary>
            <div style={{ marginTop: 16 }}>
              <div className="grid-3">
                <div className="form-group">
                  <label className="form-label">Chest (in)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="retro-input"
                    value={formData.chest}
                    onChange={(e) => setFormData({ ...formData, chest: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Waist (in)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="retro-input"
                    value={formData.waist}
                    onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Hips (in)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="retro-input"
                    value={formData.hips}
                    onChange={(e) => setFormData({ ...formData, hips: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Arms (in)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="retro-input"
                    value={formData.arms}
                    onChange={(e) => setFormData({ ...formData, arms: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Thighs (in)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="retro-input"
                    value={formData.thighs}
                    onChange={(e) => setFormData({ ...formData, thighs: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </details>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              className="retro-input"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="How are you feeling? Any changes noticed?"
              rows={2}
              style={{ resize: 'vertical' }}
            />
          </div>

          <motion.button
            type="submit"
            className="retro-button"
            style={{ width: '100%' }}
            disabled={uploading}
            whileHover={{ scale: uploading ? 1 : 1.02 }}
            whileTap={{ scale: uploading ? 1 : 0.98 }}
          >
            {uploading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
                <span className="spinner" style={{ width: 20, height: 20 }} />
                <span>Uploading... {uploadProgress}%</span>
              </div>
            ) : (
              'Save Progress'
            )}
          </motion.button>

          {/* Progress Bar */}
          {uploading && (
            <div style={{ 
              marginTop: 12, 
              height: 4, 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: 2,
              overflow: 'hidden'
            }}>
              <motion.div 
                style={{ 
                  height: '100%', 
                  background: 'linear-gradient(90deg, var(--neon-pink), var(--neon-blue))',
                  borderRadius: 2,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}
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
