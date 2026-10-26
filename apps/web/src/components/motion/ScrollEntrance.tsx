import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePresentation } from '../../lib/PresentationContext';
import { useMotionSettings } from './MotionExperience';

export default function ScrollEntrance() {
  const { pathname } = useLocation();
  const { motion } = usePresentation();
  const { enabled: playing } = useMotionSettings();
  const enabled = playing && motion.reveal;
  useEffect(() => {
    const main = document.getElementById('main-content');
    if (!main) return;
    let frame = 0;
    const observed = new WeakSet<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0, rootMargin: '0px 0px -35px 0px' },
    );
    function scan() {
      main!
        .querySelectorAll<HTMLElement>(
          '.home-editorial > section:not(.systems-hero), .home-editorial > nav, .interior-page .section-heading:not(.reveal), .detail-editorial > section, .registration-page form, .lab-explorer, .resource-workspace, .community-workspace, .editorial-toolbar, .faculty-toolbar, .graduate-invitation, .graduate-directory-heading',
        )
        .forEach((node) => {
          if (node.closest('.reveal')) return;
          if (!enabled) {
            node.classList.add('is-visible');
            return;
          }
          if (node.classList.contains('is-visible') || observed.has(node)) return;
          observed.add(node);
          node.classList.add('scroll-entrance');
          observer.observe(node);
        });
    }
    const mutations = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scan);
    });
    scan();
    mutations.observe(main, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      mutations.disconnect();
    };
  }, [pathname, enabled]);
  return null;
}
