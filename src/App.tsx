// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import React, { Suspense, useState, useEffect } from 'react';
import { ALL_LANGS, LangCode } from './i18n/langs';
import './i18n/config';
import i18n from './i18n/config';
import { VoiceLangSync } from './i18n/VoiceLangSync';
import { Preloader } from './components/Preloader';
import { Navbar } from './components/Navbar';
import { MainContent } from './components/MainContent';
import { AboutUsPage } from './components/AboutUsPage';
import { AuthPage } from './components/AuthPage';
import { CitizenDashboard } from './components/CitizenDashboard';
import { VoiceSaathi } from './voice/VoiceSaathi';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { translateDOMSubtree } from './utils/domTranslator';

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#f5efe1] flex flex-col items-center justify-center p-6 text-[#083b5e]">
      <div className="w-16 h-16 border-4 border-amber-600/30 border-t-amber-600 rounded-full animate-spin mb-4" />
      <div className="text-sm font-bold tracking-wider uppercase text-stone-600">
        Loading Sovereign Platform...
      </div>
    </div>
  );
}

// Ensures every line on every page is immediately translated whenever the page changes
const PageTranslationSyncer: React.FC<{ currentPage: string }> = ({ currentPage }) => {
  const { currentLanguage } = useLanguage();
  useEffect(() => {
    if (typeof document !== 'undefined') {
      translateDOMSubtree(document.body, currentLanguage);
      const t1 = setTimeout(() => {
        translateDOMSubtree(document.body, currentLanguage);
      }, 100);
      const t2 = setTimeout(() => {
        translateDOMSubtree(document.body, currentLanguage);
      }, 350);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [currentPage, currentLanguage]);
  return null;
};

function AppShell() {
  const { lang } = useParams();
  const [showPreloader, setShowPreloader] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<{ name: string; role: string } | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('swanirvar_active_user');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return null;
  });

  const [currentPage, setCurrentPage] = useState<'home' | 'about' | 'auth' | 'dashboard'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.startsWith('#about')) return 'about';
      if (
        hash.startsWith('#login') ||
        hash.startsWith('#signup') ||
        hash.startsWith('#auth')
      ) {
        return 'auth';
      }
      if (hash.startsWith('#dashboard')) {
        try {
          const saved = localStorage.getItem('swanirvar_active_user');
          if (saved) return 'dashboard';
        } catch (e) {
          // ignore
        }
        return 'home';
      }
    }
    return 'home';
  });

  const [authMode, setAuthMode] = useState<'login' | 'signup'>(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#login')) {
      return 'login';
    }
    return 'signup';
  });

  // Sync route lang with i18n when url param changes
  useEffect(() => {
    if (lang && ALL_LANGS.includes(lang as LangCode)) {
      if (i18n.language !== lang) {
        i18n.changeLanguage(lang);
      }
    }
  }, [lang]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#dashboard')) {
        setCurrentPage('dashboard');
      } else if (hash.startsWith('#about')) {
        setCurrentPage('about');
      } else if (hash.startsWith('#login')) {
        setCurrentPage('auth');
        setAuthMode('login');
      } else if (
        hash.startsWith('#signup') ||
        hash.startsWith('#auth') ||
        hash.startsWith('#register')
      ) {
        setCurrentPage('auth');
        setAuthMode('signup');
      } else if (hash === '#top' || hash === '' || hash === '#statistics' || hash === '#faq') {
        setCurrentPage('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (
    page: 'home' | 'about' | 'auth' | 'dashboard',
    sectionIdOrMode?: string
  ) => {
    setCurrentPage(page);
    if (page === 'dashboard') {
      window.location.hash = '#dashboard';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (page === 'auth') {
      const mode = sectionIdOrMode === 'login' ? 'login' : 'signup';
      setAuthMode(mode);
      window.location.hash = `#${mode}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (page === 'about') {
      window.location.hash = '#about';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (sectionIdOrMode && sectionIdOrMode !== 'top') {
        window.location.hash = `#${sectionIdOrMode}`;
        setTimeout(() => {
          const el = document.getElementById(sectionIdOrMode);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 60);
      } else {
        window.location.hash = '#top';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleLoginSuccess = (user: { name: string; role: string }) => {
    setUserProfile(user);
    try {
      localStorage.setItem('swanirvar_active_user', JSON.stringify(user));
    } catch (e) {
      // ignore
    }
    handleNavigate('dashboard');
  };

  const handleLogout = () => {
    setUserProfile(null);
    try {
      localStorage.removeItem('swanirvar_active_user');
    } catch (e) {
      // ignore
    }
    handleNavigate('home', 'top');
  };

  return (
    <LanguageProvider>
      {/* Universal Page Translation Syncer */}
      <PageTranslationSyncer currentPage={currentPage} />

      {/* Brand Motion Identity Preloader */}
      {showPreloader && (
        <Preloader durationSeconds={5} onComplete={() => setShowPreloader(false)} />
      )}

      {/* Sovereign Landing / About Us / Dashboard Page */}
      <div className="min-h-screen bg-[#f5efe1] relative selection:bg-[#FF671F]/20 selection:text-[#111]">
        {/* Dynamic Responsive Navbar */}
        {currentPage !== 'dashboard' && (
          <Navbar
            currentPage={currentPage}
            onNavigate={handleNavigate}
            onReplayPreloader={() => setShowPreloader(true)}
          />
        )}

        {/* Page Content Switcher */}
        <main>
          {currentPage === 'home' ? (
            <MainContent onNavigateToLogin={() => handleNavigate('auth', 'login')} />
          ) : currentPage === 'dashboard' ? (
            <CitizenDashboard
              userName={userProfile?.name || 'Venu (Tanjore Artisan)'}
              userRole={userProfile?.role || 'Verified Citizen / VLE Promoter'}
              onNavigateHome={() => handleNavigate('home', 'top')}
              onLogout={handleLogout}
            />
          ) : currentPage === 'about' ? (
            <AboutUsPage onNavigateHome={() => handleNavigate('home', 'top')} />
          ) : (
            <AuthPage
              initialMode={authMode}
              onNavigateHome={() => handleNavigate('home', 'top')}
              onLoginSuccess={handleLoginSuccess}
            />
          )}
        </main>

        {/* Gemini-Enabled Humanized Voice Saathi */}
        <VoiceSaathi />
      </div>
    </LanguageProvider>
  );
}

function LangRouter() {
  const { lang } = useParams();
  if (!lang || !ALL_LANGS.includes(lang as any)) {
    const detected = (typeof navigator !== 'undefined' && navigator.language ? navigator.language.split('-')[0] : 'en');
    const fallback = ALL_LANGS.includes(detected as any) ? detected : 'en';
    return <Navigate to={`/${fallback}/`} replace />;
  }
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <VoiceLangSync />
      <Suspense fallback={<LoadingSkeleton />}>
        <Routes>
          <Route
            path="/:lang/*"
            element={
              <>
                <LangRouter />
                <AppShell />
              </>
            }
          />
          <Route path="/" element={<Navigate to="/en/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
