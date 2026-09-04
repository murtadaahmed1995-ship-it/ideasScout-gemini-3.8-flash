import React, { useState, useEffect } from 'react';
import { Profile } from '../types';
import { LogIn, UserPlus, Mail, Lock, User, Briefcase, AlertCircle, X, ShieldCheck, CheckCircle2, Send, FileText } from 'lucide-react';

interface AuthViewProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: Profile) => void;
  isArabic: boolean;
  currentProfile: Profile;
  initialMode?: 'signin' | 'register';
}

function usePasswordMatch(password: string, confirmPassword: string, isArabic: boolean) {
  const [matchError, setMatchError] = useState<string | null>(null);

  useEffect(() => {
    if (confirmPassword.length > 0 && password !== confirmPassword) {
      setMatchError(isArabic ? 'كلمات المرور غير متطابقة في الوقت الحالي.' : 'Passwords do not match in real-time.');
    } else {
      setMatchError(null);
    }
  }, [password, confirmPassword, isArabic]);

  return {
    isMatch: password === confirmPassword,
    matchError
  };
}

export const AuthView: React.FC<AuthViewProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isArabic,
  currentProfile,
  initialMode = 'signin',
}) => {
  const [mode, setMode] = useState<'signin' | 'register'>(initialMode);
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [email, setEmail] = useState(currentProfile.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState(currentProfile.name || '');
  const [role, setRole] = useState(currentProfile.role || (isArabic ? 'صاحب فكرة' : 'Idea Owner'));
  const [roleDescription, setRoleDescription] = useState('');
  
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingProfile, setPendingProfile] = useState<Profile | null>(null);

  const { isMatch, matchError } = usePasswordMatch(password, confirmPassword, isArabic);

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

    if (mode === 'register') {
      if (!validatePassword(password)) {
        setErrorMessage(isArabic ? 'كلمة المرور ضعيفة. يجب أن تكون 6 أحرف على الأقل.' : 'Password is too weak. Must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage(isArabic ? 'كلمات المرور غير متطابقة. يرجى التأكد من كتابة نفس كلمة السر في الحقلين.' : 'Passwords do not match. Please ensure both passwords are identical.');
        return;
      }
    }

    if (mode === 'signin' && password.length < 4) {
      setErrorMessage(isArabic ? 'كلمة المرور غير صحيحة.' : 'Incorrect password.');
      return;
    }

    const finalRoleString = roleDescription.trim() 
      ? `${role} — ${roleDescription.trim()}` 
      : role;

    const updatedProfile: Profile = {
      ...currentProfile,
      name: name.trim() || (isArabic ? 'مؤسس جديد' : 'New Founder'),
      email: email.trim(),
      role: finalRoleString,
      emailVerified: mode === 'signin' ? true : false
    };

    if (mode === 'register') {
      setPendingProfile(updatedProfile);
      setStep('verify');
    } else {
      onSuccess(updatedProfile);
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
    { id: 'Idea Owner', label: 'صاحب الفكرة ومبتكر المشروع (Idea Owner & Visionary)' },
    { id: 'Co-Founder', label: 'شريك مؤسس (Co-Founder)' },
    { id: 'Technical Lead', label: 'قائد تقني / مطور رئيسي (CTO & Tech Lead)' },
    { id: 'Project Investor', label: 'مستثمر أو ممول (Investor / Angel / VC)' },
    { id: 'Product Manager', label: 'مدير منتج / مستشار تطوير (Product Manager)' },
    { id: 'Growth Specialist', label: 'خبير نمو وتسويق رقمي (Growth & Marketing Expert)' },
    { id: 'Operations Manager', label: 'مدير عمليات وإدارة مشاريع (Operations Manager)' },
    { id: 'Business Consultant', label: 'مستشار أعمال واستراتيجيات (Business Consultant)' },
    { id: 'Legal & Compliance', label: 'مستشار قانوني وتنظيمي (Legal & Compliance)' },
    { id: 'Beta Tester', label: 'مختبر منتجات ومقيم جودة (Beta Tester & Evaluator)' },
    { id: 'Other', label: 'دور آخر مخصص (Other Custom Relationship)' }
  ] : [
    { id: 'Idea Owner', label: 'Idea Owner & Visionary' },
    { id: 'Co-Founder', label: 'Co-Founder' },
    { id: 'Technical Lead', label: 'CTO & Tech Lead' },
    { id: 'Project Investor', label: 'Investor / Angel / VC' },
    { id: 'Product Manager', label: 'Product Manager' },
    { id: 'Growth Specialist', label: 'Growth & Marketing Expert' },
    { id: 'Operations Manager', label: 'Operations Manager' },
    { id: 'Business Consultant', label: 'Business Consultant' },
    { id: 'Legal & Compliance', label: 'Legal & Compliance' },
    { id: 'Beta Tester', label: 'Beta Tester & Evaluator' },
    { id: 'Other', label: 'Other Custom Relationship' }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 9, 20, 0.85)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div style={{
        background: mode === 'register'
          ? 'linear-gradient(135deg, rgba(20, 32, 64, 0.88), rgba(10, 18, 38, 0.96))'
          : 'linear-gradient(135deg, rgba(16, 26, 52, 0.88), rgba(9, 15, 32, 0.96))',
        border: mode === 'register'
          ? '1px solid rgba(82, 232, 172, 0.35)'
          : '1px solid rgba(67, 230, 210, 0.35)',
        borderRadius: '26px',
        padding: '36px',
        maxWidth: '480px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: mode === 'register'
          ? '0 30px 70px rgba(0, 0, 0, 0.75), 0 0 40px rgba(82, 232, 172, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          : '0 30px 70px rgba(0, 0, 0, 0.75), 0 0 40px rgba(67, 230, 210, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '22px',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span className="panel-kicker" style={{ color: mode === 'register' ? '#52e8ac' : 'var(--cyan)' }}>
              {mode === 'register'
                ? (isArabic ? 'بوابة تسجيل الحساب الجديد' : 'FOUNDER REGISTRATION PORTAL')
                : (isArabic ? 'بوابة تسجيل الدخول' : 'SECURE SIGN IN PORTAL')}
            </span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
              {step === 'verify'
                ? (isArabic ? 'التحقق الإلزامي من البريد الإلكتروني' : 'Mandatory Email Verification')
                : (mode === 'register' ? (isArabic ? 'إنشاء حساب جديد للمنصة' : 'Create Platform Account') : (isArabic ? 'تسجيل الدخول لمساحة العمل' : 'Sign In to Workspace'))}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => { setStep('form'); onClose(); }}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', cursor: 'pointer' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        {step === 'form' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'rgba(11, 19, 41, 0.8)', padding: '5px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              type="button"
              onClick={() => { setMode('signin'); setErrorMessage(''); }}
              style={{
                background: mode === 'signin' ? 'var(--cyan)' : 'transparent',
                color: mode === 'signin' ? '#0b1329' : 'var(--muted)',
                border: 'none',
                borderRadius: '9px',
                padding: '9px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{isArabic ? 'تسجيل الدخول' : 'Sign In'}</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMessage(''); }}
              style={{
                background: mode === 'register' ? '#52e8ac' : 'transparent',
                color: mode === 'register' ? '#0b1329' : 'var(--muted)',
                border: 'none',
                borderRadius: '9px',
                padding: '9px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isArabic ? 'حساب جديد' : 'Register'}</span>
            </button>
          </div>
        )}

        {errorMessage && (
          <div style={{ background: 'rgba(248, 113, 113, 0.12)', border: '1px solid rgba(248, 113, 113, 0.3)', padding: '12px 16px', borderRadius: '12px', color: '#f87171', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {step === 'verify' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(82, 232, 172, 0.15)',
              border: '1px solid rgba(82, 232, 172, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              color: '#52e8ac',
              boxShadow: '0 0 35px rgba(82, 232, 172, 0.2)'
            }}>
              <Send className="w-8 h-8" />
            </div>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '8px', fontWeight: 700 }}>
                {isArabic ? 'تحقق من بريدك الإلكتروني' : 'Verify Your Email Address'}
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                {isArabic
                  ? `أرسلنا رابط تفعيل إلى البريد (${email}). يرجى تأكيد البريد لفتح صلاحية الدخول لمساحة العمل.`
                  : `We sent an activation link to (${email}). Please confirm your email to unlock workspace access.`}
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSimulateVerification}
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '12px',
                fontSize: '14px',
                background: '#52e8ac',
                color: '#0b1329'
              }}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isArabic ? 'تأكيد البريد (محاكاة رابط المصادقة)' : 'Verify Email (Simulate Auth Link)'}</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setStep('form')}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {isArabic ? 'العودة لتعديل البيانات' : 'Back to Form'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {mode === 'register' && (
              <div className="form-group">
                <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
                  {isArabic ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <User className="w-4 h-4 text-emerald-400" style={{ position: 'absolute', left: isArabic ? 'unset' : '14px', right: isArabic ? '14px' : 'unset' }} />
                  <input
                    type="text"
                    required
                    placeholder={isArabic ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px 11px 42px', background: 'rgba(11, 19, 41, 0.7)', border: '1px solid var(--line)', borderRadius: '12px', color: '#fff', fontSize: '14px', backdropFilter: 'blur(4px)' }}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
                {isArabic ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail className="w-4 h-4 text-cyan-400" style={{ position: 'absolute', left: isArabic ? 'unset' : '14px', right: isArabic ? '14px' : 'unset' }} />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px 11px 42px', background: 'rgba(11, 19, 41, 0.7)', border: '1px solid var(--line)', borderRadius: '12px', color: '#fff', fontSize: '14px', backdropFilter: 'blur(4px)' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
                {isArabic ? 'كلمة المرور' : 'Password'}
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock className="w-4 h-4 text-cyan-400" style={{ position: 'absolute', left: isArabic ? 'unset' : '14px', right: isArabic ? '14px' : 'unset' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px 11px 42px', background: 'rgba(11, 19, 41, 0.7)', border: '1px solid var(--line)', borderRadius: '12px', color: '#fff', fontSize: '14px', backdropFilter: 'blur(4px)' }}
                />
              </div>
            </div>

            {mode === 'register' && (
              <div className="form-group">
                <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
                  {isArabic ? 'تأكيد كلمة المرور (أعد كتابتها للتأكد)' : 'Confirm Password (Type again)'}
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock className="w-4 h-4 text-emerald-400" style={{ position: 'absolute', left: isArabic ? 'unset' : '14px', right: isArabic ? '14px' : 'unset' }} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 42px',
                      background: 'rgba(11, 19, 41, 0.7)',
                      border: matchError ? '1px solid rgba(248, 113, 113, 0.6)' : '1px solid var(--line)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '14px',
                      backdropFilter: 'blur(4px)'
                    }}
                  />
                </div>
                {matchError && (
                  <div style={{ color: '#f87171', fontSize: '11px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{matchError}</span>
                  </div>
                )}
              </div>
            )}

            {mode === 'register' && (
              <>
                <div className="form-group">
                  <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
                    {isArabic ? 'طبيعة علاقتك أو دورك في المشروع' : 'Your Relationship / Role in Project'}
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Briefcase className="w-4 h-4 text-emerald-400" style={{ position: 'absolute', left: isArabic ? 'unset' : '14px', right: isArabic ? '14px' : 'unset' }} />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px 11px 42px', background: 'rgba(11, 19, 41, 0.7)', border: '1px solid var(--line)', borderRadius: '12px', color: '#fff', fontSize: '13px', backdropFilter: 'blur(4px)' }}
                    >
                      {rolesList.map((r) => (
                        <option key={r.id} value={r.id}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>
                    {isArabic ? 'وصف تفصيلي إضافي للدور أو المساهمة (اختياري)' : 'Detailed Description of Role / Contribution'}
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <FileText className="w-4 h-4 text-emerald-400" style={{ position: 'absolute', left: isArabic ? 'unset' : '14px', right: isArabic ? '14px' : 'unset', top: '14px' }} />
                    <textarea
                      rows={2}
                      placeholder={isArabic ? 'اكتب نبذة أو وصفاً تفصيلياً لعلاقتك بالمشروع أو تخصصك الدقيق...' : 'Write custom details about your background, relationship or contribution...'}
                      value={roleDescription}
                      onChange={(e) => setRoleDescription(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px 10px 42px', background: 'rgba(11, 19, 41, 0.7)', border: '1px solid var(--line)', borderRadius: '12px', color: '#fff', fontSize: '13px', resize: 'none', backdropFilter: 'blur(4px)' }}
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                marginTop: '10px',
                justifyContent: 'center',
                padding: '12px',
                fontSize: '14px',
                background: mode === 'register' ? '#52e8ac' : 'var(--cyan)',
                color: '#0b1329'
              }}
            >
              {mode === 'register' ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              <span>
                {mode === 'register'
                  ? (isArabic ? 'إنشاء الحساب والتحقق من البريد' : 'Create Account & Verify Email')
                  : (isArabic ? 'دخول فوري لمساحة العمل' : 'Sign In to Workspace')}
              </span>
            </button>
          </form>
        )}

        <div style={{ fontSize: '11px', color: 'var(--muted-2)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isArabic ? 'خلفية زجاجية فاخرة مشفرة ومحمية عبر محرك المنصة' : 'Glassmorphic secure platform engine persistence'}</span>
        </div>
      </div>
    </div>
  );
};
