import { useEffect, useState } from 'react';
import { useBlocker, useSearchParams } from 'react-router-dom';
import {
  Check,
  ExternalLink,
  Image,
  Palette,
  Save,
  Sparkles,
  Type,
  RotateCcw,
  Layers,
} from 'lucide-react';
import {
  DEFAULT_PRESENTATION,
  PRESENTATION_KEY,
  presentationSchema,
  readPresentation,
  resolvePresentationColors,
  readableTextColor,
  type PresentationSettings,
  type SiteConfig,
} from '@dsc-isc/shared';
import { useAuth } from '../lib/AuthContext';
import { apiGet, apiPut } from '../lib/apiClient';
import { Button } from '../components/ui/button';
import ConfirmDialog from '../components/ConfirmDialog';
import HeroImageField from '../components/HeroImageField';
import HomeImagesManager from '../components/HomeImagesManager';
const tabs = [
  { key: 'textos', label: 'Textos', icon: Type },
  { key: 'fotos', label: 'Fotos', icon: Image },
  { key: 'colores', label: 'Colores', icon: Palette },
  { key: 'animaciones', label: 'Animaciones', icon: Sparkles },
];
const pageImages = [
  { key: 'inicio', label: 'Página principal' },
  { key: 'nosotros', label: 'Conócenos' },
  { key: 'ofertaEducativa', label: 'La carrera' },
  { key: 'docentes', label: 'Docentes' },
  { key: 'especialidades', label: 'Especialidades' },
  { key: 'comunidad', label: 'Comunidad' },
  { key: 'noticias', label: 'Noticias' },
  { key: 'normateca', label: 'Documentos' },
  { key: 'egresados', label: 'Egresados' },
];
const chapters = [
  { key: 'nosotros', label: 'Conócenos' },
  { key: 'carrera', label: 'La carrera' },
  { key: 'docentes', label: 'Docentes' },
  { key: 'laboratorios', label: 'Laboratorios' },
  { key: 'especialidades', label: 'Especialidades' },
  { key: 'comunidad', label: 'Comunidad' },
  { key: 'noticias', label: 'Noticias' },
  { key: 'normateca', label: 'Documentos' },
  { key: 'egresados', label: 'Egresados' },
] as const;
const effects = [
  { value: 'history', label: 'Hélice · historia' },
  { value: 'systems', label: 'Capas · sistemas' },
  { value: 'faculty', label: 'Constelación · conocimiento' },
  { value: 'community', label: 'Anillos · conexiones' },
  { value: 'specialties', label: 'Ramas · especialidades' },
  { value: 'news', label: 'Ondas · noticias' },
  { value: 'resources', label: 'Documentos flotantes' },
  { value: 'graduates', label: 'Trayectoria · egresados' },
  { value: 'chip', label: 'Chip y circuitos · laboratorio' },
  { value: 'none', label: 'Sin figura animada' },
];
function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="admin-toggle-row">
      <span>
        <strong>{label}</strong>
        <small>{hint}</small>
      </span>
      <input
        type="checkbox"
        role="switch"
        aria-label={label}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}
