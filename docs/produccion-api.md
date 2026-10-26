# Compilar y ejecutar la API con Node

Desde la raíz del repositorio:

```sh
npm ci
npm run prisma:generate -w apps/api
npm run build
npm run start -w apps/api
```

Configura `apps/api/.env` antes del arranque. El comando `start` usa
`apps/api` como directorio de trabajo para cargar ese archivo y resolver
`storage/uploads`. La base de datos y las migraciones se preparan por separado.

`@dsc-isc/shared` exporta JavaScript ESM y declaraciones desde `dist`.
Su script `prepare` lo compila al instalar las dependencias; el `prebuild`
de la API vuelve a compilarlo para evitar artefactos desactualizados.
El build raíz compila primero la API y su dependencia, y luego admin y web.
Node ejecuta `apps/api/dist/server.js` sin necesitar `tsx` ni un loader de TypeScript.

Para verificar el arranque real con Node:

```sh
npm run test:production
```

Esta prueba compila la API, importa las exportaciones públicas del paquete
compartido e inicia el servidor en un puerto temporal. Consulta `/api/health`
y detiene el proceso. Usa configuración de prueba, no carga el `.env` local
ni consulta la base de datos. No sustituye las pruebas con la base de producción.

Durante el desarrollo, si editas `packages/shared/src`, ejecuta en otra terminal:

```sh
npm run dev -w packages/shared
```

Esto mantiene sus archivos compilados actualizados para API, web y admin.
Los directorios `dist` se generan en cada instalación/build y no se suben a Git.
