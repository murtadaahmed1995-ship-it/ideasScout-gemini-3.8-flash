import React, { useState, useEffect } from 'react';
import { Idea, Profile, Stage, WorkspaceView } from '../types';
import { Brand } from './Brand';
import { Glyph } from './Glyph';
import { AnalyzeView } from './views/AnalyzeView';
import { AskView } from './views/AskView';
import { DashboardView } from './views/DashboardView';
import { ProfileView } from './views/ProfileView';
import { ReportView } from './views/ReportView';
import { VaultView } from './views/VaultView';

interface WorkspaceProps {
  language: 'en' | 'ar';
  onToggleLanguage: () => void;
  onReturnToLanding: () => void;
  ideas: Idea[];
  profile: Profile;
  onUpdateProfile: (updated: Profile) => void;
  onSaveNewIdea: (ideaData: any) => any;
  onArchiveIdea: (id: string) => void;
  onBulkArchiveIdeas?: (ids: string[]) => void;
  onUpdateIdeaTags?: (id: string, tags: string[]) => void;
  initialView?: WorkspaceView;
  initialDescription?: string;
  initialStage?: Stage;
}

export const Workspace: React.FC<WorkspaceProps> = ({
  language,
  onToggleLanguage,
  onReturnToLanding,
  ideas,
  profile,
  onUpdateProfile,
  onSaveNewIdea,
  onArchiveIdea,
  onBulkArchiveIdeas,
  onUpdateIdeaTags,
  initialView = 'dashboard',
  initialDescription,
  initialStage,
}) => {
  const isArabic = language === 'ar';
  const [currentView, setCurrentView] = useState<WorkspaceView>(initialView);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Prefer selecting a real user idea over a demo sample on initial load
  const initialUserIdea = ideas.find((i) => !i.isSample) ?? ideas[0];
  const [selectedIdeaId, setSelectedIdeaId] = useState<string>(initialUserIdea?.id ?? '');
  const [selectedReportId, setSelectedReportId] = useState<string>('latest');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const selectedIdea = ideas.find((i) => i.id === selectedIdeaId) ?? initialUserIdea ?? ideas[0];

  // Strict tuple check for (ideaId, reportId)
  const isIdeaValid = ideas.some((i) => i.id === selectedIdeaId);
  const isReportValid = isIdeaValid && (
    selectedReportId === 'latest' ||
    (selectedIdea?.evolution && selectedIdea.evolution.some((s) => s.id === selectedReportId)) ||
    Boolean(selectedIdea?.latestAnalysis)
  );
  const isTupleValid = isIdeaValid && isReportValid;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Escape to close mobile menu or blur inputs
      if (e.key === 'Escape') {
        if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
        }
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      }

      // Ctrl/Cmd + K to focus vault search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (currentView !== 'vault') {
          setCurrentView('vault');
          setTimeout(() => {
            document.getElementById('vault-search-input')?.focus();
          }, 50);
        } else {
          document.getElementById('vault-search-input')?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isMobileMenuOpen, currentView]);

  const navItems = [
    { view: 'dashboard' as const, icon: 'grid', en: 'Dashboard', ar: 'لوحة التحكم' },
    { view: 'analyze' as const, icon: 'spark', en: 'Analyze Idea', ar: 'حلّل فكرتك' },
    { view: 'report' as const, icon: 'signal', en: 'Intelligence Report', ar: 'تقرير الذكاء' },
    { view: 'vault' as const, icon: 'vault', en: 'Idea Vault', ar: 'خزنة الأفكار' },
    { view: 'ask' as const, icon: 'chat', en: 'Ask IdeaScout', ar: 'اسأل IdeaScout' },
    { view: 'profile' as const, icon: 'person', en: 'Profile', ar: 'الملف الشخصي' }
  ];

  const viewTitles: Record<WorkspaceView, { en: string; ar: string }> = {
    dashboard: { en: 'Opportunity Dashboard', ar: 'لوحة الفرص' },
    analyze: { en: 'Analyze an Idea', ar: 'حلّل فكرة' },
    report: { en: 'Intelligence Report', ar: 'تقرير الذكاء' },
    vault: { en: 'Idea Vault', ar: 'خزنة الأفكار' },
    ask: { en: 'Ask IdeaScout', ar: 'اسأل IdeaScout' },
    profile: { en: 'Profile & Preferences', ar: 'الملف والتفضيلات' }
  };

  const handleSelectIdea = (idea: Idea, targetView?: WorkspaceView, reportId: string = 'latest') => {
    setSelectedIdeaId(idea.id);
    setSelectedReportId(reportId);
    if (targetView) {
      setCurrentView(targetView);
    }
  };

  const handleSaveAnalysis = (data: any) => {
    const createdIdea = onSaveNewIdea(data) as Idea | undefined;
    if (createdIdea?.id) {
      setSelectedIdeaId(createdIdea.id);
    }
    showToast(isArabic ? 'تم حفظ التحليل في الخزنة بنجاح' : 'Analysis saved to Vault successfully');
    setCurrentView('report');
  };

  const handleArchive = (id: string) => {
    onArchiveIdea(id);
    showToast(isArabic ? 'تمت أرشفة الفكرة' : 'Idea archived');
    if (selectedIdeaId === id && ideas.length > 1) {
      setSelectedIdeaId(ideas.find(i => i.id !== id)?.id ?? '');
    }
  };

  const handleBulkArchive = (ids: string[]) => {
    if (onBulkArchiveIdeas) {
      onBulkArchiveIdeas(ids);
    } else {
      ids.forEach((id) => onArchiveIdea(id));
    }
    showToast(
      isArabic
        ? `تمت أرشفة ${ids.length} أفكار بنجاح`
        : `Archived ${ids.length} ideas successfully`
    );
    if (ids.includes(selectedIdeaId)) {
      const remaining = ideas.filter((i) => !ids.includes(i.id));
      setSelectedIdeaId(remaining[0]?.id ?? '');
    }
  };

  const handleUpdateTags = (id: string, tags: string[]) => {
    if (onUpdateIdeaTags) {
      onUpdateIdeaTags(id, tags);
      showToast(isArabic ? 'تم تحديث الوسوم بنجاح' : 'Tags updated successfully');
    }
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
    <div className="app-shell">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar ${isSidebarCollapsed ? 'sidebar-collapsed' : ''} ${
          isMobileMenuOpen ? 'mobile-open' : ''
        }`}
      >
        <div className="sidebar-header">
          <button
            type="button"
            className="brand-button"
            onClick={() => setCurrentView('dashboard')}
          >
            <Brand compact={isSidebarCollapsed} />
          </button>
          <button
            type="button"
            className="sidebar-collapse-button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            aria-label="Toggle sidebar"
          >
            {isSidebarCollapsed ? (isArabic ? '›' : '‹') : (isArabic ? '‹' : '›')}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.view}
              type="button"
              className={`sidebar-nav-item ${currentView === item.view ? 'active' : ''}`}
              onClick={() => {
                setCurrentView(item.view);
                setIsMobileMenuOpen(false);
              }}
              title={isArabic ? item.ar : item.en}
            >
              <Glyph name={item.icon} />
              {!isSidebarCollapsed && (
                <span>{isArabic ? item.ar : item.en}</span>
              )}
            </button>
          ))}
        </nav>

        {!isSidebarCollapsed && (
          <div className="sidebar-upgrade">
            <span className="launch-chip">
              <span className="live-dot" />
              {isArabic ? 'وصول مبكر مجاني' : 'EARLY ACCESS'}
            </span>
            <small style={{ color: 'var(--muted)', marginTop: '0.4rem', display: 'block' }}>
              {ideas.length} {isArabic ? 'أفكار محفوظة' : 'saved ideas'}
            </small>
          </div>
        )}

        <div
          className="sidebar-user"
          onClick={() => {
            setCurrentView('profile');
            setIsMobileMenuOpen(false);
          }}
        >
          <span className="idea-monogram">{getMonogram(profile.name)}</span>
          {!isSidebarCollapsed && (
            <div style={{ overflow: 'hidden' }}>
              <strong style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'block', overflow: 'hidden' }}>
                {profile.name}
              </strong>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span style={{
                  background: 'rgba(67, 230, 210, 0.15)',
                  color: 'var(--cyan)',
                  border: '1px solid rgba(67, 230, 210, 0.3)',
                  padding: '1px 8px',
                  borderRadius: '10px',
                  fontSize: '10px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}>
                  {profile.role}
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Area */}
      <div className="app-main">
        {/* Topbar */}
        <header className="topbar" style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              type="button"
              className="mobile-menu-button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Glyph name="menu" />
            </button>
            <div className="topbar-title" style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              <span className="topbar-path" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {isArabic ? 'مساحة العمل' : 'WORKSPACE'} <span style={{ opacity: 0.5 }}>/</span> {isArabic ? viewTitles[currentView].ar : viewTitles[currentView].en}
              </span>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-color)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                {['report', 'analyze', 'ask'].includes(currentView) && selectedIdea 
                  ? (isArabic ? selectedIdea.title.ar : selectedIdea.title.en) 
                  : (isArabic ? viewTitles[currentView].ar : viewTitles[currentView].en)}
              </h1>
            </div>
          </div>

          <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {selectedIdea && (currentView === 'report' || currentView === 'vault' || currentView === 'ask') && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsShareModalOpen(true)}
                title={isArabic ? 'مشاركة التقرير' : 'Share Report'}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'var(--primary)', color: 'var(--primary)', padding: '0.4rem 0.75rem' }}
              >
                <Glyph name="share" />
                <span className="hidden sm:inline" style={{ fontWeight: 600 }}>
                  {isArabic ? 'مشاركة' : 'Share'}
                </span>
              </button>
            )}

            <button
              type="button"
              className="btn btn-secondary"
              onClick={onReturnToLanding}
              title={isArabic ? 'العودة لصفحة التعريف' : 'Return to Landing Page'}
            >
              <Glyph name="home" />
              <span className="hidden sm:inline">
                {isArabic ? 'الرئيسية' : 'Home'}
              </span>
            </button>

            <button
              type="button"
              className="language-button"
              onClick={onToggleLanguage}
            >
              {isArabic ? 'EN' : 'العربية'}
            </button>

            <button
              type="button"
              className="top-profile-button"
              onClick={() => setCurrentView('profile')}
              aria-label="Profile"
            >
              <span>{getMonogram(profile.name)}</span>
            </button>
          </div>
        </header>

        {/* Dynamic Content View */}
        <main className="app-content">
          {currentView === 'dashboard' && (
            <DashboardView
              isArabic={isArabic}
              profile={profile}
              ideas={ideas}
              onNavigate={setCurrentView}
              onStartNew={() => setCurrentView('analyze')}
              onSelectIdea={handleSelectIdea}
            />
          )}

          {currentView === 'analyze' && (
            <AnalyzeView
              isArabic={isArabic}
              onSaveAnalysis={handleSaveAnalysis}
              initialDescription={initialDescription}
              initialStage={initialStage}
            />
          )}

          {currentView === 'report' && (
            isTupleValid && selectedIdea ? (
              <ReportView
                isArabic={isArabic}
                idea={selectedIdea}
                onNavigate={setCurrentView}
                onUpdateIdea={() => setCurrentView('analyze')}
                onAskAboutIdea={() => setCurrentView('ask')}
              />
            ) : (
              <div className="empty-state" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <Glyph name="signal" />
                <h2>{isArabic ? 'تعذر حل أو مطابقة تقرير الذكاء' : 'Intelligence Report Resolution Failed'}</h2>
                <p style={{ color: 'var(--muted)', maxWidth: '420px', margin: '0.75rem auto 1.5rem' }}>
                  {isArabic
                    ? 'فشل التحقق من صحة زوج المعرفات (ideaId, reportId). قد تكون الفكرة أو التقرير المطلوب غير موجودين أو غير متطابقين.'
                    : 'The strict tuple validation for (ideaId, reportId) failed. The requested report could not be securely matched to the active idea portfolio.'}
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    if (ideas.length > 0) {
                      setSelectedIdeaId(ideas[0].id);
                      setSelectedReportId('latest');
                    }
                    setCurrentView('vault');
                  }}
                >
                  {isArabic ? 'العودة إلى خزنة الأفكار' : 'Return to Idea Vault'}
                </button>
              </div>
            )
          )}

          {currentView === 'vault' && (
            <VaultView
              isArabic={isArabic}
              ideas={ideas}
              onOpenReport={(i) => handleSelectIdea(i, 'report')}
              onUpdateIdea={(i) => handleSelectIdea(i, 'analyze')}
              onArchiveIdea={handleArchive}
              onBulkArchiveIdeas={handleBulkArchive}
              onUpdateIdeaTags={handleUpdateTags}
              onStartNew={() => setCurrentView('analyze')}
            />
          )}

          {currentView === 'ask' && selectedIdea && (
            <AskView
              isArabic={isArabic}
              ideas={ideas}
              selectedIdea={selectedIdea}
              onSelectIdea={handleSelectIdea}
              onOpenReport={(i) => handleSelectIdea(i, 'report')}
            />
          )}

          {currentView === 'profile' && (
            <ProfileView
              isArabic={isArabic}
              profile={profile}
              onUpdateProfile={(up) => {
                onUpdateProfile(up);
                showToast(isArabic ? 'تم تحديث البيانات' : 'Profile updated');
              }}
              onSignOut={onReturnToLanding}
            />
          )}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="mobile-bottom-nav">
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.view}
              type="button"
              className={currentView === item.view ? 'active' : ''}
              onClick={() => setCurrentView(item.view)}
            >
              <Glyph name={item.icon} />
              <span>{isArabic ? item.ar : item.en}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Feedback Toast Notification */}
      {toastMessage && (
        <div className="toast">
          <Glyph name="check" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Share Modal */}
      {isShareModalOpen && selectedIdea && (
        <div className="dialog-overlay">
          <div className="dialog-content share-modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 600 }}>
                {isArabic ? 'مشاركة التقرير' : 'Share Intelligence Report'}
              </h2>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ border: 'none', padding: '0.25rem' }}
                onClick={() => setIsShareModalOpen(false)}
              >
                <Glyph name="trash" />
              </button>
            </div>
            
            <p style={{ color: 'var(--muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              {isArabic 
                ? 'شارك هذا الرابط مع فريقك أو المستثمرين للوصول إلى تحليل الفكرة.' 
                : 'Share this secure link with your team or investors to access the idea analysis.'}
            </p>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input 
                type="text" 
                readOnly 
                value={`https://ideascout.app/share/${selectedIdea.id.substring(0, 8)}`} 
                style={{ flex: 1, padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
              />
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  navigator.clipboard.writeText(`https://ideascout.app/share/${selectedIdea.id.substring(0, 8)}`);
                  showToast(isArabic ? 'تم نسخ الرابط!' : 'Link copied to clipboard!');
                  setIsShareModalOpen(false);
                }}
              >
                {isArabic ? 'نسخ' : 'Copy'}
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <a 
                href={`mailto:?subject=${encodeURIComponent(`IdeaScout Report: ${isArabic ? selectedIdea.title.ar : selectedIdea.title.en}`)}&body=${encodeURIComponent(`Check out this idea analysis report on IdeaScout:\n\nhttps://ideascout.app/share/${selectedIdea.id.substring(0, 8)}`)}`}
                className="btn btn-secondary"
                style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                onClick={() => setIsShareModalOpen(false)}
              >
                <Glyph name="mail" />
                {isArabic ? 'إرسال عبر البريد' : 'Email Link'}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
