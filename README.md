# Complyx UI

Interfaz gráfica de **Complyx**, una plataforma de gestión de riesgos y cumplimiento normativo para endpoints Linux y Windows. Permite supervisar el estado de cumplimiento de las políticas de seguridad, gestionar agentes, normativas y riesgos, y generar evidencias para auditorías internas y externas.

> Forma parte del ecosistema Complyx junto con `complyx-api` (backend Spring Boot) y `complyx-agent` (agente Rust para endpoints).

---

## ¿Qué hace esta aplicación?

- **Dashboard** — visión global del cumplimiento, estado de agentes y distribución de riesgos en tiempo real.
- **Agentes** — listado y monitoreo de los endpoints registrados, con detalle de políticas asignadas e historial de ejecuciones.
- **Políticas** — consulta, subida y gestión de políticas de seguridad en formato JSON firmado.
- **Riesgos** — matriz de probabilidad × impacto con detalle de cada riesgo y sus mitigaciones.
- **Normativas** — gestión de marcos regulatorios (ISO 27001, NIST CSF, GDPR…) y descarga de PDFs asociados.
- **Eventos y logs** — registro de actividad del sistema con filtros por tipo y severidad, exportable en CSV y PDF.
- **Reportes** — generación de informes de cumplimiento por agente, normativa o riesgo.
- **Usuarios** — administración de cuentas y roles _(solo Administrador)_.

El acceso a cada sección está controlado por roles: **Administrador**, **Técnico** y **Auditor**.

---

## Stack tecnológico

| Tecnología     | Versión | Uso                                           |
| -------------- | ------- | --------------------------------------------- |
| Angular        | 19+     | Framework principal (componentes standalone)  |
| TypeScript     | 5.x     | Lenguaje de desarrollo                        |
| SCSS           | —       | Estilos por componente                        |
| Electron       | 33+     | Empaquetado como aplicación de escritorio PWA |
| RxJS           | 7.x     | Gestión de streams y llamadas asíncronas      |
| Angular Router | —       | Navegación con lazy loading y guards          |

---

## Requisitos previos

- Node.js **22 LTS** (evitar versiones odd como la 25)
- npm 10+ o pnpm 9+
- Angular CLI 19+: `npm install -g @angular/cli`
- La API `complyx-api` corriendo en local o accesible en red

---

## Inicio rápido

```bash
git clone <repo-url> complyx-ui
cd complyx-ui
npm install
npm start          # Angular dev server en http://localhost:4200
```

Configura la URL de la API en `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
};
```

---

## Scripts disponibles

| Comando                  | Descripción                           |
| ------------------------ | ------------------------------------- |
| `npm start`              | Servidor de desarrollo con hot reload |
| `npm run build`          | Build de producción en `dist/`        |
| `npm run build:electron` | Build + empaquetado Electron          |
| `npm test`               | Tests unitarios con Karma/Jasmine     |
| `npm run lint`           | Análisis estático con ESLint          |

---

## Usuarios de prueba (API local)

| Usuario           | Contraseña        | Rol               |
| ----------------- | ----------------- | ----------------- |
| `admin`           | `admin`           | Administrador     |
| `tecnico`         | `tecnico`         | Técnico           |
| `auditor`         | `auditor`         | Auditor           |
| `tecnico_auditor` | `tecnico_auditor` | Técnico + Auditor |

---

## Módulos del ecosistema Complyx

| Repositorio      | Tecnología         | Descripción                               |
| ---------------- | ------------------ | ----------------------------------------- |
| `complyx-ui`     | Angular + Electron | Este repositorio — interfaz gráfica       |
| `complyx-api`    | Java + Spring Boot | API REST, autenticación JWT, persistencia |
| `complyx-agent`  | Rust               | Agente para endpoints Linux/Windows       |
| `complyx-server` | Rust               | Servidor de orquestación de agentes       |

---

## Licencia

# Proyecto académico intermodular — @Styxiner, @KarlaBasurto. Todos los derechos reservados

