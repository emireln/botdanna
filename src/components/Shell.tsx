import { useLayoutEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './NavTabs';
import { useTabLayout } from '../state/tabLayout';

export function AppShell() {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const section = location.pathname.split('/')[1] || 'coach';
  const { layout } = useTabLayout();

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
      {/* With the tabs in the title bar, the bar holds them (see TitleBar), so nothing is repeated here. */}
      {layout === 'bottom' && <BottomNav />}
    </div>
  );
}
