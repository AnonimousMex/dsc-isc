import { useEffect, useRef } from 'react';
import MotionExperience from '../components/motion/MotionExperience';
import ScrollEntrance from '../components/motion/ScrollEntrance';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/nav/Header';
import Footer from '../components/shared/Footer';
import PresentationProvider from '../lib/PresentationContext';

export default function RootLayout() {
  const { pathname, hash } = useLocation();
  const previousPath = useRef(pathname);
  useEffect(() => {
    const withinCommunity =
      previousPath.current.startsWith('/comunidad') && pathname.startsWith('/comunidad');
    previousPath.current = pathname;
    if (withinCommunity && !hash) return;
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    const scrollToTarget = () => {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!target) return false;
      target.scrollIntoView();
      return true;
    };
    if (scrollToTarget()) return;
    const observer = new MutationObserver(() => {
      if (scrollToTarget()) observer.disconnect();
    });
    observer.observe(document.getElementById('main-content')!, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname, hash]);
  return (
    <PresentationProvider>
      <MotionExperience>
        <div className="flex min-h-svh flex-col">
          <Header />
          <main id="main-content" className={`flex-1 ${pathname !== '/' ? 'interior-main' : ''}`}>
            <ScrollEntrance />
            <Outlet />
          </main>
          <Footer />
        </div>
      </MotionExperience>
    </PresentationProvider>
  );
}
