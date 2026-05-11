# DEVELOPMENT.md — complyx-ui

> Guía técnica para desarrolladores que se incorporan al frontend de Complyx. Explica la arquitectura Angular, las convenciones de código, el flujo de autenticación y cómo conectar con la API.

---

## 1. Requisitos del entorno

| Herramienta | Versión recomendada | Notas                                                          |
| ----------- | ------------------- | -------------------------------------------------------------- |
| Node.js     | **22 LTS**          | Usar versiones LTS (pares). La 25 no es LTS y da advertencias. |
| npm         | 10+                 | Incluido con Node 22                                           |
| Angular CLI | 19+                 | `npm install -g @angular/cli`                                  |
| Editor      | VS Code             | Con las extensiones indicadas abajo                            |

### Extensiones recomendadas para VS Code

- **Angular Language Service** — autocompletado en templates HTML
- **ESLint** — análisis estático en tiempo real
- **Prettier** — formateo automático al guardar
- **GitLens** — historial de cambios inline

### Configuración inicial

```bash
git clone <repo-url> complyx-ui
cd complyx-ui
npm install
```

Copia el entorno de desarrollo y ajusta la URL de la API:

```bash
cp src/environments/environment.example.ts src/environments/environment.ts
```

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
};
```

Arranca el servidor de desarrollo:

```bash
ng serve
# o bien
npm start
```

La aplicación queda disponible en `http://localhost:4200` con hot reload activado.

---

## 2. Stack tecnológico

| Tecnología     | Versión | Para qué se usa                                          |
| -------------- | ------- | -------------------------------------------------------- |
| Angular        | 19+     | Framework principal — componentes standalone             |
| TypeScript     | 5.x     | Lenguaje de desarrollo                                   |
| SCSS           | —       | Estilos encapsulados por componente                      |
| RxJS           | 7.x     | Gestión de observables, llamadas HTTP, estados reactivos |
| Angular Router | —       | Navegación SPA con lazy loading y guards funcionales     |
| -Electron-     | 33+     | Empaquetado como aplicación de escritorio PWA            |

> La aplicación **no tiene lógica de negocio propia**. Toda validación y autorización se delega a `complyx-api`. La UI se limita a presentar datos y enviar peticiones.

---

## 3. Estructura del proyecto

```
src/
├── app/
│   ├── core/                  # Singletons: servicios, guards, interceptores, modelos
│   │   ├── auth/
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.guard.ts
│   │   │   ├── role.guard.ts
│   │   │   ├── token.interceptor.ts
│   │   │   └── auth-error.interceptor.ts
│   │   ├── services/          # Un servicio por dominio (agent, policy, risk…)
│   │   ├── models/            # Interfaces TypeScript que mapean los DTOs de la API
│   │   └── api.config.ts      # Base URL y rutas de endpoints centralizadas
│   │
│   ├── shared/                # Componentes reutilizables sin lógica de negocio
│   │   ├── components/        # data-table, modal, status-badge, filter-dropdown…
│   │   ├── directives/        # hasRole, clickOutside
│   │   └── pipes/             # timeAgo, severityLabel
│   │
│   ├── layout/                # Shell de la aplicación
│   │   ├── main-layout/       # Sidebar + router-outlet (rutas protegidas)
│   │   └── auth-layout/       # Sin sidebar (login)
│   │
│   ├── features/              # Módulos lazy por dominio
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── agents/
│   │   ├── policies/
│   │   ├── risks/
│   │   ├── regulations/
│   │   ├── events/
│   │   ├── reports/
│   │   ├── users/             # Solo rol ADMIN
│   │   └── profile/
│   │
│   ├── app.routes.ts
│   └── app.config.ts
│
├── environments/
│   ├── environment.ts         # Desarrollo
│   └── environment.prod.ts    # Producción
└── styles.scss                # Estilos globales y variables CSS
```

### Principio de organización

