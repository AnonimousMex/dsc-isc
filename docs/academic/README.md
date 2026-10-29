# Información académica de ISC

Fuente: https://dsc.itmorelia.edu.mx/oferta_educativa.php y su retícula oficial enlazada.

Se descargó el PDF original sin modificarlo a `apps/web/public/documents/isc/reticula-isc.pdf`. El JSON adjunto registra su SHA-256 y las horas teóricas, prácticas y créditos de 46 materias: 210 créditos de estructura genérica. La retícula distingue además especialidad (25), residencia (10), servicio social (10) y actividades complementarias (5), para un total de 260.

El documento no confirma profesores, prerrequisitos ni temarios individuales. No se generan estos datos. Las relaciones anteriores quedan pendientes de revisión hasta que la coordinación marque su verificación en el administrador.

Importación conservadora, desde `apps/api`:

```
npx tsx prisma/importIscAcademicDetails.ts
npx tsx prisma/importIscAcademicDetails.ts --apply
```

El primer comando solo revisa. El segundo completa campos vacíos y vincula el PDF si no hay uno asignado; conserva profesores, relaciones, objetivos, semestres y documentos existentes. Detiene la operación ante conflictos y crea un respaldo de los valores anteriores en `/private/tmp`.

## Programas individuales y especialidades (29 de octubre de 2026)

`portal-curricula.json` contiene 46 programas de materias genéricas y 16 de las tres especialidades. Los enlaces se extrajeron de los mapas de imagen de [Retículas y Especialidades](https://dsc.itmorelia.edu.mx/reticulas.php); la captura HTML y las tres imágenes originales se conservan en este directorio. Se descargaron los 62 documentos: todos respondieron HTTP 200 y contienen una cabecera PDF válida. El manifiesto registra el SHA-256 de cada documento descargado.

Las retículas de especialidad usan las mismas tarjetas, selector de semestre y ficha de materia que la carrera. Las asignaturas tienen una relación explícita con la especialidad, por lo que no se mezclan con la retícula genérica. Las tres opciones del semestre nueve de Tecnologías en la Nube se marcan como optativas.

La imagen de Software repite la clave SAF1901 para dos materias; el programa de Inteligencia de Negocios no asigna clave. Se usa `LIS-BI` como identificador interno provisional, editable en el administrador, sin inventar una clave oficial. Además, la imagen de Software indica 3-2-5, mientras sus programas individuales indican 2-3-5: se prioriza el programa individual. Estas discrepancias quedan registradas en el manifiesto para revisión académica.

Aplicar la migración y revisar/importar desde la raíz del repositorio:

```sh
npm exec -w apps/api -- prisma migrate deploy
npm run academic:import -w apps/api
npm run academic:import -w apps/api -- --apply
```

No ejecutar el seed para actualizar una base existente. La importación completa únicamente los campos académicos vacíos y reemplaza las fuentes generales antiguas por el programa individual. Conserva los enlaces personalizados, PDF cargados, nombres, semestres, objetivos, docentes y prerrequisitos de registros existentes. Crea las materias ausentes y vincula las imágenes oficiales a las especialidades sin reemplazar retículas personalizadas. La transacción usa aislamiento serializable y guarda un respaldo JSON de los registros previos en el directorio temporal del sistema antes de escribir. Repetir el comando no duplica materias ni reemplaza ediciones administrativas.

En **Materias y retícula**, el administrador selecciona la especialidad (o carrera), semestre y condición de optativa. Puede modificar el enlace al programa individual o subir un PDF. **Consultar fuente académica** abre primero el documento seleccionado; si no hay documento, abre el enlace. En **Especialidades**, puede cambiar el enlace de la retícula oficial o cargar su PDF. No se puede borrar una especialidad que todavía tenga materias asignadas.

Verificación sin modificar una base real:

```sh
npm test
npx playwright test --config tests/academic-ui/playwright.config.ts
```
