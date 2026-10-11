import React, { useState, useEffect } from 'react';
import Nav from '../components/layout/Nav';
import Footer from '../components/layout/Footer';
import VaultMenu from '../components/layout/VaultMenu';
import AuthModal from '../components/auth/AuthModal';
import AdminPasscodeModal from '../components/admin/AdminPasscodeModal';
import RecoveryTerminalModal from '../components/layout/RecoveryTerminalModal';
import CookieConsentBanner from '../components/legal/CookieConsentBanner';
import { ThemeProvider } from '../components/providers/ThemeProvider';
import { LanguageProvider } from '../components/providers/LanguageProvider';
import { ToastProvider, useToast } from '../components/providers/ToastProvider';
import { CurrencyProvider } from '../components/providers/CurrencyProvider';
import Button from '../components/ui/Button';
import EdgeGlow from '../components/ui/EdgeGlow';
import SacredGeometry from '../components/ui/SacredGeometry';
import DefensiveFallback from '../components/ui/DefensiveFallback';
import LivingAtmosphere from '../components/ui/LivingAtmosphere';
import GuideBee from '../components/prime/GuideBee';

// Public Site Views
import HomePage from '../app/(site)/page';
import DiagnosticPage from '../modules/diagnostic/page';
import OraclePage from '../app/(site)/oracle/page';
import DreamForgePage from '../app/(site)/dream-forge/page';
import MarketplacePage from '../app/(site)/marketplace/page';
import BookOfLiesPage from '../app/(site)/book-of-lies/page';
import BookOfLiesEpisodePage from '../app/(site)/book-of-lies/[slug]/page';
import HubPage from '../app/(site)/hub/page';
import AboutPage from '../app/(site)/about/page';
import ServicesPage from '../app/(site)/services/page';
import WorkPage from '../app/(site)/work/page';
import ContactPage from '../app/(site)/contact/page';
import UpgradePage from '../app/(site)/upgrade/page';
import PricingPage from '../app/(site)/pricing/page';
import PlaygroundPage from '../app/(site)/playground/page';
import PlaygroundToolDynamicPage from '../app/(site)/playground/[slug]/page';
import WorkspacePage from '../app/(site)/account/workspace/page';
import PremiumProfilePage from '../app/(site)/account/premium/page';
import UserProfilePage from '../app/(site)/u/[username]/page';
import CommunityPage from '../app/(site)/community/page';
import SignalApp from '../components/signal/SignalApp';
import SignalLanding from '../app/(site)/signal/page';
import SignalRadarPage from '../app/(site)/signal/radar/page';
import SignalDetailPage from '../app/(site)/signal/radar/[id]/page';
import SignalPricingPage from '../app/(site)/signal/pricing/page';

// Core Services
import ForgePage from '../modules/forge/page';
import MiragePage from '../modules/mirage/page';
import SentinelPage from '../modules/sentinel/page';
import CreativeWorkspace from '../components/creative/CreativeWorkspace';
import GhostwritingWorkspace from '../components/oracle/GhostwritingWorkspace';
import CentralDashboard from '../components/dashboard/CentralDashboard';

// Modules
import ResumeEditorPage from '../modules/resume-editor/page';
import DocAnalyzerPage from '../modules/doc-analyzer/page';
import GrowthMakerPage from '../modules/growth-maker/page';
import CareerBoardPage from '../modules/career-board/page';

// Legal Pages
import TermsOfServicePage from '../app/legal/terms/page';
import PrivacyPolicyPage from '../app/legal/privacy/page';
import CookiePolicyPage from '../app/legal/cookies/page';
import OfflinePage from '../app/(site)/offline/page';

// Admin Suite
import AdminLayout from '../app/(admin)/admin/layout';
import AdminDashboardPage from '../app/(admin)/admin/page';
import AdminLoginPage from '../app/(admin)/admin/login/page';
import AdminPortfolioPage from '../app/(admin)/admin/portfolio/page';
import AdminContentBankPage from '../app/(admin)/admin/content/page';
import AdminBookOfLiesPage from '../app/(admin)/admin/book-of-lies/page';
import AdminTemplatesPage from '../app/(admin)/admin/templates/page';
import AdminHubPage from '../app/(admin)/admin/hub/page';
import AdminUsersPage from '../app/(admin)/admin/users/page';
import AdminPrimeStudioPage from '../app/(admin)/admin/prime/page';
import AdminPhotosPage from '../app/(admin)/admin/photos/page';
import AdminMediaPage from '../app/(admin)/admin/media/page';
import AdminThemesPage from '../app/(admin)/admin/themes/page';
import AdminDeploymentsPage from '../app/(admin)/admin/deployments/page';
import AdminSectionsPage from '../app/(admin)/admin/sections/page';
import AdminAnalyticsPage from '../app/(admin)/admin/analytics/page';
import AdminSettingsPage from '../app/(admin)/admin/settings/page';
import AdminDiagnosticPage from '../app/(admin)/admin/diagnostic/page';
import AdminNotificationsPage from '../app/(admin)/admin/notifications/page';
import AdminRecoveryPage from '../app/(admin)/admin/recovery/page';
import AdminFooterPage from '../app/(admin)/admin/footer/page';

