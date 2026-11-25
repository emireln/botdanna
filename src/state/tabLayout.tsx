// The tab layout on the page: under the screen, or in the title bar. The choice belongs to this device (see
// readTabLayout in lib/preferences.ts). The provider keeps it in memory, so the page follows at once when it changes.
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { readTabLayout, writeTabLayout, type TabLayout } from '../lib/preferences';

interface TabLayoutValue {
  layout: TabLayout;
  setLayout: (next: TabLayout) => void;
}

// Without a provider (a page rendered on its own, or a test) the tabs stay at the bottom and do not change.
const FALLBACK: TabLayoutValue = { layout: 'bottom', setLayout: () => undefined };

const TabLayoutContext = createContext<TabLayoutValue | null>(null);

export function TabLayoutProvider({ children }: { children: ReactNode }) {
  const [layout, setLayoutState] = useState<TabLayout>(() => readTabLayout());
  const setLayout = useCallback((next: TabLayout) => {
    writeTabLayout(next);
    setLayoutState(next);
  }, []);
  const value = useMemo(() => ({ layout, setLayout }), [layout, setLayout]);
  return <TabLayoutContext.Provider value={value}>{children}</TabLayoutContext.Provider>;
}

export function useTabLayout(): TabLayoutValue {
  return useContext(TabLayoutContext) ?? FALLBACK;
}
