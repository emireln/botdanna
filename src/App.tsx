import { useEffect, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AppShell } from './components/Shell';
import { TitleBar } from './components/TitleBar';
import { Notice } from './components/ui';
import { bridge } from './lib/bridge';
import { LIVE_TALK_ENABLED } from './lib/features';
import { hasWelcomed } from './lib/session';
import { AuthProvider, useAuth } from './state/auth';
import { AIProvider } from './state/ai';
import { AppDataProvider, useAppData } from './state/appData';
import { LookSync } from './state/look';
import { ToastProvider } from './state/toast';
import { UpdateNotice } from './components/UpdateNotice';
import { LanguageProvider, useT } from './lib/i18n/react';
import { Splash } from './screens/Splash';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { AuthScreen } from './screens/AuthScreen';
import { SetupScreen } from './screens/SetupScreen';
import { CoachScreen } from './screens/CoachScreen';
import { LiveScreen } from './screens/LiveScreen';
import { WriteScreen } from './screens/WriteScreen';
import { LibraryScreen } from './screens/LibraryScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SettingsScreen } from './screens/SettingsScreen';

function RequireSignedIn({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <Splash />;
  if (status === 'out') {
    return <Navigate to={hasWelcomed() ? '/auth' : '/welcome'} replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}

function RequireSetup({ children }: { children: ReactNode }) {
  const { ready, profile } = useAppData();
  if (!ready) return <Splash />;
  if (!profile) return <ProfileProblem />;
  if (!profile.onboarding_done) return <Navigate to="/setup" replace />;
  return <>{children}</>;
}

function ProfileProblem() {
  const navigate = useNavigate();
  const { signOut, mode } = useAuth();
  const { refresh, loadError } = useAppData();
  const t = useT();
  return (
    <div className="auth">
      <div className="auth__card">
        <Notice tone="error">{loadError ? t(loadError) : t('We could not load your profile.')}</Notice>
        <button className="btn btn--primary btn--block" onClick={() => void refresh()}>
          {t('Try again')}
        </button>
        <button
          className="btn btn--ghost btn--block"
          onClick={async () => {
            await signOut();
            navigate('/auth', { replace: true });
          }}
        >
          {mode === 'supabase' ? t('Back to sign in') : t('Back')}
        </button>
      </div>
    </div>
  );
}

// The tray menu can open a page; the interface follows.
function NavigationBridge() {
  const navigate = useNavigate();
  useEffect(() => (bridge ? bridge.onNavigate((path) => navigate(path)) : undefined), [navigate]);
  return null;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/welcome" element={<WelcomeScreen />} />
      <Route path="/auth" element={<AuthScreen />} />
      <Route
        path="/setup"
        element={
          <RequireSignedIn>
            <SetupScreen />
          </RequireSignedIn>
        }
      />
      <Route
        element={
          <RequireSignedIn>
            <RequireSetup>
              <AppShell />
            </RequireSetup>
          </RequireSignedIn>
        }
      >
        <Route index element={<CoachScreen />} />
        <Route path="coach" element={<Navigate to="/" replace />} />
        <Route path="coach/live" element={LIVE_TALK_ENABLED ? <LiveScreen /> : <Navigate to="/" replace />} />
        <Route path="write" element={<WriteScreen />} />
        <Route path="library" element={<LibraryScreen />} />
        <Route path="profile" element={<ProfileScreen />} />
        <Route path="settings" element={<SettingsScreen />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function Frame() {
  return (
    <div className="frame">
      <TitleBar />
      <div className="frame__body">
        <NavigationBridge />
        <AppRoutes />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <UpdateNotice />
        <AuthProvider>
          <AIProvider>
            <AppDataProvider>
              <LookSync />
              <Frame />
            </AppDataProvider>
          </AIProvider>
        </AuthProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}
