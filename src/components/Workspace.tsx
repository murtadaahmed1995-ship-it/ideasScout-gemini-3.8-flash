import React, { useState } from 'react';
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
  onSaveNewIdea: (ideaData: any) => void;
  onArchiveIdea: (id: string) => void;
  onBulkArchiveIdeas?: (ids: string[]) => void;
  onUpdateIdeaTags?: (id: string, tags: string[]) => void;
  initialView?: WorkspaceView;
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
}) => {
  const isArabic = language === 'ar';
  const [currentView, setCurrentView] = useState<WorkspaceView>(initialView);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Prefer selecting a real user idea over a demo sample on initial load
  const initialUserIdea = ideas.find((i) => !i.isSample) ?? ideas[0];
  const [selectedIdeaId, setSelectedIdeaId] = useState<string>(initialUserIdea?.id ?? '');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedIdea = ideas.find((i) => i.id === selectedIdeaId) ?? initialUserIdea ?? ideas[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

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

  const handleSelectIdea = (idea: Idea, targetView?: WorkspaceView) => {
    setSelectedIdeaId(idea.id);
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
              <small style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>{profile.role}</small>
            </div>
          )}
        </div>
      </aside>

      {/* Main Area */}
      <div className="app-main">
        {/* Topbar */}
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              className="mobile-menu-button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Glyph name="menu" />
            </button>
            <div className="topbar-title">
              <span className="topbar-path">
                IDEASCOUT / {currentView.toUpperCase()}
              </span>
              <h1>{isArabic ? viewTitles[currentView].ar : viewTitles[currentView].en}</h1>
            </div>
          </div>

          <div className="topbar-actions">
            <button
              type="button"
              className="btn btn-outline"
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
            />
          )}

          {currentView === 'report' && selectedIdea && (
            <ReportView
              isArabic={isArabic}
              idea={selectedIdea}
              onNavigate={setCurrentView}
              onUpdateIdea={() => setCurrentView('analyze')}
              onAskAboutIdea={() => setCurrentView('ask')}
            />
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
    </div>
  );
};
