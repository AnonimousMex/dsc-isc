const legacySources = new Set([
  'https://dsc.itmorelia.edu.mx/',
  'https://dsc.itmorelia.edu.mx/reticulas.php',
  'https://dsc.itmorelia.edu.mx/oferta_educativa.php',
  'https://dsc.itmorelia.edu.mx/web/documentos/reticula_isc.pdf',
]);

type AcademicFields = {
  academicSourceUrl: string | null;
  credits: number | null;
  theoryHours: number | null;
  practicalHours: number | null;
};

/** Complete missing data and replace only the old, shared institutional source. */
export function academicImportPatch(
  current: AcademicFields,
  source: AcademicFields,
): Partial<AcademicFields> {
  const patch: Partial<AcademicFields> = {};
  if (!current.academicSourceUrl || legacySources.has(current.academicSourceUrl))
    patch.academicSourceUrl = source.academicSourceUrl;
  for (const field of ['credits', 'theoryHours', 'practicalHours'] as const)
    if (current[field] == null) patch[field] = source[field];
  return patch;
}
