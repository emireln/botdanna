import { useLayoutEffect, useRef, type ComponentType } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { BookOpen, Bot, Mic, PenLine } from 'lucide-react';
import { useT } from '../lib/i18n/react';
import { LIVE_TALK_ENABLED } from '../lib/features';

// The places of the app: the coach (home), the writing check and the learner's files. Talk live joins them when
// LIVE_TALK_ENABLED is on (src/lib/features.ts).
const TABS: Array<{ to: string; label: string; icon: ComponentType<{ 'aria-hidden'?: boolean }>; end: boolean }> = [
  { to: '/', label: 'Coach', icon: Bot, end: true },
  { to: '/coach/live', label: 'Live', icon: Mic, end: false },
  { to: '/write', label: 'Write', icon: PenLine, end: false },
  { to: '/library', label: 'Library', icon: BookOpen, end: false },
].filter((tab) => LIVE_TALK_ENABLED || tab.to !== '/coach/live');

function BottomNav() {
  const t = useT();
  return (
    <nav className="nav" aria-label={t('Main')}>
      {TABS.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink key={tab.to} to={tab.to} end={tab.end} className={({ isActive }) => `nav__item ${isActive ? 'is-active' : ''}`}>
            <Icon aria-hidden={true} />
            <span>{t(tab.label)}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export function AppShell() {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const section = location.pathname.split('/')[1] || 'coach';

  // Every new page starts at its top, including a sub-page of the same section.
  // It runs before the frame is painted, so the page never shows at the old scroll position first.
  useLayoutEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <div className="shell">
      <main className="main" ref={mainRef}>
        {/* A section fades in with a CSS animation when it opens. Nothing waits for the old page to leave first, and
            nothing is animated in JavaScript while the new page mounts, so the change does not stutter. */}
        <div key={section} className="shell__page">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
