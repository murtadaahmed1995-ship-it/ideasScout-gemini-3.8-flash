import React, { useState, useRef } from 'react';
import { Profile } from '../../types';
import { Glyph } from '../Glyph';
import { Camera, Upload, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ProfileViewProps {
  isArabic: boolean;
  profile: Profile;
  onUpdateProfile: (updated: Profile) => void;
  onSignOut: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  isArabic,
  profile,
  onUpdateProfile,
  onSignOut,
}) => {
  const [formData, setFormData] = useState<Profile>(profile);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(formData.email)) {
      setEmailError(true);
      return;
    }
    setEmailError(false);
    onUpdateProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setFormData(prev => ({ ...prev, avatarUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      alert(isArabic ? 'تعذر الوصول إلى الكاميرا. يرجى التحقق من الصلاحيات.' : 'Could not access camera. Please check permissions.');
      setIsCameraOpen(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setFormData(prev => ({ ...prev, avatarUrl: dataUrl }));
    }
    stopCamera();
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const getMonogram = (name: string) => {
    return (
      name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase() || 'MA'
    );
  };

  return (
    <div className="view-stack profile-view">
      <div className="profile-grid">
        {/* Identity Panel */}
        <section className="panel profile-identity" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <div
              className="profile-avatar-large"
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, var(--cyan), var(--blue))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 700,
                color: '#fff',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
              }}
            >
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span>{getMonogram(formData.name)}</span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <label className="btn btn-secondary" style={{ fontSize: '11px', padding: '6px 12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Upload className="w-3.5 h-3.5" />
              <span>{isArabic ? 'تحميل صورة' : 'Upload Image'}</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={startCamera}
              style={{ fontSize: '11px', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{isArabic ? 'التقاط صورة' : 'Take Photo'}</span>
            </button>
          </div>

          <h2>{formData.name}</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px', marginBottom: '8px' }}>
            <span style={{
              background: 'rgba(67, 230, 210, 0.15)',
              color: 'var(--cyan)',
              border: '1px solid rgba(67, 230, 210, 0.3)',
              padding: '2px 12px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 700
            }}>
              {formData.role}
            </span>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
            {formData.email}
            {validateEmail(formData.email) ? (
              <span title={isArabic ? 'البريد مؤكد' : 'Verified Email'} style={{ display: 'inline-flex' }}>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </span>
            ) : (
              <span title={isArabic ? 'البريد غير صالح' : 'Invalid Email Format'} style={{ display: 'inline-flex' }}>
                <AlertCircle className="w-4 h-4 text-amber-400" />
              </span>
            )}
          </p>

          <span className="launch-chip free-plan" style={{ marginTop: '0.75rem' }}>
            <span className="live-dot" />
            {isArabic ? 'وصول مبكر مجاني' : 'FREE EARLY ACCESS'}
          </span>

          <div className="profile-security" style={{ marginTop: '1.5rem', textAlign: 'start', width: '100%' }}>
            <span className="panel-kicker">
              {isArabic ? 'تخزين وحفظ البيانات' : 'DATA STORAGE & PRIVACY'}
            </span>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
              {isArabic
                ? 'تُحفظ بيانات أفكارك وافتراضاتك وتقييماتك بشكل محلي مباشر في متصفحك (Local Storage) ضمن مساحة عملك الخاصة دون إرسالها إلى قاعدة بيانات خارجية.'
                : 'Your idea data, assumptions, and reports are persisted directly in your browser local storage within your local workspace architecture.'}
            </p>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ marginTop: '2rem', width: '100%' }}
            onClick={onSignOut}
          >
            {isArabic ? 'العودة للصفحة الرئيسية' : 'Return to Home Page'}
          </button>
        </section>

        {/* Settings Panel */}
        <section className="panel settings-panel">
          <div className="panel-topline">
            <div>
              <span className="panel-kicker">
                {isArabic ? 'إعدادات الحساب والتفضيلات' : 'ACCOUNT PREFERENCES'}
              </span>
              <h2>{isArabic ? 'بيانات المؤسس' : 'Founder Profile'}</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>{isArabic ? 'الاسم الكامل' : 'Full Name'}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{isArabic ? 'البريد الإلكتروني' : 'Email Address'}</span>
                  {validateEmail(formData.email) ? (
                    <span style={{ fontSize: '10px', color: '#52e8ac', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <CheckCircle2 className="w-3 h-3" /> {isArabic ? 'مؤكد وصحيح' : 'Verified'}
                    </span>
                  ) : (
                    <span style={{ fontSize: '10px', color: '#f87171', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <AlertCircle className="w-3 h-3" /> {isArabic ? 'صيغة غير صحيحة' : 'Invalid format'}
                    </span>
                  )}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, email: val });
                    if (validateEmail(val)) setEmailError(false);
                  }}
                  style={{
                    borderColor: emailError || !validateEmail(formData.email) ? 'rgba(248, 113, 113, 0.5)' : undefined
                  }}
                />
                {emailError && (
                  <span style={{ fontSize: '11px', color: '#f87171', marginTop: '4px', display: 'block' }}>
                    {isArabic ? 'يرجى إدخال بريد إلكتروني صحيح (مثال: user@example.com)' : 'Please enter a valid email address.'}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>{isArabic ? 'الدور والتركيز' : 'Role & Focus'}</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>{isArabic ? 'المنطقة الزمنية' : 'Timezone'}</label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                >
                  <option value="Asia/Dubai">Asia/Dubai (GST +04:00)</option>
                  <option value="Asia/Riyadh">Asia/Riyadh (AST +03:00)</option>
                  <option value="Europe/London">Europe/London (GMT +00:00)</option>
                  <option value="America/New_York">America/New_York (EST -05:00)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PST -08:00)</option>
                </select>
              </div>
            </div>

            <div className="settings-section" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--line)', paddingTop: '1.25rem' }}>
              <span className="panel-kicker">
                {isArabic ? 'الإشعارات والتحديثات' : 'NOTIFICATIONS & DIGESTS'}
              </span>

              <div className="toggle-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <div>
                  <strong>{isArabic ? 'الموجز الأسبوعي للفرص' : 'Weekly Opportunity Digest'}</strong>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                    {isArabic
                      ? 'ملخص أسبوعي لتغير مؤشرات الأفكار وأولويات التحقق القادمة.'
                      : 'Weekly email summary of signal movements and priority next moves.'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.weeklyDigest}
                  onChange={(e) => setFormData({ ...formData, weeklyDigest: e.target.checked })}
                  style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--cyan)' }}
                />
              </div>

              <div className="toggle-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <div>
                  <strong>{isArabic ? 'تنبيهات الإشارات الحرجة' : 'Critical Signal Alerts'}</strong>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                    {isArabic
                      ? 'تنبيهات عند رصد انخفاض في الثقة أو وجود فجوة حاسمة في الأدلة.'
                      : 'Notify immediately if evidence decay or risk shifts lower a score.'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.signalAlerts}
                  onChange={(e) => setFormData({ ...formData, signalAlerts: e.target.checked })}
                  style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--cyan)' }}
                />
              </div>
            </div>

            <div className="settings-footer" style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary">
                <Glyph name="check" />
                <span>{isArabic ? 'حفظ التفضيلات' : 'Save preferences'}</span>
              </button>
              {savedSuccess && (
                <span style={{ color: 'var(--cyan)', fontSize: '0.9rem' }}>
                  ✓ {isArabic ? 'تم الحفظ بنجاح' : 'Preferences saved successfully'}
                </span>
              )}
            </div>
          </form>
        </section>
      </div>

      {/* Camera Capture Modal */}
      {isCameraOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--navy-2)',
            border: '1px solid var(--line)',
            borderRadius: '16px',
            padding: '20px',
            maxWidth: '500px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: 'var(--ink)' }}>
                {isArabic ? 'التقاط صورة شخصية مباشرة' : 'Capture Live Profile Photo'}
              </h3>
              <button
                type="button"
                onClick={stopCamera}
                style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div style={{ position: 'relative', width: '100%', background: '#000', borderRadius: '12px', overflow: 'hidden', aspectRatio: '4/3' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={stopCamera}
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={capturePhoto}
              >
                <Camera className="w-4 h-4" />
                <span>{isArabic ? 'التقاط الصورة' : 'Capture Photo'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
