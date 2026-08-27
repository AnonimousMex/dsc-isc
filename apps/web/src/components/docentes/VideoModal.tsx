import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toYoutubeEmbedUrl } from '@dsc-isc/shared';

interface VideoModalProps {
  youtubeUrl: string;
  title: string;
  onClose: () => void;
}

/**
 * El iframe de YouTube nunca se monta hasta que el modal se abre (sección
 * 10.4: "lazy-load del iframe, nunca cargarlo hasta que se abre").
 */
export default function VideoModal({ youtubeUrl, title, onClose }: VideoModalProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="aspect-video w-full max-w-3xl overflow-hidden rounded-lg bg-ink"
          onClick={(event) => event.stopPropagation()}
        >
          <iframe
            src={toYoutubeEmbedUrl(youtubeUrl)}
            title={title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </motion.div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar video"
          className="absolute right-6 top-6 rounded p-2 text-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
        >
          ✕
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
