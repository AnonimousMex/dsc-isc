import { useMotionSettings } from '../motion/MotionExperience';
import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
const TABS = [
  { key: 'ingreso', label: 'Perfil de ingreso' },
  { key: 'egreso', label: 'Perfil de egreso' },
  { key: 'campo', label: 'Campo laboral' },
] as const;
export default function ProfileTabs({
  admissionProfile,
  graduateProfile,
  actionField,
}: {
  admissionProfile: string;
  graduateProfile: string[];
  actionField: string;
}) {
  const [index, setIndex] = useState(0);
  const id = useId();
  const { enabled } = useMotionSettings();
  const reduced = !enabled;
  return (
    <div className="profile-explorer">
      <div
        role="tablist"
        aria-label="Perfiles del programa"
        className="profile-tabs"
        onKeyDown={(event) => {
          let next = index;
          if (event.key === 'ArrowRight') next = (index + 1) % 3;
          else if (event.key === 'ArrowLeft') next = (index + 2) % 3;
          else if (event.key === 'Home') next = 0;
          else if (event.key === 'End') next = 2;
          else return;
          event.preventDefault();
          setIndex(next);
          event.currentTarget.querySelectorAll<HTMLButtonElement>('button')[next]?.focus();
        }}
      >
        {TABS.map((tab, i) => (
          <button
            type="button"
            key={tab.key}
            id={`${id}-tab-${i}`}
            role="tab"
            aria-selected={i === index}
            aria-controls={`${id}-panel`}
            tabIndex={i === index ? 0 : -1}
            onClick={() => setIndex(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${index}`}
        tabIndex={0}
        className="profile-panel"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: reduced ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
          >
            {index === 0 && <p>{admissionProfile}</p>}
            {index === 1 &&
              (graduateProfile.length ? (
                <ul>
                  {graduateProfile.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p>El perfil de egreso estará disponible próximamente.</p>
              ))}
            {index === 2 && <p>{actionField}</p>}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
