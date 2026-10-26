import InteractiveTimeline from '../components/timeline/InteractiveTimeline';
import PageBanner from '../components/shared/PageBanner';
import { ContentStatus, ImageStory } from '../components/shared/Editorial';
import { api, siteConfigValue } from '../lib/apiClient';
import { useApiData } from '../lib/useApiData';

export default function Nosotros() {
  const { data: timeline, loading, error } = useApiData(() => api.timeline(), []);
  const { data: config } = useApiData(() => api.siteConfig(), []);
  const value = <T,>(key: string) => (config ? siteConfigValue<T>(config, key) : undefined);
  return (
    <div className="interior-page about-page">
      <PageBanner
        eyebrow="Conócenos"
        title="Ingeniería en Sistemas Computacionales"
        imageUrl={value<string>('nosotros.heroImageUrl') ?? '/images/desarrollo.jpg'}
        imageAlt="Fotografía editorial de un espacio de programación"
      />
      <section className="page-width timeline-section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">NUESTRA TRAYECTORIA</p>
            <h2>
              Cada etapa,
              <br />
              una nueva conexión.
            </h2>
          </div>
          <p>
            Recorre los momentos que nos definen.
            <br />
            Avanza a tu ritmo o deja que la historia continúe.
          </p>
        </div>
        <ContentStatus
          loading={loading}
          error={error}
          empty={!timeline?.length}
          noun="la historia de la carrera"
        />
        {!!timeline?.length && <InteractiveTimeline events={timeline} />}
      </section>
      <section className="identity-stories page-width">
        <ImageStory
          title="Nuestra misión."
          image={value<string>('nosotros.misionImageUrl') ?? '/images/desarrollo.jpg'}
          alt="Fotografía editorial de herramientas de desarrollo de software"
        >
          <p>
            {value<string>('nosotros.mision') ??
              'La misión de la carrera estará disponible próximamente.'}
          </p>
        </ImageStory>
        <ImageStory
          title="Nuestra visión."
          reverse
          image={value<string>('nosotros.visionImageUrl') ?? '/images/tecnologia.jpg'}
          alt="Fotografía editorial de circuitos y componentes electrónicos"
        >
          <p>
            {value<string>('nosotros.vision') ??
              'La visión de la carrera estará disponible próximamente.'}
          </p>
        </ImageStory>
        <ImageStory
          title="Lo que nos mueve."
          image={value<string>('nosotros.valoresImageUrl') ?? '/images/comunidad.jpg'}
          alt="Fotografía editorial de un equipo trabajando en colaboración"
        >
          <ul className="values-list">
            {(value<string[]>('nosotros.valores') ?? []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {!value<string[]>('nosotros.valores')?.length && (
            <p>Los valores de la carrera estarán disponibles próximamente.</p>
          )}
        </ImageStory>
      </section>
    </div>
  );
}
