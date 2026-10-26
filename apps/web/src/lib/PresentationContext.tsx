import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  applyPresentation,
  DEFAULT_PRESENTATION,
  readPresentation,
  resolvePresentationColors,
} from '@dsc-isc/shared';
import { api } from './apiClient';
const PresentationContext = createContext(DEFAULT_PRESENTATION);
export const usePresentation = () => useContext(PresentationContext);
export default function PresentationProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(DEFAULT_PRESENTATION);
  useEffect(() => {
    let cancelled = false;
    const load = () =>
      api
        .siteConfig()
        .then((config) => {
          if (cancelled) return;
          const next = readPresentation(config);
          next.colors = resolvePresentationColors(next.colors);
          applyPresentation(next);
          setSettings(next);
        })
        .catch(() => {});
    void load();
    const onFocus = () => {
      void load();
    };
    window.addEventListener('focus', onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
    };
  }, []);
  return <PresentationContext.Provider value={settings}>{children}</PresentationContext.Provider>;
}