> > > > > > > 52d39ed (project scaffold)

Interfaz gráfica de **Complyx**, una plataforma de gestión de riesgos y cumplimiento normativo para endpoints Linux y Windows. Permite supervisar el estado de cumplimiento de las políticas de seguridad, gestionar agentes, normativas y riesgos, y generar evidencias para auditorías internas y externas.

> Forma parte del ecosistema Complyx junto con `complyx-api` (backend Spring Boot) y `complyx-server` (orquestador de agentes Rust para endpoints y distribuidor de políticas).

---

## ¿Qué hace esta aplicación?

- **Dashboard** — visión global del cumplimiento, estado de agentes y distribución de riesgos en tiempo real.
- **Agentes** — listado y monitoreo de los endpoints registrados, con detalle de políticas asignadas e historial de ejecuciones.
- **Políticas** — consulta, subida y gestión de políticas de seguridad en formato JSON firmado.
- **Riesgos** — matriz de probabilidad × impacto con detalle de cada riesgo y sus mitigaciones.
- **Normativas** — gestión de marcos regulatorios (ISO 27001, NIST CSF, GDPR…) y descarga de PDFs asociados.
- **Eventos y logs** — registro de actividad del sistema con filtros por tipo y severidad, exportable en CSV y PDF.
- **Reportes** — generación de informes de cumplimiento por agente, normativa o riesgo.
- **Usuarios** — administración de cuentas y roles _(solo Administrador)_.

El acceso a cada sección está controlado por roles: **admin**, **tecnico** y **auditor**.

---

## Stack tecnológico

| Tecnología     | Versión | Uso                                           |
| -------------- | ------- | --------------------------------------------- |
| Angular        | 19+     | Framework principal (componentes standalone)  |
| TypeScript     | 5.x     | Lenguaje de desarrollo                        |
| SCSS           | —       | Estilos por componente                        |
| Electron       | 33+     | Empaquetado como aplicación de escritorio PWA |
| RxJS           | 7.x     | Gestión de streams y llamadas asíncronas      |
| Angular Router | —       | Navegación con lazy loading y guards          |

---

## Requisitos previos

- Node.js **22 LTS** (evitar versiones odd como la 25)
- npm 10+ o pnpm 9+
- Angular CLI 19+: `npm install -g @angular/cli`
- La API `complyx-api` corriendo en local o accesible en red

---

## Inicio rápido

```bash
git clone <repo-url> complyx-ui
cd complyx-ui
npm install
npm start          # Angular dev server en http://localhost:4200
```

Configura la URL de la API en `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
};
```

---

## Scripts disponibles

| Comando                  | Descripción                           |
| ------------------------ | ------------------------------------- |
| `npm start`              | Servidor de desarrollo con hot reload |
| `npm run build`          | Build de producción en `dist/`        |
| `npm run build:electron` | Build + empaquetado Electron          |
| `npm test`               | Tests unitarios con Karma/Jasmine     |
| `npm run lint`           | Análisis estático con ESLint          |

---

## Usuarios de prueba (API local)

| Usuario           | Contraseña        | Rol               |
| ----------------- | ----------------- | ----------------- |
| `admin`           | `admin`           | Administrador     |
| `tecnico`         | `tecnico`         | Técnico           |
| `auditor`         | `auditor`         | Auditor           |
| `tecnico_auditor` | `tecnico_auditor` | Técnico + Auditor |

---

## Módulos del ecosistema Complyx

| Repositorio      | Tecnología         | Descripción                               |
| ---------------- | ------------------ | ----------------------------------------- |
| `complyx-ui`     | Angular + Electron | Este repositorio — interfaz gráfica       |
| `complyx-api`    | Java + Spring Boot | API REST, autenticación JWT, persistencia |
| `complyx-agent`  | Rust               | Agente para endpoints Linux/-Windows-     |
| `complyx-server` | Rust               | Servidor de orquestación de agentes       |

---

## Licencia

Proyecto académico intermodular — @Styxiner, @KarlaBasurto. Todos los derechos reservados.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
