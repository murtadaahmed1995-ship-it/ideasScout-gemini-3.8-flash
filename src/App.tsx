import React, { useEffect, useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { Workspace } from './components/Workspace';
import { AuthView } from './components/AuthView';
import { defaultProfile, initialIdeas } from './data/sampleIdeas';
import { Idea, Profile, WorkspaceView } from './types';
import { evaluateIdea } from './utils/engine';

export default function App() {
  const [mode, setMode] = useState<'landing' | 'workspace'>('landing');
  const [workspaceInitialView, setWorkspaceInitialView] = useState<WorkspaceView>('dashboard');
  const [initialAnalyzeDescription, setInitialAnalyzeDescription] = useState('');
  const [initialAnalyzeStage, setInitialAnalyzeStage] = useState<any>('Concept');
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const [language, setLanguage] = useState<'en' | 'ar'>(() => {
    const saved = localStorage.getItem('ideascout_lang');
    return saved === 'ar' ? 'ar' : 'en';
  });

  const [ideas, setIdeas] = useState<Idea[]>(() => {
    try {
      const saved = localStorage.getItem('ideascout_ideas');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return initialIdeas;
  });

  const [profile, setProfile] = useState<Profile>(() => {
    try {
      const saved = localStorage.getItem('ideascout_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.name) return parsed;
      }
    } catch {
      // ignore
    }
    return defaultProfile;
  });

  // Sync dir and lang attributes
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('ideascout_lang', language);
  }, [language]);

  // Persist ideas
  useEffect(() => {
    try {
      localStorage.setItem('ideascout_ideas', JSON.stringify(ideas));
    } catch {
      // ignore
    }
  }, [ideas]);

  // Persist profile
  useEffect(() => {
    try {
      localStorage.setItem('ideascout_profile', JSON.stringify(profile));
    } catch {
      // ignore
    }
  }, [profile]);

  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const handleQuickAnalyze = (ideaText: string, stage: string) => {
    setInitialAnalyzeDescription(ideaText);
    setInitialAnalyzeStage(stage);
    setWorkspaceInitialView('analyze');
    setMode('workspace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleOpenWorkspace = (target: 'dashboard' | 'analyze' | 'vault' | boolean = 'dashboard') => {
    let view: WorkspaceView = 'dashboard';
    if (target === true || target === 'analyze') {
      view = 'analyze';
    } else if (target === 'vault') {
      view = 'vault';
    } else if (typeof target === 'string') {
      view = target as WorkspaceView;
    }
    setWorkspaceInitialView(view);
    setMode('workspace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveNewIdea = (ideaData: any): Idea => {
    const evaluation = evaluateIdea(
      ideaData.description,
      ideaData.stage,
      ideaData.questions,
      ideaData.answers
    );

    const now = new Date().toISOString();
    const newSnapshot = {
      id: `snap-${Date.now()}`,
      opportunityScore: evaluation.opportunityScore,
      confidence: evaluation.confidence,
      createdAt: now,
      changeSummary: {
        en: `Analysis completed. Input readiness scored ${evaluation.inputReadiness}%.`,
        ar: `اكتمل التحليل. سجلت جاهزية المدخلات ${evaluation.inputReadiness}%.`
      }
    };

    const newIdea: Idea = {
      id: `idea-${Date.now()}`,
      isSample: false,
      source: 'user',
      title: ideaData.title,
      description: ideaData.description,
      stage: ideaData.stage,
      tags: Array.isArray(ideaData.tags) && ideaData.tags.length > 0 ? ideaData.tags : ['New-Hypothesis'],
      opportunityScore: evaluation.opportunityScore,
      confidence: evaluation.confidence,
      readinessScore: evaluation.readinessScore,
      createdAt: now,
      updatedAt: now,
      questions: ideaData.questions,
      answers: ideaData.answers,
      latestAnalysis: evaluation,
      evolution: [newSnapshot]
    };

    setIdeas((prev) => [newIdea, ...prev]);
    return newIdea;
  };

  const handleArchiveIdea = (id: string) => {
    setIdeas((prev) => prev.filter((i) => i.id !== id));
  };

  const handleBulkArchiveIdeas = (ids: string[]) => {
    const idSet = new Set(ids);
    setIdeas((prev) => prev.filter((i) => !idSet.has(i.id)));
  };

  const handleUpdateIdeaTags = (id: string, tags: string[]) => {
    setIdeas((prev) =>
      prev.map((i) => (i.id === id ? { ...i, tags, updatedAt: new Date().toISOString() } : i))
    );
  };

  const handleUpdateProfile = (updated: Profile) => {
    setProfile(updated);
  };

  return (
    <div className="ideascout-root" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {mode === 'landing' ? (
        <LandingPage
          language={language}
          onToggleLanguage={handleToggleLanguage}
          onOpenWorkspace={handleOpenWorkspace}
          onOpenSignIn={() => setIsSignInOpen(true)}
          onOpenRegister={() => setIsRegisterOpen(true)}
          onQuickAnalyze={handleQuickAnalyze}
        />
      ) : (
        <Workspace
          key={workspaceInitialView}
          language={language}
          onToggleLanguage={handleToggleLanguage}
          onReturnToLanding={() => {
            setMode('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          ideas={ideas}
          profile={profile}
          onUpdateProfile={handleUpdateProfile}
          onSaveNewIdea={handleSaveNewIdea}
          onArchiveIdea={handleArchiveIdea}
          onBulkArchiveIdeas={handleBulkArchiveIdeas}
          onUpdateIdeaTags={handleUpdateIdeaTags}
          initialView={workspaceInitialView}
          initialDescription={initialAnalyzeDescription}
          initialStage={initialAnalyzeStage}
        />
      )}

      <AuthView
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        onSuccess={(updated) => {
          setProfile(updated);
          handleOpenWorkspace('dashboard');
        }}
        isArabic={language === 'ar'}
        currentProfile={profile}
        initialMode="signin"
      />

      <AuthView
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={(updated) => {
          setProfile(updated);
          handleOpenWorkspace('dashboard');
        }}
        isArabic={language === 'ar'}
        currentProfile={profile}
        initialMode="register"
      />
    </div>
  );
}