- `core/` — se provee una sola vez en `app.config.ts`. Nunca se importa entre features.
- `shared/` — se importa en cualquier componente que lo necesite. No sabe nada del dominio.
- `features/` — cada feature es autónoma. Solo importa de `core/` y `shared/`, nunca de otra feature.

---

## 4. Componentes standalone

El proyecto usa **componentes standalone** (sin NgModules), el estándar desde Angular 17. Cada componente declara sus propias dependencias en el array `imports`:

```typescript
@Component({
  selector: 'app-agent-list',
  standalone: true,
  imports: [CommonModule, DataTableComponent, StatusBadgeComponent, FilterDropdownComponent],
  templateUrl: './agent-list.component.html',
})
export class AgentListComponent { ... }
```

Para generar un componente nuevo siempre usa el flag `--standalone`:

```bash
ng g component features/agents/agent-detail-modal --standalone
```

---

## 5. Autenticación JWT

### Flujo de login

```
Usuario introduce credenciales
        │
        ▼
AuthService.login(username, password)
        │  POST /api/auth/login
        ▼
API devuelve { accessToken, refreshToken, expiresIn }
        │
        ▼
AuthService guarda tokens en localStorage
        │
        ▼
Router navega a /dashboard
```

### Almacenamiento de tokens

Los tokens se guardan en `localStorage` bajo las claves `complyx_access_token` y `complyx_refresh_token`. **Nunca almacenar datos sensibles del usuario más allá del token.**

```typescript
// auth.service.ts — patrón básico
login(credentials: LoginDTO): Observable<void> {
  return this.http.post<TokenResponseDTO>(`${environment.apiUrl}/auth/login`, credentials).pipe(
    tap(response => {
      localStorage.setItem('complyx_access_token', response.accessToken);
      localStorage.setItem('complyx_refresh_token', response.refreshToken);
    }),
    map(() => void 0)
  );
}

logout(): void {
  // El backend no invalida el token (sin lista negra), así que basta con descartarlo en cliente
  localStorage.removeItem('complyx_access_token');
  localStorage.removeItem('complyx_refresh_token');
  this.router.navigate(['/login']);
}
```

### Interceptor de token

`token.interceptor.ts` adjunta automáticamente el `Bearer` token a cada petición saliente:

```typescript
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('complyx_access_token');
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
```

### Interceptor de errores de autenticación

`auth-error.interceptor.ts` captura respuestas `401` y `403` y redirige al login automáticamente:

```typescript
export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401 || error.status === 403) {
        inject(AuthService).logout();
      }
      return throwError(() => error);
    }),
  );
};
```

Registra ambos interceptores en `app.config.ts`:

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([tokenInterceptor, authErrorInterceptor])),
  ],
};
```

---

## 6. Guards y control de acceso por roles

### authGuard

Protege cualquier ruta que requiera estar autenticado. Redirige a `/login` si no hay token:

```typescript
export const authGuard: CanActivateFn = () => {
  const token = localStorage.getItem('complyx_access_token');
  if (token) return true;
  return inject(Router).createUrlTree(['/login']);
};
```

### roleGuard

Protege rutas que requieren un rol concreto. Redirige a `/dashboard` si el rol no coincide:

```typescript
export const roleGuard =
  (requiredRole: string): CanActivateFn =>
  () => {
    const authService = inject(AuthService);
    if (authService.hasRole(requiredRole)) return true;
    return inject(Router).createUrlTree(['/dashboard']);
  };
