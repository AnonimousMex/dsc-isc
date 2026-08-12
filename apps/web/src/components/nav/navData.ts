export interface NavLink {
  label: string;
  href: string;
  blurb: string;
  external?: boolean;
  comingSoon?: boolean;
}

export interface NavGroup {
  label: string;
  links: NavLink[];
}

/**
 * Estructura del mega-menú (sección 2.2, patrón Harvard): cada categoría
 * trae una frase de apoyo, no solo el link. Reorganiza la navegación
 * original en 3 grupos según el mapa de información de la sección 4 del
 * documento de producto.
 */
export const navGroups: NavGroup[] = [
  {
    label: 'Nosotros',
    links: [
      { label: 'Historia y valores', href: '/nosotros', blurb: 'Quiénes somos, misión, visión y una línea de tiempo del departamento.' },
      { label: 'Oferta educativa', href: '/oferta-educativa/isc', blurb: 'Plan de estudios de Ingeniería en Sistemas Computacionales y su retícula.' },
      { label: 'Docentes', href: '/docentes', blurb: 'El cuerpo académico que imparte las materias del departamento.' },
      { label: 'Laboratorios', href: '/laboratorios', blurb: 'Los espacios de práctica: redes, software, seguridad y tecnologías web.' },
      { label: 'Normateca', href: '/normateca', blurb: 'Reglamentos, formatos y documentos normativos del departamento.' },
      { label: 'Biblioteca digital', href: '#', blurb: 'Acceso a los recursos bibliográficos institucionales.', comingSoon: true },
    ],
  },
  {
    label: 'Comunidad',
    links: [
      { label: 'Comunidad estudiantil', href: '/comunidad', blurb: 'Residencias profesionales, investigación y créditos complementarios.' },
      { label: 'Retículas y especialidades', href: '/especialidades', blurb: 'Las tres especialidades de posgrado que ofrece el departamento.' },
    ],
  },
  {
    label: 'Egresados',
    links: [
      { label: 'Titulación', href: '/egresados', blurb: 'Proceso de titulación y egresados del departamento.' },
      { label: 'Noticias', href: '/noticias', blurb: 'Lo más reciente del departamento y su comunidad.' },
    ],
  },
];
