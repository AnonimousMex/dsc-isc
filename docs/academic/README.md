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