function AppContent() {
  const [currentPath, setCurrentPath] = useState('/');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [adminPasscodeOpen, setAdminPasscodeOpen] = useState(false);
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const { showToast } = useToast();

  const hasAdminSession = () => {
    try {
      return (
        sessionStorage.getItem('jadai_admin_unlocked') === 'true' ||
        localStorage.getItem('jadai_admin_unlocked') === 'true'
      );
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname || '/';
      if (path.startsWith('/admin') && !hasAdminSession()) {
        setCurrentPath('/');
        window.history.replaceState({}, '', '/');
        showToast('Admin Lounge access requires 5-tap logo sequence', 'error', 'Access Restricted');
      } else {
        setCurrentPath(path);
      }
    };

    if (window.location.pathname && window.location.pathname !== '/') {
      const initialPath = window.location.pathname;
      if (initialPath.startsWith('/admin') && !hasAdminSession()) {
        setCurrentPath('/');
        window.history.replaceState({}, '', '/');
        showToast('Admin Lounge access requires 5-tap logo sequence', 'error', 'Access Restricted');
      } else {
        setCurrentPath(initialPath);
      }
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const handleOpenAuth = () => {
      setAuthModalOpen(true);
    };
    const handleOpenAdminPasscode = () => {
      setAdminPasscodeOpen(true);
    };
    window.addEventListener('jadai_open_auth', handleOpenAuth);
    window.addEventListener('jadai_open_admin_passcode', handleOpenAdminPasscode);
    return () => {
      window.removeEventListener('jadai_open_auth', handleOpenAuth);
      window.removeEventListener('jadai_open_admin_passcode', handleOpenAdminPasscode);
    };
  }, []);

  const scrollToAnchor = (hash: string) => {
    const elementId = hash.replace(/^#/, '');
    const maxAttempts = 15;
    let attempts = 0;

    const tryScroll = () => {
      const el = document.getElementById(elementId) || document.querySelector(`[name="${elementId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        try {
          window.history.replaceState(null, '', `#${elementId}`);
        } catch {}
      } else if (attempts < maxAttempts) {
        attempts++;
        requestAnimationFrame(() => setTimeout(tryScroll, 60));
      }
    };

    requestAnimationFrame(tryScroll);
  };

  const navigateTo = (path: string) => {
    // Handle short link direct visits
    if (path.startsWith('/s/')) {
      window.location.href = path;
      return;
    }

    // Handle section anchor links (e.g. #studio-tools-section or /#studio-tools-section)
    if (path.includes('#')) {
      const parts = path.split('#');
      const targetBase = parts[0] === '' || parts[0] === '/' ? '/' : parts[0];
      const hash = parts[1];

      if (currentPath === targetBase) {
        scrollToAnchor(hash);
        return;
      } else {
        setCurrentPath(targetBase);
        window.history.pushState({}, '', path);
        scrollToAnchor(hash);
        return;
      }
    }

    if (path.startsWith('/admin') && !hasAdminSession()) {
      showToast('Admin Lounge access requires 5-tap logo sequence', 'error', 'Access Restricted');
      setCurrentPath('/');
      window.history.pushState({}, '', '/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentPath(path);
    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Intercept all native anchor links across the entire application for fluid smooth scrolling
  useEffect(() => {
    const handleGlobalAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Handle anchor links (e.g., #studio-tools-section, /#studio-tools-section)
      if (href.startsWith('#') || (href.startsWith('/#') && (currentPath === '/' || !href.includes('/', 2)))) {
        e.preventDefault();
        const hash = href.includes('#') ? href.split('#')[1] : '';
        if (hash) {
          if (currentPath !== '/') {
            setCurrentPath('/');
            window.history.pushState({}, '', `/#${hash}`);
            scrollToAnchor(hash);
          } else {
            scrollToAnchor(hash);
          }
        }
      }
    };

    document.addEventListener('click', handleGlobalAnchorClick);
    return () => document.removeEventListener('click', handleGlobalAnchorClick);
  }, [currentPath]);

  const handleAdminTrigger = () => {
    setAdminPasscodeOpen(true);
  };

  const handleRecoveryTrigger = () => {
    setRecoveryOpen(true);
    showToast('Disaster Recovery terminal activated', 'error', 'Level 0 Breach');
  };

  const isAdminRoute = currentPath.startsWith('/admin');

  const renderAdminSubpage = () => {
    switch (currentPath) {
      case '/admin/portfolio':
        return <AdminPortfolioPage />;
      case '/admin/content':
        return <AdminContentBankPage />;
      case '/admin/book-of-lies':
        return <AdminBookOfLiesPage />;
      case '/admin/templates':
        return <AdminTemplatesPage />;
      case '/admin/hub':
        return <AdminHubPage />;
      case '/admin/users':
        return <AdminUsersPage />;
      case '/admin/prime':
        return <AdminPrimeStudioPage />;
      case '/admin/photos':
        return <AdminPhotosPage />;
      case '/admin/media':
        return <AdminMediaPage />;
      case '/admin/themes':
        return <AdminThemesPage />;
      case '/admin/deployments':
        return <AdminDeploymentsPage />;
      case '/admin/sections':
        return <AdminSectionsPage />;
      case '/admin/analytics':
        return <AdminAnalyticsPage />;
      case '/admin/settings':
        return <AdminSettingsPage />;
      case '/admin/diagnostic':
        return <AdminDiagnosticPage />;
      case '/admin/notifications':
        return <AdminNotificationsPage />;
      case '/admin/recovery':
        return <AdminRecoveryPage />;
      case '/admin/footer':
        return <AdminFooterPage />;
      case '/admin':
      default:
        return <AdminDashboardPage />;
    }
  };

  const renderActiveView = () => {
    try {
      // 1. Full Admin Lounge with Sidebar (Strictly protected by 5-tap session flag)
      if (isAdminRoute) {
        if (!hasAdminSession()) {
          return <HomePage onNavigate={navigateTo} />;
        }
        return (
          <AdminLayout currentSubpath={currentPath} onNavigate={navigateTo}>
            {renderAdminSubpage()}
          </AdminLayout>
        );
      }

      // Dynamic public routes
      if (currentPath.startsWith('/book-of-lies/')) {
        const slug = currentPath.replace('/book-of-lies/', '').trim();
        return <BookOfLiesEpisodePage params={{ slug }} />;
      }

      if (currentPath.startsWith('/services/')) {
        return <ServicesPage />;
      }

      if (currentPath.startsWith('/playground/')) {
        const slug = currentPath.replace('/playground/', '').trim();
        if (slug === 'forge') return <ForgePage onNavigate={navigateTo} />;
        if (slug === 'mirage') return <MiragePage onNavigate={navigateTo} />;
        if (slug === 'sentinel') return <SentinelPage />;
        return <PlaygroundToolDynamicPage params={{ slug }} onNavigate={navigateTo} />;
      }

      if (currentPath.startsWith('/u/')) {
        const username = currentPath.replace('/u/', '').trim();
        return <UserProfilePage params={{ username }} onNavigate={navigateTo} />;
      }

      if (currentPath.startsWith('/marketplace/')) {
        return <MarketplacePage />;
      }

      if (currentPath.startsWith('/work/')) {
        return <WorkPage />;
      }

      if (currentPath === '/signal') {
        return <SignalLanding onNavigate={navigateTo} />;
      }
      if (currentPath.startsWith('/signal/radar/')) {
        const id = currentPath.replace('/signal/radar/', '').trim();
        return <SignalDetailPage params={{ id }} onNavigate={navigateTo} />;
      }
      if (currentPath === '/signal/radar') {
        return <SignalRadarPage onNavigate={navigateTo} />;
      }
      if (currentPath === '/signal/pricing') {
        return <SignalPricingPage onNavigate={navigateTo} />;
      }
      if (currentPath.startsWith('/signal')) {
        return <SignalApp initialPath={currentPath} onNavigate={navigateTo} />;
      }

      // Normalized path (strip trailing slash if not root)
      const normalized = currentPath.length > 1 && currentPath.endsWith('/')
        ? currentPath.slice(0, -1)
        : currentPath;

      // 3. Public Canonical Pages (One canonical route per page)
      switch (normalized) {
        case '/':
          return <HomePage onNavigate={navigateTo} />;
        case '/dashboard':
          return <CentralDashboard onNavigate={navigateTo} />;
        case '/create':
          return <CreativeWorkspace onNavigate={navigateTo} initialTab="create" />;
        case '/library':
          return <CreativeWorkspace onNavigate={navigateTo} initialTab="library" />;
        case '/write':
          return <GhostwritingWorkspace />;
        case '/playground':
          return <PlaygroundPage onNavigate={navigateTo} />;
        case '/playground/forge':
          return <ForgePage onNavigate={navigateTo} />;
        case '/playground/mirage':
          return <MiragePage onNavigate={navigateTo} />;
        case '/playground/sentinel':
          return <SentinelPage />;
        case '/oracle':
          return <OraclePage />;
        case '/book-of-lies':
          return <BookOfLiesPage />;
        case '/dream-forge':
          return <DreamForgePage />;
        case '/marketplace':
          return <MarketplacePage />;
        case '/hub':
          return <HubPage />;
        case '/about':
          return <AboutPage />;
        case '/services':
          return <ServicesPage />;
        case '/work':
          return <WorkPage />;
        case '/contact':
          return <ContactPage />;
        case '/upgrade':
          return <UpgradePage />;
        case '/pricing':
          return <PricingPage onNavigate={navigateTo} />;
        case '/community':
          return <CommunityPage onNavigate={navigateTo} />;
        case '/account/workspace':
          return <WorkspacePage onNavigate={navigateTo} />;
        case '/account/premium':
          return <PremiumProfilePage onNavigate={navigateTo} />;

      // Module pages (imported above, previously unrouted)
      case '/resume-editor':
        return <ResumeEditorPage />;
      case '/doc-analyzer':
        return <DocAnalyzerPage />;
      case '/growth-maker':
        return <GrowthMakerPage />;

      // Career Board
      case '/career-board':
        return <CareerBoardPage />;

      // Legal & Offline
      case '/offline':
        return <OfflinePage />;
      case '/legal/terms':
        return <TermsOfServicePage />;
      case '/legal/privacy':
        return <PrivacyPolicyPage />;
      case '/legal/cookies':
        return <CookiePolicyPage />;

      default:
        return (
          <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center space-y-5 my-auto">
            <div className="w-16 h-16 rounded-full border border-[rgba(201,168,76,0.4)] flex items-center justify-center bg-[rgba(201,168,76,0.1)] shadow-[0_0_25px_rgba(201,168,76,0.2)]">
              <SacredGeometry size={28} className="text-[#C9A84C]" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-3xl font-display font-bold text-[#f5f3f0]">This chamber is sealed.</h2>
              <p className="text-sm font-mono text-[#8a6e2a] max-w-md mx-auto">
                The coordinates you requested are unanchored in the studio registry.
              </p>
            </div>
            <EdgeGlow intensity="intense" color="gold" borderRadius="8px">
              <Button variant="primary" onClick={() => navigateTo('/')}>
                Return to Surface
              </Button>
            </EdgeGlow>
          </div>
        );
      }
    } catch (err) {
      console.error('Render error caught by defensive boundary:', err);
      return <DefensiveFallback onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between relative bg-[#050404] text-[#c4c0bb]">
      {/* Living Atmospheric Background per section (Fixed, z-0, CSS-only keyframes) */}
      <LivingAtmosphere currentPath={currentPath} />

      {/* Top Navigation Bar (Rendered on public pages) */}
      {!isAdminRoute && (
        <Nav
          currentPath={currentPath}
          onNavigate={navigateTo}
          onAdminTrigger={handleAdminTrigger}
          onRecovery={handleRecoveryTrigger}
        />
      )}

      {/* The Sanctuary Vault Menu (Safe-lock rotary dial, active across site) */}
      <VaultMenu
        onSelect={navigateTo}
        currentPath={currentPath}
      />

      {/* Floating GUIDE Navigation Assistant */}
      {!isAdminRoute && (
        <GuideBee onNavigate={navigateTo} />
      )}

      {/* Main Viewport */}
      <main className="flex-1 w-full relative z-[1]">
        {renderActiveView()}
      </main>

      {/* Footer (Rendered on public pages) */}
      {!isAdminRoute && (
        <Footer />
      )}

      {/* Cookie Consent Banner */}
      <CookieConsentBanner />

      {/* Auth Modal (Google, Email/Password, Guest) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Admin Access Passcode Modal (Opened ONLY via 5-tap on Logo within 3 seconds) */}
      <AdminPasscodeModal
        isOpen={adminPasscodeOpen}
        onClose={() => setAdminPasscodeOpen(false)}
        onSuccess={() => {
          showToast('Admin session unlocked', 'success');
          navigateTo('/admin');
        }}
      />

      {/* 20-Tap Disaster Recovery Terminal Modal */}
      <RecoveryTerminalModal
        isOpen={recoveryOpen}
        onClose={() => setRecoveryOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