```

### Uso en el router

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'login',
    component: AuthLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/auth/login/login.component').then((m) => m.LoginComponent),
      },
    ],
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'agents',
        canActivate: [roleGuard('TECNICO')],
        loadComponent: () =>
          import('./features/agents/agent-list/agent-list.component').then(
            (m) => m.AgentListComponent,
          ),
      },
      {
        path: 'policies',
        canActivate: [roleGuard('TECNICO')],
        loadComponent: () =>
          import('./features/policies/policy-list/policy-list.component').then(
            (m) => m.PolicyListComponent,
          ),
      },
      {
        path: 'risks',
        canActivate: [roleGuard('TECNICO')],
        loadComponent: () =>
          import('./features/risks/risk-matrix/risk-matrix.component').then(
            (m) => m.RiskMatrixComponent,
          ),
      },
      {
        path: 'regulations',
        canActivate: [roleGuard('TECNICO')],
        loadComponent: () =>
          import('./features/regulations/regulation-list/regulation-list.component').then(
            (m) => m.RegulationListComponent,
          ),
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./features/events/event-list/event-list.component').then(
            (m) => m.EventListComponent,
          ),
      },
      {
        path: 'reports',
        canActivate: [roleGuard('AUDITOR')],
        loadComponent: () =>
          import('./features/reports/report-builder/report-builder.component').then(
            (m) => m.ReportBuilderComponent,
          ),
      },
      {
        path: 'users',
        canActivate: [roleGuard('ADMIN')],
        loadComponent: () =>
          import('./features/users/user-list/user-list.component').then((m) => m.UserListComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile/profile.component').then((m) => m.ProfileComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
```

### Directiva hasRole

Para ocultar elementos en el template según el rol sin necesidad de bloquear la ruta completa:

```html
<!-- Solo el administrador ve el botón de cargar normativa -->
<button *hasRole="'ADMIN'" (click)="openUpload()">Cargar normativa</button>
```

```typescript
// has-role.directive.ts
@Directive({ selector: '[hasRole]', standalone: true })
export class HasRoleDirective implements OnInit {
  @Input('hasRole') role!: string;

  constructor(
    private tpl: TemplateRef<any>,
    private vcr: ViewContainerRef,
    private auth: AuthService,
  ) {}

  ngOnInit() {
    if (this.auth.hasRole(this.role)) {
      this.vcr.createEmbeddedView(this.tpl);
    }
  }
}
```

---

## 7. Servicios de API

Cada dominio tiene su propio servicio en `core/services/`. Todos extienden el mismo patrón: reciben filtros como parámetros, devuelven `Observable` y delegan el manejo de errores al interceptor.

```typescript
// core/services/agent.service.ts
@Injectable({ providedIn: 'root' })
export class AgentService {
  private readonly base = `${environment.apiUrl}/agents`;

  constructor(private http: HttpClient) {}

  getAll(filter?: AgentFilter): Observable<Page<AgentDTO>> {
    const params = new HttpParams({ fromObject: { ...filter } });
    return this.http.get<Page<AgentDTO>>(this.base, { params });
  }

  getById(id: string): Observable<AgentDTO> {
    return this.http.get<AgentDTO>(`${this.base}/${id}`);
  }

  enable(id: string): Observable<AgentDTO> {
    return this.http.patch<AgentDTO>(`${this.base}/${id}/enable`, {});
  }

  disable(id: string): Observable<AgentDTO> {
    return this.http.patch<AgentDTO>(`${this.base}/${id}/disable`, {});
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
```

### Paginación

Todos los endpoints de listado devuelven un objeto `Page<T>` de Spring. Define la interfaz en `core/models/pagination.model.ts`:

```typescript
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // página actual (0-indexed)
}
```

Para solicitar una página concreta pasa los query params `page` y `size`:

```typescript
getAll(filter: AgentFilter, page = 0, size = 20): Observable<Page<AgentDTO>> {
  const params = new HttpParams({ fromObject: { ...filter, page, size } });
  return this.http.get<Page<AgentDTO>>(this.base, { params });
}
```

---

## 8. Modelos (interfaces TypeScript)

Los modelos en `core/models/` mapean exactamente los DTOs que devuelve la API. No añadas lógica en ellos, son interfaces puras.

```typescript
// core/models/agent.model.ts
export interface AgentDTO {
  id: string;
  hostname: string;
  ip: string;
  osName: string;
  osVersion: string;
  enabled: boolean;
  environment: 'production' | 'staging' | 'development';
  lastConnectionAt: string; // ISO 8601
  groups: GroupSummaryDTO[];
}

export interface AgentFilter {
  ip?: string;
  hostname?: string;
  osName?: string;
  enabled?: boolean;
  groupId?: string;
}
```

