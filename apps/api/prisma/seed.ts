import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { ISC_PREREQUISITES, ISC_SUBJECTS } from './data/iscReticula2017.js';
import { DSC_TEACHERS, slugifyName } from './data/teachersDsc.js';

const prisma = new PrismaClient();

/**
 * Todas las URLs de stock de esta sección fueron verificadas con
 * `curl -I` antes de usarse (deben responder 200 y content-type image/*).
 * Nunca se usa un servicio de "imagen aleatoria" (p. ej. el antiguo
 * source.unsplash.com, deprecado desde 2024): siempre enlaces directos y
 * estables a una foto específica de la CDN de Unsplash. Ver DECISIONES.md
 * para el registro de qué es contenido de relleno pendiente de reemplazo.
 */
const STOCK = {
  heroRedes: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1400&q=80&auto=format&fit=crop',
  heroDataCenter: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1400&q=80&auto=format&fit=crop',
  heroCodigo: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=1400&q=80&auto=format&fit=crop',
  nosotrosApoyo: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80&auto=format&fit=crop',
  // Nota (Fase 2): la URL original del documento de producto para esta imagen
  // (photo-1523050854058-8df90110c9f1) devolvía 404 al verificarla; se
  // sustituyó por otra foto de archivo del mismo tema (aula/clase), ver
  // DECISIONES.md.
  ofertaApoyo1: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80&auto=format&fit=crop',
  ofertaApoyo2: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80&auto=format&fit=crop',
  especialidadSoftware: 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=1200&q=80&auto=format&fit=crop',
  especialidadSeguridad: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80&auto=format&fit=crop',
  especialidadNube: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80&auto=format&fit=crop',
  labRedes: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80&auto=format&fit=crop',
  labIngSoftware: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80&auto=format&fit=crop',
  labTecWeb: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&q=80&auto=format&fit=crop',
  labSeguridad: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=1200&q=80&auto=format&fit=crop',
  noticia1: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80&auto=format&fit=crop',
  noticia2: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&q=80&auto=format&fit=crop',
} as const;

async function externalImage(url: string, alt: string) {
  return prisma.mediaAsset.create({
    data: { kind: 'IMAGE', sourceType: 'EXTERNAL', path: url, alt },
  });
}

