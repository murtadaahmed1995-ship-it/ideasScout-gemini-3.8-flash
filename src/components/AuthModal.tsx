import React, { useState } from 'react';
import { Profile } from '../types';
import { ShieldCheck, Mail, Lock, User, Briefcase, AlertCircle, X, CheckCircle2, Send } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: Profile) => void;
  isArabic: boolean;
  currentProfile: Profile;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isArabic,
  currentProfile,
}) => {
  const [tab, setTab] = useState<'signin' | 'signup'>('signup');
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [email, setEmail] = useState(currentProfile.email || '');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(currentProfile.name || '');
  const [role, setRole] = useState(currentProfile.role || (isArabic ? 'صاحب فكرة' : 'Idea Owner'));
  
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingProfile, setPendingProfile] = useState<Profile | null>(null);

  if (!isOpen) return null;

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const validatePassword = (val: string) => val.length >= 6;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateEmail(email)) {
      setErrorMessage(isArabic ? 'يرجى إدخال بريد إلكتروني فعال وصحيح.' : 'Please enter a valid active email address.');
      return;
    }

    if (tab === 'signup' && !validatePassword(password)) {
      setErrorMessage(isArabic ? 'كلمة المرور ضعيفة. يجب أن تكون 6 أحرف على الأقل.' : 'Password is too weak. Must be at least 6 characters.');
      return;
    }

    const newProfile: Profile = {
      ...currentProfile,
      name: name.trim() || (isArabic ? 'مؤسس جديد' : 'New Founder'),
      email: email.trim(),
      role: role.trim(),
      emailVerified: tab === 'signin' ? true : false
    };

    if (tab === 'signup') {
      // Mandatory email verification step
      setPendingProfile(newProfile);
      setStep('verify');
    } else {
      // Sign in directly
      onSuccess(newProfile);
      onClose();
    }
  };

  const handleSimulateVerification = () => {
    if (pendingProfile) {
      const verifiedProfile = { ...pendingProfile, emailVerified: true };
      onSuccess(verifiedProfile);
      setStep('form');
      setPendingProfile(null);
      onClose();
    }
  };

  const rolesList = isArabic ? [
    { id: 'Idea Owner', label: 'صاحب فكرة (Idea Owner)' },
    { id: 'Project Executor', label: 'منفذ مشروع (Project Executor)' },
    { id: 'Project Investor', label: 'ممول لمشروع (Project Investor)' },
    { id: 'Manager', label: 'مدير (Manager)' },
    { id: 'Consultant', label: 'مستشار / خبير (Consultant)' }
  ] : [
    { id: 'Idea Owner', label: 'Idea Owner' },
    { id: 'Project Executor', label: 'Project Executor' },
    { id: 'Project Investor', label: 'Project Investor' },
    { id: 'Manager', label: 'Manager' },
    { id: 'Consultant', label: 'Consultant' }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--navy-2)',
        border: '1px solid rgba(67, 230, 210, 0.3)',
        borderRadius: '20px',
        padding: '32px',
        maxWidth: '460px',
        width: '100%',
        boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="panel-kicker">{isArabic ? 'بوابة مصادقة المنصة' : 'PLATFORM AUTHENTICATION'}</span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
              {step === 'verify'
                ? (isArabic ? 'التحقق الإلزامي من البريد الإلكتروني' : 'Mandatory Email Verification')
                : (tab === 'signup' ? (isArabic ? 'إنشاء حساب جديد' : 'Create New Account') : (isArabic ? 'تسجيل الدخول' : 'Sign In'))}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => { setStep('form'); onClose(); }}
            style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'verify' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(67, 230, 210, 0.15)',
              border: '1px solid rgba(67, 230, 210, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              color: 'var(--cyan)'
            }}>
              <Send className="w-7 h-7" />
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '8px' }}>
                {isArabic ? 'تم إرسال رابط التحقق إلى بريدك' : 'Verification Link Sent'}
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                {isArabic
                  ? `لقد أرسلنا رسالة تحقق إلى البريد (${email}). يرجى تأكيد البريد الإلكتروني لفتح صلاحية الدخول لمساحة العمل.`
                  : `We sent a verification link to (${email}). Please confirm your email to unlock your workspace access.`}
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSimulateVerification}
              style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isArabic ? 'انقر هنا لتأكيد البريد (محاكاة رابط المصادقة)' : 'Click to Verify Email (Simulate Auth Link)'}</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setStep('form')}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {isArabic ? 'العودة للتسجيل' : 'Back to Registration'}
            </button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--navy-3)', padding: '4px', borderRadius: '10px' }}>
              <button
                type="button"
                onClick={() => setTab('signup')}
                style={{
                  background: tab === 'signup' ? 'var(--cyan)' : 'transparent',
                  color: tab === 'signup' ? '#0b1329' : 'var(--muted)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {isArabic ? 'حساب جديد' : 'Register'}
              </button>
              <button
                type="button"
                onClick={() => setTab('signin')}
                style={{
                  background: tab === 'signin' ? 'var(--cyan)' : 'transparent',
                  color: tab === 'signin' ? '#0b1329' : 'var(--muted)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {isArabic ? 'تسجيل الدخول' : 'Sign In'}
              </button>
            </div>

            {errorMessage && (
              <div style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.3)', padding: '10px 14px', borderRadius: '8px', color: '#f87171', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {tab === 'signup' && (
                <div className="form-group">
                  <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
                    {isArabic ? 'الاسم الكامل' : 'Full Name'}
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <User className="w-4 h-4 text-cyan-400" style={{ position: 'absolute', left: isArabic ? 'unset' : '12px', right: isArabic ? '12px' : 'unset' }} />
                    <input
                      type="text"
                      required
                      placeholder={isArabic ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px 10px 36px', background: 'var(--navy-3)', border: '1px solid var(--line)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
                  {isArabic ? 'البريد الإلكتروني الفعال (إلزامي للتحقق)' : 'Active Email Address (Mandatory Verification)'}
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail className="w-4 h-4 text-cyan-400" style={{ position: 'absolute', left: isArabic ? 'unset' : '12px', right: isArabic ? '12px' : 'unset' }} />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px 10px 36px', background: 'var(--navy-3)', border: '1px solid var(--line)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
                  {isArabic ? 'كلمة المرور القوية' : 'Strong Password'}
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock className="w-4 h-4 text-cyan-400" style={{ position: 'absolute', left: isArabic ? 'unset' : '12px', right: isArabic ? '12px' : 'unset' }} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px 10px 36px', background: 'var(--navy-3)', border: '1px solid var(--line)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                  />
                </div>
              </div>

              {tab === 'signup' && (
                <div className="form-group">
                  <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
                    {isArabic ? 'وضع المسجل (الدور في المشروع)' : 'Registrant Role / Position'}
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Briefcase className="w-4 h-4 text-cyan-400" style={{ position: 'absolute', left: isArabic ? 'unset' : '12px', right: isArabic ? '12px' : 'unset' }} />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px 10px 36px', background: 'var(--navy-3)', border: '1px solid var(--line)', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                    >
                      {rolesList.map((r) => (
                        <option key={r.id} value={r.id}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '10px', justifyContent: 'center' }}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {tab === 'signup'
                    ? (isArabic ? 'متابعة للتحقق من البريد' : 'Proceed to Email Verification')
                    : (isArabic ? 'تسجيل الدخول للمساحة' : 'Sign In to Workspace')}
                </span>
              </button>
            </form>
          </>
        )}

        <div style={{ fontSize: '11px', color: 'var(--muted-2)', textAlign: 'center' }}>
          {isArabic
            ? 'تُحفظ بيانات اعتمادك وصلاحيات دورك بشكل آمن في محرك المنصة.'
            : 'Your credentials and role permissions are securely persisted in the platform engine.'}
        </div>
      </div>
    </div>
  );
};