---

## 9. Endpoints de la API

La API corre por defecto en `http://localhost:8080`. Todos los endpoints (salvo login y refresh) requieren el header `Authorization: Bearer <token>`.

### Autenticación — `/api/auth`

| Método | Ruta                | Body                      | Respuesta                                  |
| ------ | ------------------- | ------------------------- | ------------------------------------------ |
| `POST` | `/api/auth/login`   | `{ username, password }`  | `{ accessToken, refreshToken, expiresIn }` |
| `POST` | `/api/auth/refresh` | — (header `refreshToken`) | `{ accessToken, refreshToken, expiresIn }` |
| `POST` | `/api/auth/logout`  | —                         | `204`                                      |

### Agentes — `/api/agents`

| Método   | Ruta                                | Descripción                       | Roles          |
| -------- | ----------------------------------- | --------------------------------- | -------------- |
| `GET`    | `/api/agents`                       | Listado filtrable (`AgentFilter`) | ADMIN, TECNICO |
| `GET`    | `/api/agents/{id}`                  | Detalle de un agente              | ADMIN, TECNICO |
| `PATCH`  | `/api/agents/{id}/enable`           | Activar agente                    | ADMIN, TECNICO |
| `PATCH`  | `/api/agents/{id}/disable`          | Desactivar agente                 | ADMIN, TECNICO |
| `DELETE` | `/api/agents/{id}`                  | Eliminar agente                   | ADMIN, TECNICO |
| `POST`   | `/api/agents/{id}/groups/{groupId}` | Añadir a grupo                    | ADMIN, TECNICO |
| `DELETE` | `/api/agents/{id}/groups/{groupId}` | Quitar de grupo                   | ADMIN, TECNICO |

### Políticas — `/api/policies`

| Método   | Ruta                                  | Descripción                           | Roles          |
| -------- | ------------------------------------- | ------------------------------------- | -------------- |
| `GET`    | `/api/policies`                       | Listado resumido (`PolicySummaryDTO`) | Todos          |
| `GET`    | `/api/policies/{id}`                  | Detalle completo con checks           | Todos          |
| `POST`   | `/api/policies`                       | Crear política                        | ADMIN, TECNICO |
| `PUT`    | `/api/policies/{id}`                  | Actualizar metadatos                  | ADMIN, TECNICO |
| `DELETE` | `/api/policies/{id}`                  | Eliminar política                     | ADMIN          |
| `POST`   | `/api/policies/{id}/agents/{agentId}` | Asignar a agente                      | ADMIN, TECNICO |
| `POST`   | `/api/policies/{id}/groups/{groupId}` | Asignar a grupo                       | ADMIN, TECNICO |

### Normativas — `/api/regulations`

| Método   | Ruta                        | Descripción                       | Roles |
| -------- | --------------------------- | --------------------------------- | ----- |
| `GET`    | `/api/regulations`          | Listado de normativas             | Todos |
| `GET`    | `/api/regulations/{id}`     | Detalle con secciones             | Todos |
| `POST`   | `/api/regulations`          | Crear normativa                   | ADMIN |
| `POST`   | `/api/regulations/{id}/pdf` | Subir PDF (`multipart/form-data`) | ADMIN |
| `DELETE` | `/api/regulations/{id}`     | Eliminar normativa                | ADMIN |

### Riesgos — `/api/risks`

| Método  | Ruta                       | Descripción                           | Roles          |
| ------- | -------------------------- | ------------------------------------- | -------------- |
| `GET`   | `/api/risks`               | Listado con filtros de nivel y estado | Todos          |
| `GET`   | `/api/risks/{id}`          | Detalle de un riesgo                  | Todos          |
| `PATCH` | `/api/risks/{id}/accept`   | Aceptar riesgo                        | ADMIN, TECNICO |
| `PATCH` | `/api/risks/{id}/transfer` | Transferir riesgo                     | ADMIN, TECNICO |
| `PATCH` | `/api/risks/{id}/close`    | Cerrar riesgo                         | ADMIN, TECNICO |

