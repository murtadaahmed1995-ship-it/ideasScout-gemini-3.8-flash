import React, { useState, useEffect } from 'react';
import { Profile } from '../types';
import { auth } from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  updateProfile,
  signOut 
} from 'firebase/auth';
import { LogIn, UserPlus, Mail, Lock, User, Briefcase, AlertCircle, X, ShieldCheck, Send, FileText, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState(isArabic ? 'صاحب فكرة' : 'Idea Owner');
  const [roleDescription, setRoleDescription] = useState('');
  
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { isMatch, matchError } = usePasswordMatch(password, confirmPassword, isArabic);

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const validatePassword = (val: string) => val.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

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

    setLoading(true);

    try {
      if (mode === 'register') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        if (name.trim()) {
          await updateProfile(user, { displayName: name.trim() });
        }
        // Send verification email with correct return origin URL
        await sendEmailVerification(user, { url: window.location.origin });
        setStep('verify');
        setResendCooldown(60);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Reload user to get latest emailVerified status
        await user.reload();
        
        if (!user.emailVerified) {
          setStep('verify');
          setErrorMessage(isArabic ? 'بريدك الإلكتروني غير مؤكد بعد. يرجى تأكيد بريدك من رابط التحقق المرسل.' : 'Your email is not verified yet. Please confirm your email via the verification link sent.');
          setLoading(false);
          return;
        }

        const finalRoleString = roleDescription.trim() 
          ? `${role} — ${roleDescription.trim()}` 
          : role;

        const updatedProfile: Profile = {
          ...currentProfile,
          userId: user.uid,
          name: user.displayName || name.trim() || (isArabic ? 'مؤسس' : 'Founder'),
          email: user.email || email.trim(),
          role: finalRoleString,
          emailVerified: true
        };
        onSuccess(updatedProfile);
        onClose();
      }
    } catch (err: any) {
      console.error('Firebase Auth error:', err);
      let msg = err.message || (isArabic ? 'فشلت عملية المصادقة عبر فايربيس.' : 'Authentication failed.');
      if (err.code === 'auth/email-already-in-use') {
        msg = isArabic ? 'البريد الإلكتروني مستخدم بالفعل. يرجى تسجيل الدخول.' : 'Email is already in use. Please sign in.';
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-email') {
        msg = isArabic ? 'بيانات الاعتماد غير صحيحة أو البريد غير مسجل.' : 'Invalid credentials or user not found.';
      } else if (err.code === 'auth/weak-password') {
        msg = isArabic ? 'كلمة المرور ضعيفة جداً.' : 'Password should be at least 6 characters.';
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        setErrorMessage(isArabic ? 'لا يوجد مستخدم مسجل حالياً. يرجى تسجيل الدخول.' : 'No signed-in user found. Please sign in.');
        setStep('form');
        setLoading(false);
        return;
      }

      // Call user.reload() to fetch the latest server verification state
      await user.reload();

      if (user.emailVerified) {
        const updatedProfile: Profile = {
          ...currentProfile,
          userId: user.uid,
          name: user.displayName || name.trim() || (isArabic ? 'مؤسس' : 'Founder'),
          email: user.email || email,
          emailVerified: true
        };
        setSuccessMessage(isArabic ? 'تم التحقق بنجاح! جاري الدخول...' : 'Email verified successfully! Entering workspace...');
        setTimeout(() => {
          onSuccess(updatedProfile);
          onClose();
        }, 1000);
      } else {
        setErrorMessage(isArabic ? 'لم يتم تأكيد البريد الإلكتروني بعد. يرجى الضغط على الرابط في رسالة البريد الوارد ثم إعادة المحاولة.' : 'Email is not verified yet. Please click the link in your inbox email and try again.');
      }
    } catch (err: any) {
      console.error('Verification check error:', err);
      setErrorMessage(isArabic ? 'تعذر التحقق من الحالة حالياً. يرجى المحاولة لاحقاً.' : 'Could not check verification status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        setErrorMessage(isArabic ? 'يرجى تسجيل الدخول أولاً.' : 'Please sign in first.');
        setLoading(false);
        return;
      }
      await sendEmailVerification(user, { url: window.location.origin });
      setSuccessMessage(isArabic ? 'تم إعادة إرسال بريد التحقق بنجاح!' : 'Verification email resent successfully!');
      setResendCooldown(60);
    } catch (err: any) {
      console.error('Resend verification error:', err);
      setErrorMessage(isArabic ? 'فشل إرسال بريد التحقق. يرجى المحاولة لاحقاً.' : 'Failed to resend verification email. Please try later.');
    } finally {
      setLoading(false);
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
              {step === 'verify'
                ? (isArabic ? 'التحقق الإلزامي للبريد' : 'MANDATORY EMAIL VERIFICATION')
                : mode === 'register'
                  ? (isArabic ? 'بوابة تسجيل الحساب الجديد' : 'FOUNDER REGISTRATION PORTAL')
                  : (isArabic ? 'بوابة تسجيل الدخول' : 'SECURE SIGN IN PORTAL')}
            </span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
              {step === 'verify'
                ? (isArabic ? 'تأكيد بريدك الإلكتروني' : 'Verify Your Email Address')
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
              onClick={() => { setMode('signin'); setErrorMessage(''); setSuccessMessage(''); }}
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
              onClick={() => { setMode('register'); setErrorMessage(''); setSuccessMessage(''); }}
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

        {successMessage && (
          <div style={{ background: 'rgba(82, 232, 172, 0.12)', border: '1px solid rgba(82, 232, 172, 0.3)', padding: '12px 16px', borderRadius: '12px', color: '#52e8ac', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
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
                {isArabic ? 'مطلوب تأكيد البريد الإلكتروني' : 'Email Verification Required'}
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                {isArabic
                  ? `أرسلنا رسالة تحقق رسمية إلى بريدك (${email}). لا يمكن الوصول إلى مساحة العمل قبل إتمام النقر على رابط التحقق.`
                  : `We have sent an official verification link to (${email}). Workspace access is strictly restricted until verification is complete.`}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                type="button"
                disabled={loading}
                className="btn btn-primary"
                onClick={handleCheckVerification}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '12px',
                  fontSize: '14px',
                  background: 'var(--cyan)',
                  color: '#0b1329',
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{isArabic ? 'تحقق من حالة التفعيل (لقد قمت بالضغط على الرابط)' : 'I Have Verified My Email (Check Status)'}</span>
              </button>

              <button
                type="button"
                disabled={loading || resendCooldown > 0}
                className="btn"
                onClick={handleResendVerification}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '11px',
                  fontSize: '13px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff',
                  opacity: (loading || resendCooldown > 0) ? 0.6 : 1,
                  cursor: (loading || resendCooldown > 0) ? 'not-allowed' : 'pointer'
                }}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>
                  {resendCooldown > 0
                    ? (isArabic ? `إعادة الإرسال خلال (${resendCooldown} ثانية)` : `Resend Verification Email (${resendCooldown}s)`)
                    : (isArabic ? 'إعادة إرسال بريد التحقق' : 'Resend Verification Email')}
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={async () => {
                try {
                  await signOut(auth);
                } catch {}
                setStep('form');
                setMode('signin');
              }}
              style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isArabic ? 'العودة لتسجيل الدخول بحساب آخر' : 'Sign in with a different account'}
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
                  placeholder={isArabic ? 'أدخل كلمة المرور' : 'Enter your password'}
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
                    placeholder={isArabic ? 'أعد إدخال كلمة المرور' : 'Confirm your password'}
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
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                marginTop: '10px',
                justifyContent: 'center',
                padding: '12px',
                fontSize: '14px',
                background: mode === 'register' ? '#52e8ac' : 'var(--cyan)',
                color: '#0b1329',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === 'register' ? (
                <UserPlus className="w-4 h-4" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span>
                {loading
                  ? (isArabic ? 'جاري المعالجة عبر فايربيس...' : 'Processing via Firebase...')
                  : mode === 'register'
                    ? (isArabic ? 'إنشاء الحساب وإرسال التحقق' : 'Create Account & Send Verification')
                    : (isArabic ? 'تسجيل الدخول الآمن' : 'Secure Sign In')}
              </span>
            </button>
          </form>
        )}

        <div style={{ fontSize: '11px', color: 'var(--muted-2)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isArabic ? 'محمي بواسطة مصادقة فايربيس الآمنة' : 'Protected by Firebase Authentication'}</span>
        </div>
      </div>
    </div>
  );
};
