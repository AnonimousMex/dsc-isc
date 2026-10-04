/**
 * Docentes reales del Departamento de Sistemas y Computación, tomados de
 * https://dsc.itmorelia.edu.mx/docentes.php (solo nombre completo — esa
 * página no publica título, biografía, materias ni contacto de nadie).
 * title/bio/experience quedan en blanco/genérico a propósito: inventar
 * credenciales o materias para personas reales sería publicar información
 * falsa sobre ellas. El departamento debe completar el resto desde el
 * admin (Docentes).
 */
export const DSC_TEACHERS: string[] = [
  'Abel Alberto Pintor Estrada',
  'Adrián Núñez Vieyra',
  'Alejandro Amaro Flores',
  'Anastacio Antolino Hernández',
  'Aurelio Amaury Coria Ramírez',
  'Brenda González Gómez',
  'Ezequiel Pérez Hernández',
  'Felipe Morales López',
  'Fernando Villaseñor Béjar',
  'Gabriela Lúa Vargas',
  'Heberto Ferreira Medina',
  'Hugo Fernando Hernández López',
  'Jesús Eduardo Alcaraz Chávez',
  'Jorge Eduardo Carrión Viramontes',
  'Jorge Mora García',
  'Jorge Sánchez Vega',
  'José Alfredo Jiménez Murillo',
  'J. Guadalupe Ramos Díaz',
  'José Manuel Cuin Jacuinde',
  'José María Zepeda Florián',
  'Juan Carlos Olivares Rojas',
  'Juan Jesús Ruíz Lagunas',
  'Kenia Aline Ayala Robles',
  'Laura Nelly Alvarado Zamora',
  'Manuel Ruíz López',
  'María Yaneth Vega Flores',
  'Miriam Zulma Sánchez Hernández',
  'Mónica Adriana Blancas Martínez',
  'Rocío Contreras Jiménez',
  'Rogelio Ferreira Escutia',
  'Roque Trujillo Ramos',
  'Ruth Vargas Rivera',
  'Salvador Jonathan Villagómez Cárdenas',
];

export function slugifyName(fullName: string): string {
  return fullName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