### Eventos — `/api/events`

| Método | Ruta               | Descripción                             | Roles |
| ------ | ------------------ | --------------------------------------- | ----- |
| `GET`  | `/api/events`      | Listado con filtros de tipo y severidad | Todos |
| `GET`  | `/api/events/{id}` | Detalle de un evento                    | Todos |

### Usuarios — `/api/users` _(solo ADMIN)_

| Método   | Ruta                             | Descripción                   |
| -------- | -------------------------------- | ----------------------------- |
| `GET`    | `/api/users`                     | Listado filtrable             |
| `GET`    | `/api/users/{id}`                | Detalle                       |
| `POST`   | `/api/users`                     | Crear usuario                 |
| `PUT`    | `/api/users/{id}`                | Actualizar email o contraseña |
| `DELETE` | `/api/users/{id}`                | Eliminar usuario              |
| `POST`   | `/api/users/{id}/roles/{roleId}` | Asignar rol                   |
| `DELETE` | `/api/users/{id}/roles/{roleId}` | Quitar rol                    |

---

## 10. Roles y permisos en la UI

| Sección                      | ADMIN | TÉCNICO | AUDITOR |
| ---------------------------- | :---: | :-----: | :-----: |
| Dashboard                    |  ✅   |   ✅    |   ✅    |
| Agentes                      |  ✅   |   ✅    |    —    |
| Políticas                    |  ✅   |   ✅    |    —    |
| Riesgos                      |  ✅   |   ✅    |    —    |
| Normativas (ver)             |  ✅   |   ✅    |   ✅    |
| Normativas (cargar/eliminar) |  ✅   |    —    |    —    |
| Eventos y logs               |  ✅   |   ✅    |   ✅    |
| Reportes                     |  ✅   |   ✅    |   ✅    |
| Usuarios                     |  ✅   |    —    |    —    |
| Perfil propio                |  ✅   |   ✅    |   ✅    |

El sidebar se construye dinámicamente filtrando los ítems según el rol del token. Las acciones destructivas (eliminar, desactivar) dentro de cada vista también se ocultan con la directiva `*hasRole`.

---

## 11. Convenciones de código

### Nomenclatura de ficheros

| Tipo        | Patrón                      | Ejemplo                   |
| ----------- | --------------------------- | ------------------------- |
| Componente  | `kebab-case.component.ts`   | `agent-list.component.ts` |
| Servicio    | `kebab-case.service.ts`     | `agent.service.ts`        |
| Guard       | `kebab-case.guard.ts`       | `role.guard.ts`           |
| Interceptor | `kebab-case.interceptor.ts` | `token.interceptor.ts`    |
| Modelo      | `kebab-case.model.ts`       | `agent.model.ts`          |
| Pipe        | `kebab-case.pipe.ts`        | `time-ago.pipe.ts`        |
| Directive   | `kebab-case.directive.ts`   | `has-role.directive.ts`   |

### Nomenclatura de clases y selectores

```typescript
// Clases en PascalCase
export class AgentListComponent {}
export class AgentService {}
export interface AgentDTO {}

// Selectores en kebab-case con prefijo app-
selector: 'app-agent-list';
selector: 'app-status-badge';
```

### Reglas generales

- **Sin lógica de negocio en componentes.** Los componentes llaman a servicios y presentan datos. La transformación de datos va en el servicio o en un pipe.
- **Sin subscripciones manuales cuando sea posible.** Usa el pipe `async` en el template o `takeUntilDestroyed()` para gestionar el ciclo de vida.
- **Sin `any`.** Todos los tipos deben estar definidos en `core/models/`.
- **Observables en servicios, signals en estado local del componente** si se usa Angular Signals (opcional pero recomendado para estado de UI).
- **Los errores HTTP los maneja el interceptor**, no cada componente individualmente. Los componentes solo necesitan manejar el estado de carga.

### Patrón de componente de listado