export default function Configuracion() {
  const { user } = useAuth();
  const canEdit = user?.role === 'SUPERADMIN' || user?.role === 'EDITOR';
  const [params, setParams] = useSearchParams();
  const active = tabs.some((t) => t.key === params.get('tab')) ? params.get('tab')! : 'textos';
  const [settings, setSettings] = useState<PresentationSettings>(DEFAULT_PRESENTATION),
    [snapshot, setSnapshot] = useState(JSON.stringify(DEFAULT_PRESENTATION)),
    [loading, setLoading] = useState(true),
    [ready, setReady] = useState(false),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(''),
    [success, setSuccess] = useState(''),
    [photoPage, setPhotoPage] = useState('inicio');
  const dirty = JSON.stringify(settings) !== snapshot;
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty && currentLocation.pathname !== nextLocation.pathname,
  );
  useEffect(() => {
    const onBefore = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBefore);
    return () => window.removeEventListener('beforeunload', onBefore);
  }, [dirty]);
  useEffect(() => {
    let alive = true;
    apiGet<SiteConfig[]>('/site-config')
      .then((config) => {
        if (!alive) return;
        const next = readPresentation(config);
        setSettings(next);
        setSnapshot(JSON.stringify(next));
        setReady(true);
      })
      .catch(() => {
        if (alive)
          setError('No pudimos cargar la configuración. Recarga la página antes de editar.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);
  function update<K extends keyof PresentationSettings>(
    group: K,
    patch: Partial<PresentationSettings[K]>,
  ) {
    setSettings((s) => ({ ...s, [group]: { ...s[group], ...patch } }));
    setSuccess('');
  }
  async function save() {
    const parsed = presentationSchema.safeParse(settings);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Revisa los campos antes de guardar.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await apiPut(`/site-config/${PRESENTATION_KEY}`, { value: parsed.data });
      setSettings(parsed.data);
      setSnapshot(JSON.stringify(parsed.data));
      setSuccess('Cambios guardados. Ya puedes verlos en la página pública.');
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'No se pudo guardar. Tus cambios siguen aquí para que puedas reintentar.',
      );
    } finally {
      setSaving(false);
    }
  }
  const previewColors = resolvePresentationColors(settings.colors);
  return (
    <div className="appearance-page">
      <div className="admin-page-heading">
        <div>
          <h1>Diseño y contenido</h1>
          <p>Personaliza lo que ven los visitantes, sin tocar código.</p>
        </div>
        <a
          className="admin-text-link"
          href={import.meta.env.VITE_PUBLIC_URL || 'http://localhost:5173'}
          target="_blank"
          rel="noreferrer"
        >
          Ver sitio publicado <ExternalLink size={15} />
        </a>
      </div>
      <div className="admin-settings-bar">
        <div
          role="tablist"
          aria-label="Configuración de la página"
          onKeyDown={(e) => {
            const current = tabs.findIndex((t) => t.key === active);
            let next = current;
            if (e.key === 'ArrowRight') next = (current + 1) % tabs.length;
            else if (e.key === 'ArrowLeft') next = (current + tabs.length - 1) % tabs.length;
            else if (e.key === 'Home') next = 0;
            else if (e.key === 'End') next = tabs.length - 1;
            else return;
            e.preventDefault();
            setParams({ tab: tabs[next].key });
            e.currentTarget.querySelectorAll<HTMLButtonElement>('button')[next]?.focus();
          }}
        >
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.key}
              role="tab"
              id={`settings-${tab.key}`}
              aria-selected={active === tab.key}
              tabIndex={active === tab.key ? 0 : -1}
              aria-controls="settings-panel"
              onClick={() => setParams({ tab: tab.key })}
            >
              <tab.icon size={17} />
              {tab.label}
            </button>
          ))}
        </div>
        <span className="admin-save-state">
          {loading ? (
            'Cargando…'
          ) : !ready ? (
            'No disponible'
          ) : dirty ? (
            'Cambios sin guardar'
          ) : (
            <>
              <Check size={14} /> Todo guardado
            </>
          )}
        </span>
      </div>
      {!canEdit && (
        <p className="admin-notice">
          Tu cuenta es de consulta. Puedes revisar los ajustes; un editor o administrador puede
          modificarlos.
        </p>
      )}
      {error && (
        <p role="alert" className="admin-alert">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="admin-success">
          {success}
        </p>
      )}
      <div className={`admin-settings-layout ${active === 'fotos' ? 'images-active' : ''}`}>
        <div id="settings-panel" role="tabpanel" aria-labelledby={`settings-${active}`}>
          <fieldset disabled={!canEdit || !ready || loading || saving}>
            {active === 'textos' && (
              <div className="admin-settings-card">
                <header>
                  <h2>Textos principales</h2>
                  <p>
                    Estos campos corresponden al inicio y al pie de página. El resto de textos se
                    edita en su propia sección del menú.
                  </p>
                </header>
                <div className="admin-form-stack">
                  <label>
                    Título del inicio
                    <textarea
                      rows={2}
                      maxLength={120}
                      value={settings.home.title}
                      onChange={(e) => update('home', { title: e.target.value })}
                    />
                    <small>Usa un salto de línea para separar el título.</small>
                  </label>
                  <label>
                    Frase destacada
                    <input
                      maxLength={70}
                      value={settings.home.highlight}
                      onChange={(e) => update('home', { highlight: e.target.value })}
                    />
                  </label>
                  <label>
                    Descripción de la carrera
                    <textarea
                      rows={4}
                      maxLength={500}
                      value={settings.home.description}
                      onChange={(e) => update('home', { description: e.target.value })}
                    />
                  </label>
                  <label>
                    Texto del botón principal
                    <input
                      maxLength={60}
                      value={settings.home.button}
                      onChange={(e) => update('home', { button: e.target.value })}
                    />
                  </label>
                  <label>
                    Mensaje del pie de página
                    <textarea
                      rows={2}
                      maxLength={150}
                      value={settings.home.footerTitle}
                      onChange={(e) => update('home', { footerTitle: e.target.value })}
                    />
                  </label>
                </div>
              </div>
            )}
            {active === 'fotos' && (
              <div className="admin-settings-card">
                <header>
                  <h2>Imágenes de la página</h2>
                  <p>
                    Selecciona una sección. Las imágenes se guardan con sus propios controles,
                    independientemente de los otros ajustes.
                  </p>
                </header>
                <label className="admin-field">
                  Página que quieres editar
                  <select value={photoPage} onChange={(e) => setPhotoPage(e.target.value)}>
                    {pageImages.map((page) => (
                      <option key={page.key} value={page.key}>
                        {page.label}
                      </option>
                    ))}
                  </select>
                </label>
                {photoPage === 'inicio' ? (
                  <HomeImagesManager />
                ) : (
                  <HeroImageField
                    key={photoPage}
                    configKey={`${photoPage}.heroImageUrl`}
                    title="Imagen de cabecera"
                    description="Aparece detrás del título al abrir esta página. Puedes subir una foto o usar un enlace."
                  />
                )}
                {photoPage === 'nosotros' && (
                  <div>
                    {[
                      { key: 'mision', label: 'Imagen de misión' },
                      { key: 'vision', label: 'Imagen de visión' },
                      { key: 'valores', label: 'Imagen de valores' },
                    ].map((item) => (
                      <HeroImageField
                        key={item.key}
                        configKey={`nosotros.${item.key}ImageUrl`}
                        title={item.label}
                      />
                    ))}
                  </div>
                )}
                <p className="admin-help mt-6">
                  Las fotos de docentes, laboratorios, especialidades y noticias se editan junto a
                  sus fichas, desde el menú.
                </p>
              </div>
            )}
            {active === 'colores' && (
              <div className="admin-settings-card">
                <header>
                  <h2>Colores del sitio</h2>
                  <p>
                    El sitio adapta los acentos a azules claros para mantener la legibilidad. La
                    vista previa muestra el resultado real, incluidos los colores guardados
                    anteriormente.
                  </p>
                </header>
                <div className="admin-color-fields">
                  {[
                    {
                      key: 'primary',
                      label: 'Color principal',
                      hint: 'Botones, enlaces y acentos de identidad.',
                    },
                    {
                      key: 'accent',
                      label: 'Al pasar el cursor',
                      hint: 'Variación de los botones al interactuar.',
                    },
                    {
                      key: 'signal',
                      label: 'Conexiones y resaltados',
                      hint: 'Color de la red animada del fondo.',
                    },
                    {
                      key: 'deep',
                      label: 'Fondo oscuro',
                      hint: 'Portada, cabeceras y pie de página.',
                    },
                  ].map(({ key, label, hint }) => (
                    <div key={key}>
                      <label htmlFor={`color-${key}`}>{label}</label>
                      <div>
                        <input
                          type="color"
                          aria-label={`Selector ${label}`}
                          value={
                            /^#[0-9a-f]{6}$/i.test(
                              settings.colors[key as keyof typeof settings.colors],
                            )
                              ? settings.colors[key as keyof typeof settings.colors]
                              : '#000000'
                          }
                          onChange={(e) => update('colors', { [key]: e.target.value })}
                        />
                        <input
                          id={`color-${key}`}
                          maxLength={7}
                          value={settings.colors[key as keyof typeof settings.colors]}
                          onChange={(e) => update('colors', { [key]: e.target.value })}
                        />
                      </div>
                      <small>{hint}</small>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => update('colors', DEFAULT_PRESENTATION.colors)}
                >
                  <RotateCcw size={14} /> Usar colores originales
                </Button>
              </div>
            )}
            {active === 'animaciones' && (
              <div className="admin-animation-settings">
                <div className="admin-settings-card">
                  <header>
                    <h2>Movimiento e interacción</h2>
                    <p>
                      Decide qué efectos acompañan al contenido. Los visitantes pueden pausar el
                      movimiento desde la página.
                    </p>
                  </header>
                  <div>
                    {[
                      {
                        key: 'enabled',
                        label: 'Activar animaciones',
                        hint: 'Interruptor general para los efectos del sitio.',
                      },
                      {
                        key: 'background',
                        label: 'Conexiones del fondo',
                        hint: 'Red de puntos y líneas detrás del contenido.',
                      },
                      {
                        key: 'interactive',
                        label: 'Efecto al mover el cursor',
                        hint: 'Inclinación de imágenes y figuras al interactuar.',
                      },
                      {
                        key: 'logos',
                        label: 'Animación del logo',
                        hint: 'Recorrido de luz sobre el logo DSC.',
                      },
                      {
                        key: 'reveal',
                        label: 'Aparición al hacer scroll',
                        hint: 'Entrada progresiva de los bloques de contenido.',
                      },
                    ].map((item) => (
                      <Toggle
                        key={item.key}
                        label={item.label}
                        hint={item.hint}
                        checked={
                          settings.motion[
                            item.key as
                              'enabled' | 'background' | 'interactive' | 'logos' | 'reveal'
                          ]
                        }
                        onChange={(value) => update('motion', { [item.key]: value })}
                      />
                    ))}
                  </div>
                  <label className="admin-field">
                    Intensidad de las conexiones
                    <select
                      value={settings.motion.intensity}
                      onChange={(e) =>
                        update('motion', {
                          intensity: e.target.value as PresentationSettings['motion']['intensity'],
                        })
                      }
                    >
                      <option value="soft">Discreta</option>
                      <option value="normal">Equilibrada</option>
                      <option value="vivid">Intensa</option>
                    </select>
                  </label>
                </div>
                <div className="admin-settings-card">
                  <header>
                    <h2>Avance automático</h2>
                    <p>
                      Las flechas y la selección manual siguen disponibles aunque desactives el
                      avance.
                    </p>
                  </header>
                  <Toggle
                    label="Cambiar imágenes automáticamente"
                    hint="Carrusel de la página principal."
                    checked={settings.home.autoplay}
                    onChange={(value) => update('home', { autoplay: value })}
                  />
                  <label className="admin-field">
                    Segundos entre imágenes
                    <input
                      type="number"
                      min="3"
                      max="30"
                      value={settings.home.interval}
                      onChange={(e) => update('home', { interval: Number(e.target.value) })}
                    />
                  </label>
                  <Toggle
                    label="Mostrar visualización de sistemas"
                    hint="Incluye la figura geométrica entre las imágenes del inicio."
                    checked={settings.home.showArtwork}
                    onChange={(value) => update('home', { showArtwork: value })}
                  />
                  <Toggle
                    label="Avanzar en la historia automáticamente"
                    hint="Línea del tiempo de Conócenos."
                    checked={settings.timeline.autoplay}
                    onChange={(value) => update('timeline', { autoplay: value })}
                  />
                  <label className="admin-field">
                    Segundos entre etapas
                    <input
                      type="number"
                      min="3"
                      max="30"
                      value={settings.timeline.interval}
                      onChange={(e) => update('timeline', { interval: Number(e.target.value) })}
                    />
                  </label>
                </div>
                <div className="admin-settings-card">
                  <header>
                    <h2>Figura de cada pestaña</h2>
                    <p>Elige una animación distinta para cada cabecera, o déjala sin figura.</p>
                  </header>
                  <div className="admin-chapter-selects">
                    {chapters.map((page) => (
                      <label key={page.key}>
                        {page.label}
                        <select
                          aria-label={`Figura de ${page.label}`}
                          value={settings.chapters[page.key]}
                          onChange={(e) => update('chapters', { [page.key]: e.target.value })}
                        >
                          {effects.map((effect) => (
                            <option key={effect.value} value={effect.value}>
                              {effect.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </fieldset>
          {active !== 'fotos' && (
            <div className="admin-save-bar">
              <span>
                {dirty
                  ? 'Tus cambios aún no se han publicado.'
                  : 'Puedes editar los campos y revisar la vista previa.'}
              </span>
              <div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!dirty || saving}
                  onClick={() => {
                    setSettings(JSON.parse(snapshot));
                    setSuccess('');
                    setError('');
                  }}
                >
                  Descartar cambios
                </Button>
                <Button
                  type="button"
                  onClick={save}
                  disabled={!canEdit || !ready || loading || saving || !dirty}
                >
                  <Save size={16} />
                  {saving ? 'Guardando…' : 'Guardar cambios'}
                </Button>
              </div>
            </div>
          )}
        </div>
        {active !== 'fotos' && (
          <aside className="admin-preview">
            <div className="admin-preview-label">
              <span>VISTA PREVIA DEL BORRADOR</span>
              <span>Inicio</span>
            </div>
            <div
              className="admin-preview-site"
              style={{ background: previewColors.deep, color: '#f5f7f3' }}
            >
              <div className="preview-top">
                <img src="/logos/dsc-mark.svg" alt="Logo DSC" />
                <span>
                  INGENIERÍA EN SISTEMAS
                  <br />
                  COMPUTACIONALES
                </span>
              </div>
              <div className="preview-art" style={{ color: previewColors.signal }}>
                <Layers size={64} strokeWidth={0.6} />
                <i
                  style={{
                    borderColor: previewColors.signal,
                    animationPlayState: settings.motion.enabled ? 'running' : 'paused',
                  }}
                />
              </div>
              <h2>
                {settings.home.title}
                <br />
                <span style={{ color: previewColors.primary }}>{settings.home.highlight}</span>
              </h2>
              <p>{settings.home.description}</p>
              <span
                className="preview-button"
                style={{
                  background: previewColors.primary,
                  color: readableTextColor(previewColors.primary),
                }}
              >
                {settings.home.button}
                <ExternalLink size={12} />
              </span>
            </div>
            <p className="admin-help">
              Esta muestra refleja los textos y colores del borrador. Guarda para aplicarlos al
              sitio.
            </p>
            <div className="admin-preview-hint">
              <Sparkles size={17} />
              <p>
                {settings.motion.enabled ? 'Animaciones activadas' : 'Animaciones desactivadas'}
                <span>
                  Inicio: {settings.home.interval} s · Historia: {settings.timeline.interval} s
                </span>
              </p>
            </div>
          </aside>
        )}
      </div>
      <ConfirmDialog
        open={blocker.state === 'blocked'}
        onOpenChange={(value) => {
          if (!value && blocker.state === 'blocked') blocker.reset();
        }}
        title="Tienes cambios sin guardar"
        description="Si sales de esta sección se perderán los ajustes que no has guardado."
        confirmLabel="Salir sin guardar"
        destructive={false}
        onConfirm={() => {
          if (blocker.state === 'blocked') blocker.proceed();
        }}
      />
    </div>
  );
}
