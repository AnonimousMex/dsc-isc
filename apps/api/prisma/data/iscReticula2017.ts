/**
 * Retícula oficial de Ingeniería en Sistemas Computacionales, Plan 2017
 * (ISIC-2010-224). Transcrita de la imagen del plan de estudios provista
 * por el departamento. Los 5 bloques "ESPECIALIDAD" (electivas según la
 * especialidad de posgrado elegida) y "Residencia Profesional"/"Servicio
 * Social" son requisitos de titulación, no materias fijas — no tienen
 * dónde encajar en el modelo Subject y se omiten a propósito.
 *
 * Los prerrequisitos son la reconstrucción más defendible a partir de la
 * imagen (continuidad de tema entre semestres, ej. Fundamentos de
 * Programación → POO → Estructura de Datos), no una transcripción exacta
 * de cada flecha — revísalos en el admin (Materias y retícula) contra el
 * documento oficial si tienes uno más confiable que la imagen.
 */
export interface ReticulaSubject {
  code: string;
  name: string;
  semester: number;
  objective: string;
}

export const ISC_PROGRAM_SLUG = 'isc';

export const ISC_SUBJECTS: ReticulaSubject[] = [
  // Semestre 1
  { code: 'ACF-0901', name: 'Cálculo Diferencial', semester: 1, objective: 'Aplicar el concepto de límite, continuidad y derivada al análisis y modelado de funciones de una variable.' },
  { code: 'AED-1285', name: 'Fundamentos de Programación', semester: 1, objective: 'Introducir los principios de la programación estructurada y la resolución algorítmica de problemas.' },
  { code: 'ACA-0907', name: 'Taller de Ética', semester: 1, objective: 'Analizar dilemas éticos del ejercicio profesional de la ingeniería y su impacto social.' },
  { code: 'AEF-1041', name: 'Matemáticas Discretas', semester: 1, objective: 'Dotar de las herramientas de lógica, conjuntos y combinatoria base para el análisis de algoritmos.' },
  { code: 'SCH-1024', name: 'Taller de Administración', semester: 1, objective: 'Introducir los procesos básicos de planeación, organización y control en una organización.' },
  { code: 'ACC-0906', name: 'Fundamentos de Investigación', semester: 1, objective: 'Desarrollar habilidades de investigación documental y metodológica aplicadas a la ingeniería.' },

  // Semestre 2
  { code: 'ACF-0902', name: 'Cálculo Integral', semester: 2, objective: 'Aplicar técnicas de integración al cálculo de áreas, volúmenes y otros modelos de una variable.' },
  { code: 'AED-1286', name: 'Programación Orientada a Objetos', semester: 2, objective: 'Diseñar e implementar soluciones de software aplicando los principios de la programación orientada a objetos.' },
  { code: 'AEC-1008', name: 'Contabilidad Financiera', semester: 2, objective: 'Interpretar estados financieros básicos para la toma de decisiones en proyectos tecnológicos.' },
  { code: 'AEC-1058', name: 'Química', semester: 2, objective: 'Comprender los principios básicos de la química aplicados a materiales y dispositivos electrónicos.' },
  { code: 'ACF-0903', name: 'Álgebra Lineal', semester: 2, objective: 'Aplicar matrices, vectores y transformaciones lineales a problemas de ingeniería y ciencia de datos.' },
  { code: 'AEF-1052', name: 'Probabilidad y Estadística', semester: 2, objective: 'Aplicar técnicas de probabilidad y estadística descriptiva/inferencial al análisis de datos.' },

  // Semestre 3
  { code: 'ACF-0904', name: 'Cálculo Vectorial', semester: 3, objective: 'Extender los conceptos de cálculo diferencial e integral a funciones de varias variables.' },
  { code: 'AED-1026', name: 'Estructura de Datos', semester: 3, objective: 'Diseñar e implementar estructuras de datos eficientes para la solución de problemas computacionales.' },
  { code: 'SCC-1005', name: 'Cultura Empresarial', semester: 3, objective: 'Analizar el entorno empresarial y el rol del ingeniero dentro de una organización.' },
  { code: 'ACD-0908', name: 'Desarrollo Sustentable', semester: 3, objective: 'Analizar el impacto ambiental de los proyectos de ingeniería y estrategias de desarrollo sustentable.' },
  { code: 'SCC-1013', name: 'Investigación de Operaciones', semester: 3, objective: 'Aplicar modelos matemáticos de optimización a la toma de decisiones.' },
  { code: 'SCF-1006', name: 'Física General', semester: 3, objective: 'Aplicar los principios de la mecánica y la física general al análisis de sistemas de ingeniería.' },

  // Semestre 4
  { code: 'ACF-0905', name: 'Ecuaciones Diferenciales', semester: 4, objective: 'Modelar y resolver ecuaciones diferenciales ordinarias aplicadas a sistemas de ingeniería.' },
  { code: 'SCC-1017', name: 'Métodos Numéricos', semester: 4, objective: 'Aplicar métodos numéricos para la solución aproximada de problemas matemáticos mediante software.' },
  { code: 'SCD-1027', name: 'Tópicos Avanzados de Programación', semester: 4, objective: 'Profundizar en técnicas avanzadas de programación y buenas prácticas de desarrollo.' },
  { code: 'AEF-1031', name: 'Fundamentos de Base de Datos', semester: 4, objective: 'Modelar y diseñar bases de datos relacionales para sistemas de información.' },
  { code: 'SCD-1022', name: 'Simulación', semester: 4, objective: 'Diseñar modelos de simulación para el análisis del comportamiento de sistemas complejos.' },
  { code: 'SCD-1018', name: 'Principios Eléctricos y Aplicaciones Digitales', semester: 4, objective: 'Comprender los fundamentos de circuitos eléctricos y lógica digital aplicados a la computación.' },

  // Semestre 5
  { code: 'SCC-1010', name: 'Graficación', semester: 5, objective: 'Aplicar algoritmos y técnicas de gráficos por computadora en dos y tres dimensiones.' },
  { code: 'AEC-1034', name: 'Fundamentos de Telecomunicaciones', semester: 5, objective: 'Comprender los principios de transmisión de datos y sistemas de telecomunicaciones.' },
  { code: 'AEC-1061', name: 'Sistemas Operativos', semester: 5, objective: 'Comprender los principios de administración de procesos, memoria y archivos de un sistema operativo.' },
  { code: 'SCA-1025', name: 'Taller de Base de Datos', semester: 5, objective: 'Implementar bases de datos relacionales mediante un motor de base de datos real.' },
  { code: 'SCC-1007', name: 'Fundamentos de Ingeniería de Software', semester: 5, objective: 'Introducir los procesos y metodologías del ciclo de vida del desarrollo de software.' },
  { code: 'SCC-1023', name: 'Sistemas Programables', semester: 5, objective: 'Diseñar soluciones basadas en microcontroladores y sistemas embebidos.' },

  // Semestre 6
  { code: 'SCD-1015', name: 'Lenguajes y Autómatas I', semester: 6, objective: 'Aplicar la teoría de lenguajes formales y autómatas al diseño de compiladores.' },
  { code: 'SCD-1021', name: 'Redes de Computadoras', semester: 6, objective: 'Diseñar e implementar redes de datos aplicando el modelo OSI/TCP-IP.' },
  { code: 'SCA-1026', name: 'Taller de Sistemas Operativos', semester: 6, objective: 'Configurar y administrar sistemas operativos en escenarios prácticos de laboratorio.' },
  { code: 'SCB-1001', name: 'Administración de Base de Datos', semester: 6, objective: 'Administrar, respaldar y optimizar el desempeño de motores de bases de datos.' },
  { code: 'SCD-1011', name: 'Ingeniería de Software', semester: 6, objective: 'Aplicar metodologías de desarrollo para planear, construir y mantener sistemas de software.' },
  { code: 'AEB-1055', name: 'Programación Web', semester: 6, objective: 'Diseñar y construir aplicaciones web completas del lado del cliente y del servidor.' },

  // Semestre 7
  { code: 'SCD-1016', name: 'Lenguajes Autómatas II', semester: 7, objective: 'Profundizar en el diseño e implementación de compiladores e intérpretes.' },
  { code: 'SCD-1004', name: 'Conmutación y Enrutamiento en Redes de Datos', semester: 7, objective: 'Configurar equipo de conmutación y enrutamiento para redes de datos empresariales.' },
  { code: 'ACA-0909', name: 'Taller de Investigación I', semester: 7, objective: 'Desarrollar la primera etapa de un protocolo de investigación aplicada a la ingeniería.' },
  { code: 'SCG-1009', name: 'Gestión de Proyectos de Software', semester: 7, objective: 'Planear, ejecutar y controlar proyectos de desarrollo de software aplicando estándares de gestión.' },
  { code: 'SCD-1003', name: 'Arquitectura de Computadoras', semester: 7, objective: 'Comprender la organización interna de un sistema de cómputo y su relación con el software.' },

  // Semestre 8
  { code: 'SCC-1019', name: 'Programación Lógica y Funcional', semester: 8, objective: 'Aplicar los paradigmas de programación lógica y funcional a la solución de problemas.' },
  { code: 'SCA-1002', name: 'Administración de Redes', semester: 8, objective: 'Administrar, monitorear y asegurar la operación de una red de datos empresarial.' },
  { code: 'ACA-0910', name: 'Taller de Investigación II', semester: 8, objective: 'Concluir el protocolo de investigación iniciado en el Taller de Investigación I.' },
  { code: 'SCC-1014', name: 'Lenguajes de Interfaz', semester: 8, objective: 'Diseñar interfaces de comunicación entre software y hardware a bajo nivel.' },

  // Semestre 9
  { code: 'SCC-1012', name: 'Inteligencia Artificial', semester: 9, objective: 'Aplicar técnicas de inteligencia artificial y aprendizaje automático a la solución de problemas.' },
];