```typescript
@Component({ ... })
export class AgentListComponent {
  private agentService = inject(AgentService);

  agents$: Observable<Page<AgentDTO>> = this.agentService.getAll();
  loading = signal(false);
  error = signal<string | null>(null);

  onFilterChange(filter: AgentFilter): void {
    this.agents$ = this.agentService.getAll(filter);
  }
}
```

```html
@if (loading()) {
<app-loading-spinner />
} @else if (error()) {
<app-error-banner [message]="error()!" />
} @else {
<app-data-table [data]="(agents$ | async)?.content ?? []" />
}
```

---

## 12. Componentes compartidos más usados

### `app-data-table`

Tabla genérica con soporte para paginación y ordenación. Recibe columnas y datos como inputs:

```html
<app-data-table
  [columns]="['nombre', 'ip', 'estado', 'entorno', 'ultima_conexion']"
  [data]="agents"
  [total]="totalElements"
  (pageChange)="onPageChange($event)"
  (rowClick)="openDetail($event)"
/>
```

### `app-filter-dropdown`

Desplegable de filtro reutilizable. Lo usan Agentes, Eventos, Riesgos, etc.:

```html
<app-filter-dropdown
  label="Todos los estados"
  [options]="estadoOptions"
  (selectionChange)="onEstadoChange($event)"
/>
```

### `app-status-badge`

Píldora de estado con color automático según el valor:

```html
<app-status-badge [value]="agent.enabled ? 'activo' : 'inactivo'" />
<app-status-badge [value]="event.severity" />
<!-- success | warning | error | info -->
```

### `app-modal`

Wrapper genérico para modales. El contenido se proyecta con `ng-content`:

```html
<app-modal [title]="selectedAgent?.hostname" [(visible)]="showDetail">
  <app-agent-detail-modal [agent]="selectedAgent" />
</app-modal>
```

---

## 13. Variables de entorno

| Variable     | Desarrollo                  | Producción                     |
| ------------ | --------------------------- | ------------------------------ |
| `apiUrl`     | `http://localhost:8080/api` | URL del servidor de producción |
| `production` | `false`                     | `true`                         |

Angular usa automáticamente `environment.ts` en desarrollo y `environment.prod.ts` al hacer `ng build --configuration production`.

---

## 14. Flujo de trabajo Git

```
main          ← rama estable, solo merges desde develop
develop       ← rama de integración
feature/xxx   ← una rama por funcionalidad
fix/xxx       ← correcciones de bugs
```

### Convención de commits (Conventional Commits)

```
feat(agents): añadir modal de detalle de agente
fix(auth): corregir redirección tras logout
refactor(shared): extraer data-table a componente propio
style(dashboard): ajustar espaciado de tarjetas
docs: actualizar DEVELOPMENT.md con sección de guards
```

### Proceso para añadir una feature

1. Crear rama desde `develop`: `git checkout -b feature/risk-detail-modal`
2. Implementar con los patrones descritos en este documento
3. Ejecutar `ng lint` y `ng test` sin errores
4. Abrir Pull Request hacia `develop` con descripción de los cambios
5. Revisión de código antes del merge

---

## 15. Generación de código con Angular CLI

Todos los artefactos se generan con `ng generate` para mantener la estructura consistente:

```bash
# Componente standalone en una feature
ng g component features/agents/agent-detail-modal --standalone

# Servicio en core
ng g service core/services/regulation

# Guard funcional
ng g guard core/auth/role --functional
# → seleccionar CanActivate

# Interceptor
ng g interceptor core/auth/token

# Pipe compartido
ng g pipe shared/pipes/time-ago --standalone

# Directiva compartida
ng g directive shared/directives/has-role --standalone
```

---

## 16. Build y despliegue

### Build web (PWA)

```bash
ng build --configuration production
# Output en dist/complyx-ui/browser/
```

### Build Electron (escritorio)

```bash
npm run build:electron
# Genera instaladores en dist/electron/ para el SO actual
```

### Variables para producción

Edita `src/environments/environment.prod.ts` antes del build:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-servidor/api',
};
```

