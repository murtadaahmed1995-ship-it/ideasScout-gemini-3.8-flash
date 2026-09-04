import React, { useState } from 'react';
import { Profile } from '../../types';
import { Glyph } from '../Glyph';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
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
        <section className="panel profile-identity">
          <div className="profile-avatar-large">
            <span>{getMonogram(formData.name)}</span>
          </div>

          <h2>{formData.name}</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{formData.email}</p>

          <span className="launch-chip free-plan" style={{ marginTop: '0.75rem' }}>
            <span className="live-dot" />
            {isArabic ? 'وصول مبكر مجاني' : 'FREE EARLY ACCESS'}
          </span>

          <div className="profile-security" style={{ marginTop: '1.5rem', textAlign: 'start' }}>
            <span className="panel-kicker">
              {isArabic ? 'حماية وعزل البيانات' : 'DATA SECURITY & PRIVACY'}
            </span>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
              {isArabic
                ? 'تحليلاتك وافتراضاتك محمية ومحفوظة ضمن مساحة عملك الخاصة ولا تتم مشاركتها أو تدريب نماذج عامة عليها.'
                : 'Your idea data and assumptions remain isolated and encrypted in your workspace, never shared or used to train external models.'}
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline"
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
                <label>{isArabic ? 'البريد الإلكتروني' : 'Email Address'}</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
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
    </div>
  );
};