async function main() {
  console.log('[seed] limpiando datos existentes...');
  await prisma.refreshToken.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.teacherSubject.deleteMany();
  await prisma.subjectPrerequisite.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.labImage.deleteMany();
  await prisma.lab.deleteMany();
  await prisma.specialty.deleteMany();
  await prisma.document.deleteMany();
  await prisma.news.deleteMany();
  await prisma.communitySection.deleteMany();
  await prisma.heroSlide.deleteMany();
  await prisma.timelineEvent.deleteMany();
  await prisma.program.deleteMany();
  await prisma.siteConfig.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.user.deleteMany();

  console.log('[seed] creando media de relleno (stock, sourceType EXTERNAL)...');
  const media = {
    heroRedes: await externalImage(STOCK.heroRedes, 'Rack de red en un laboratorio universitario'),
    heroDataCenter: await externalImage(STOCK.heroDataCenter, 'Pasillo de un centro de datos con servidores'),
    heroCodigo: await externalImage(STOCK.heroCodigo, 'Código fuente desplegado en un monitor'),
    nosotrosApoyo: await externalImage(STOCK.nosotrosApoyo, 'Edificio de arquitectura institucional'),
    ofertaApoyo1: await externalImage(STOCK.ofertaApoyo1, 'Estudiantes en una clase de ingeniería'),
    ofertaApoyo2: await externalImage(STOCK.ofertaApoyo2, 'Persona programando en una laptop'),
    especialidadSoftware: await externalImage(STOCK.especialidadSoftware, 'Desarrollo de una aplicación móvil'),
    especialidadSeguridad: await externalImage(STOCK.especialidadSeguridad, 'Panel de monitoreo de seguridad informática'),
    especialidadNube: await externalImage(STOCK.especialidadNube, 'Infraestructura de servidores en la nube'),
    labRedes: await externalImage(STOCK.labRedes, 'Equipo de redes en un laboratorio'),
    labIngSoftware: await externalImage(STOCK.labIngSoftware, 'Estudiantes trabajando en computadoras'),
    labTecWeb: await externalImage(STOCK.labTecWeb, 'Pantalla mostrando código de una página web'),
    labSeguridad: await externalImage(STOCK.labSeguridad, 'Terminal con líneas de comando de seguridad'),
    noticia1: await externalImage(STOCK.noticia1, 'Grupo de estudiantes colaborando'),
    noticia2: await externalImage(STOCK.noticia2, 'Evento académico en un auditorio'),
  };

  console.log('[seed] hero slides...');
  await prisma.heroSlide.createMany({
    data: [
      { order: 0, mediaId: media.heroRedes.id, captionCode: '01 · LAB. DE REDES', isActive: true },
      { order: 1, mediaId: media.heroDataCenter.id, captionCode: '02 · INFRAESTRUCTURA', isActive: true },
      { order: 2, mediaId: media.heroCodigo.id, captionCode: '03 · INGENIERÍA DE SOFTWARE', isActive: true },
    ],
  });

  console.log('[seed] timeline...');
  await prisma.timelineEvent.createMany({
    data: [
      {
        year: '1988',
        title: 'Nace Ingeniería en Sistemas Computacionales',
        description:
          'El Instituto Tecnológico de Morelia abre la carrera de ISC para formar ingenieros capaces de diseñar y construir sistemas de software e infraestructura de cómputo.',
        order: 0,
        isActive: true,
      },
      {
        year: '1992',
        title: 'Nace el Departamento y la Licenciatura en Informática',
        description:
          'Se constituye formalmente el Departamento de Sistemas y Computación, y arranca la Licenciatura en Informática como segunda oferta educativa del departamento.',
        order: 1,
        isActive: true,
      },
      {
        year: '2018',
        title: 'ISC cumple 30 años; Depto. e Informática, 26',
        description:
          'El departamento consolida tres especialidades de posgrado y una comunidad de egresados con presencia en la industria de software y telecomunicaciones.',
        order: 2,
        isActive: true,
      },
      {
        year: 'Hoy',
        title: 'Una comunidad de egresados en constante crecimiento',
        description:
          'Egresados del departamento colaboran en empresas de tecnología dentro y fuera del país, y una nueva generación de estudiantes continúa la tradición.',
        order: 3,
        isActive: true,
      },
    ],
  });

  console.log('[seed] programa ISC...');
  const graduateProfile = [
    'Diseña, desarrolla y mantiene sistemas de software siguiendo buenas prácticas de ingeniería.',
    'Aplica metodologías de gestión de proyectos para planear y ejecutar soluciones tecnológicas.',
    'Analiza, diseña e implementa bases de datos y sistemas de información.',
    'Diseña, instala y administra redes e infraestructura de cómputo.',
    'Aplica principios de seguridad informática en el diseño de sistemas y redes.',
    'Desarrolla soluciones de inteligencia artificial y análisis de datos.',
    'Trabaja de forma colaborativa en equipos multidisciplinarios de desarrollo.',
    'Actúa con ética profesional y responsabilidad social en el ejercicio de la ingeniería.',
    'Se actualiza de forma continua ante la evolución de las tecnologías de la información.',
  ];
  const isc = await prisma.program.create({
    data: {
      slug: 'isc',
      name: 'Ingeniería en Sistemas Computacionales',
      mission:
        'Formar ingenieros en sistemas computacionales con sólidos fundamentos científicos y tecnológicos, capaces de diseñar, desarrollar e implementar soluciones de software e infraestructura de cómputo que atiendan necesidades reales del entorno.',
      vision:
        'Ser un programa educativo reconocido por la calidad de sus egresados y su capacidad de adaptación a las tecnologías emergentes de la industria del software.',
      goals:
        'Consolidar una formación integral que combine fundamentos teóricos, práctica de laboratorio y vinculación con la industria, promoviendo la actualización constante del plan de estudios.',
      admissionProfile:
        'Aspirantes con habilidad para el razonamiento lógico-matemático, interés en la tecnología y disposición para el trabajo autónomo y en equipo.',
      graduateProfile: JSON.stringify(graduateProfile),
      actionField:
        'Desarrollo de software, administración de infraestructura de TI, seguridad informática, ciencia de datos, consultoría tecnológica e investigación aplicada.',
      videoUrl: null,
      reticulaImageId: null,
      reticulaPdfId: null,
    },
  });

  console.log('[seed] materias y prerrequisitos (retícula oficial ISC Plan 2017)...');
  const subjectsByCode = new Map<string, { id: string }>();
  for (const def of ISC_SUBJECTS) {
    const subject = await prisma.subject.create({
      data: { ...def, programId: isc.id },
    });
    subjectsByCode.set(def.code, subject);
  }

  for (const [code, prereqCode] of ISC_PREREQUISITES) {
    const subject = subjectsByCode.get(code)!;
    const prerequisite = subjectsByCode.get(prereqCode)!;
    await prisma.subjectPrerequisite.create({
      data: { subjectId: subject.id, prerequisiteId: prerequisite.id },
    });
  }

  console.log('[seed] laboratorios...');
  const labs = [
    {
      slug: 'seguridad-informatica',
      name: 'Laboratorio de Seguridad Informática',
      description:
        'Espacio dedicado a la práctica de análisis de vulnerabilidades, hardening de sistemas y respuesta a incidentes en un entorno controlado.',
      equipment: [
        { label: '20x', value: 'Estaciones con doble arranque Linux/Windows' },
        { label: '1x', value: 'Firewall de laboratorio para prácticas de red' },
        { label: '1x', value: 'Switch administrable para segmentación de VLANs' },
      ],
      relatedSubjects: ['Seguridad Informática', 'Redes de Computadoras'],
      media: media.labSeguridad,
    },
    {
      slug: 'ingenieria-de-software',
      name: 'Laboratorio de Ingeniería de Software',
      description:
        'Sala de trabajo colaborativo equipada para prácticas de desarrollo en equipo, control de versiones y metodologías ágiles.',
      equipment: [
        { label: '24x', value: 'Estaciones de desarrollo' },
        { label: '1x', value: 'Pizarrón para dinámicas ágiles (Scrum/Kanban)' },
        { label: '2x', value: 'Pantallas para revisión de código en equipo' },
      ],
      relatedSubjects: ['Ingeniería de Software', 'Estructuras de Datos'],
      media: media.labIngSoftware,
    },
    {
      slug: 'tecnologias-web',
      name: 'Laboratorio de Tecnologías Web',
      description:
        'Laboratorio orientado al desarrollo de aplicaciones web modernas, del lado del cliente y del servidor.',
      equipment: [
        { label: '20x', value: 'Estaciones con entorno de desarrollo web' },
        { label: '1x', value: 'Servidor local para despliegue de prácticas' },
      ],
      relatedSubjects: ['Desarrollo Web', 'Bases de Datos'],
      media: media.labTecWeb,
    },
    {
      slug: 'redes',
      name: 'Laboratorio de Redes',
      description:
        'Espacio equipado con hardware real de red para el diseño, cableado y configuración de infraestructura de comunicaciones.',
      equipment: [
        { label: '24x', value: 'Puertos gigabit en switches administrables' },
        { label: '6x', value: 'Routers para prácticas de enrutamiento' },
        { label: '1x', value: 'Rack de telecomunicaciones' },
      ],
      relatedSubjects: ['Redes de Computadoras', 'Seguridad Informática'],
      media: media.labRedes,
    },
  ];

  for (const lab of labs) {
    const created = await prisma.lab.create({
      data: {
        slug: lab.slug,
        name: lab.name,
        description: lab.description,
        equipment: JSON.stringify(lab.equipment),
        relatedSubjects: JSON.stringify(lab.relatedSubjects),
      },
    });
    await prisma.labImage.create({
      data: { labId: created.id, mediaId: lab.media.id, order: 0 },
    });
  }

  console.log('[seed] especialidades...');
  await prisma.specialty.createMany({
    data: [
      {
        slug: 'ingenieria-de-software-y-apps-moviles',
        name: 'Ingeniería de Software y Aplicaciones Móviles',
        description:
          'Especialidad orientada al diseño y desarrollo de software a gran escala y aplicaciones para dispositivos móviles.',
        imageId: media.especialidadSoftware.id,
      },
      {
        slug: 'seguridad-de-infraestructura-y-servicios',
        name: 'Seguridad de Infraestructura y Servicios',
        description:
          'Especialidad enfocada en la protección de redes, sistemas y servicios frente a amenazas de seguridad informática.',
        imageId: media.especialidadSeguridad.id,
      },
      {
        slug: 'tecnologias-en-la-nube',
        name: 'Tecnologías en la Nube',
        description:
          'Especialidad centrada en el diseño, despliegue y administración de soluciones sobre infraestructura en la nube.',
        imageId: media.especialidadNube.id,
      },
    ],
  });

  console.log('[seed] misión/visión/valores del departamento (SiteConfig)...');
  await prisma.siteConfig.createMany({
    data: [
      {
        key: 'nosotros.mision',
        value: JSON.stringify(
          'Formar profesionales en sistemas computacionales e informática con una base científica sólida y una fuerte orientación práctica, capaces de responder con ética y creatividad a las necesidades tecnológicas de su entorno.',
        ),
      },
      {
        key: 'nosotros.vision',
        value: JSON.stringify(
          'Ser un departamento de referencia en la formación de ingenieros en sistemas computacionales, reconocido por la calidad de sus egresados y su vínculo permanente con la industria y la investigación aplicada.',
        ),
      },
      {
        key: 'nosotros.valores',
        value: JSON.stringify([
          'Rigor técnico',
          'Ética profesional',
          'Trabajo colaborativo',
          'Actualización constante',
          'Vinculación con la comunidad',
        ]),
      },
    ],
  });

  console.log('[seed] docentes (plantilla real del DSC, ver prisma/data/teachersDsc.ts)...');
  for (const fullName of DSC_TEACHERS) {
    await prisma.teacher.create({
      data: {
        slug: slugifyName(fullName),
        fullName,
        title: 'Docente',
        bio: '',
        experience: '',
        photoId: null,
        youtubeUrl: null,
        email: null,
        website: null,
        linkedin: null,
        facebook: null,
        twitter: null,
        isActive: true,
      },
    });
  }

  console.log('[seed] noticias de ejemplo...');
  await prisma.news.createMany({
    data: [
      {
        slug: 'bienvenida-nuevo-ciclo',
        title: 'Bienvenida al nuevo ciclo escolar',
        excerpt: 'El departamento da la bienvenida a la comunidad estudiantil que se integra este semestre.',
        body: '<p>Contenido de ejemplo. Este artículo se reemplaza desde el sistema con información real del departamento.</p>',
        coverImageId: media.noticia1.id,
        publishedAt: new Date(),
        isPublished: true,
      },
      {
        slug: 'estudiantes-en-evento-academico',
        title: 'Estudiantes participan en evento académico',
        excerpt: 'Un grupo de estudiantes representó al departamento en un evento de la comunidad tecnológica.',
        body: '<p>Contenido de ejemplo. Este artículo se reemplaza desde el sistema con información real del departamento.</p>',
        coverImageId: media.noticia2.id,
        publishedAt: new Date(),
        isPublished: true,
      },
    ],
  });

  console.log('[seed] usuario SUPERADMIN inicial...');
  const initialPassword = randomBytes(9).toString('base64url'); // 12 caracteres, alfanumérico + -_
  const passwordHash = await bcrypt.hash(initialPassword, 12);
  await prisma.user.create({
    data: {
      name: 'Administrador DSC',
      email: 'admin@dsc.local',
      passwordHash,
      role: 'SUPERADMIN',
      isActive: true,
      mustChangePassword: true,
    },
  });

  console.log('\n[seed] listo.');
  console.log('----------------------------------------------------');
  console.log('Usuario SUPERADMIN inicial:');
  console.log('  email:    admin@dsc.local');
  console.log(`  password: ${initialPassword}`);
  console.log('  (se pedirá cambiarla en el primer login)');
  console.log('----------------------------------------------------');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
