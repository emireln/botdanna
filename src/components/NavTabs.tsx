// The tabs of the app: the coach (home), the writing check and the learner's files. They sit under the screen, or in the
// title bar, as the tab layout of this device chooses (see state/tabLayout.tsx). Talk live joins them when
// LIVE_TALK_ENABLED is on (src/lib/features.ts).
import type { ComponentType } from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Bot, Mic, PenLine } from 'lucide-react';
import { useT } from '../lib/i18n/react';
import { LIVE_TALK_ENABLED } from '../lib/features';

export const TABS: Array<{ to: string; label: string; icon: ComponentType<{ 'aria-hidden'?: boolean }>; end: boolean }> = [
  { to: '/', label: 'Coach', icon: Bot, end: true },
  { to: '/coach/live', label: 'Live', icon: Mic, end: false },
  { to: '/write', label: 'Write', icon: PenLine, end: false },
  { to: '/library', label: 'Library', icon: BookOpen, end: false },
].filter((tab) => LIVE_TALK_ENABLED || tab.to !== '/coach/live');

/** The tabs under the screen: the bar the app has always had. */
export function BottomNav() {
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

/** The same tabs in the title bar, next to the wordmark. In a narrow window only the icons show, and each keeps its name. */
export function TitleTabs() {
  const t = useT();
  return (
    <nav className="titletabs" aria-label={t('Main')}>
      {TABS.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            aria-label={t(tab.label)}
            className={({ isActive }) => `titletabs__item${isActive ? ' is-active' : ''}`}
          >
            <Icon aria-hidden={true} />
            <span className="titletabs__label">{t(tab.label)}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