/** [código de la materia, código de su prerrequisito] */
export const ISC_PREREQUISITES: Array<[string, string]> = [
  // Programación
  ['AED-1286', 'AED-1285'], // POO requiere Fundamentos de Programación
  ['AED-1026', 'AED-1286'], // Estructura de Datos requiere POO
  ['SCD-1027', 'AED-1026'], // Tópicos Avanzados de Programación requiere Estructura de Datos
  ['AEB-1055', 'AED-1026'], // Programación Web requiere Estructura de Datos
  ['SCD-1015', 'SCD-1027'], // Lenguajes y Autómatas I requiere Tópicos Avanzados de Programación
  ['SCD-1016', 'SCD-1015'], // Lenguajes Autómatas II requiere Lenguajes y Autómatas I
  ['SCC-1019', 'SCD-1016'], // Programación Lógica y Funcional requiere Lenguajes Autómatas II
  ['SCC-1012', 'SCC-1019'], // Inteligencia Artificial requiere Programación Lógica y Funcional

  // Matemáticas
  ['ACF-0902', 'ACF-0901'], // Cálculo Integral requiere Cálculo Diferencial
  ['ACF-0904', 'ACF-0902'], // Cálculo Vectorial requiere Cálculo Integral
  ['ACF-0905', 'ACF-0904'], // Ecuaciones Diferenciales requiere Cálculo Vectorial

  // Bases de datos
  ['AEF-1031', 'AED-1026'], // Fundamentos de Base de Datos requiere Estructura de Datos
  ['SCA-1025', 'AEF-1031'], // Taller de Base de Datos requiere Fundamentos de Base de Datos
  ['SCB-1001', 'SCA-1025'], // Administración de Base de Datos requiere Taller de Base de Datos

  // Redes
  ['SCD-1021', 'AEC-1034'], // Redes de Computadoras requiere Fundamentos de Telecomunicaciones
  ['SCD-1004', 'SCD-1021'], // Conmutación y Enrutamiento requiere Redes de Computadoras
  ['SCA-1002', 'SCD-1004'], // Administración de Redes requiere Conmutación y Enrutamiento

  // Sistemas operativos
  ['SCA-1026', 'AEC-1061'], // Taller de Sistemas Operativos requiere Sistemas Operativos

  // Ingeniería de software
  ['SCD-1011', 'SCC-1007'], // Ingeniería de Software requiere Fundamentos de Ingeniería de Software
  ['SCG-1009', 'SCD-1011'], // Gestión de Proyectos de Software requiere Ingeniería de Software

  // Arquitectura de cómputo
  ['SCC-1014', 'SCD-1003'], // Lenguajes de Interfaz requiere Arquitectura de Computadoras

  // Investigación
  ['ACA-0909', 'ACC-0906'], // Taller de Investigación I requiere Fundamentos de Investigación
  ['ACA-0910', 'ACA-0909'], // Taller de Investigación II requiere Taller de Investigación I
];
