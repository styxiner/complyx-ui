# TODOs

Como esto puede ser bastante lioso pues no estamos demasiado bien familiarizados con el ecosistema frontend, añado una serie de passos de cómo desarrollar el frontend:

## Fase 1: Cimientos de la aplicacion

Podemos empezar esto aunque la API no esté levantada:

1. `environments/environment.ts`: Copia el ejemplo y pon la URL de la API
2. `core/api.config.ts`: Centraliza todas las rutas para no tener strings sueltos por los servicios:

```typescript
export const API = {
  auth: { login: '/auth/login', refresh: '/auth/refresh', logout: '/auth/logout' },
  agents: (id = ':id') => ({
    base: '/agents',
    byId: `/agents/${id}`,
    enable: `/agents/${id}/enable`,
    disable: `/agents/${id}/disable`,
  }),
  policies: '/policies',
  risks: '/risks',
  regulations: '/regulations',
  events: '/events',
  users: '/users',
};
```

1. `core/auth/auth.ts`: el `AuthService` completo: login, logout, `hasRole()`, `getCurrentUser()`, y la lógica de decodificar el JWT para extraer los roles (sin librería, con atob).
2. `core/auth/token-interceptor.ts` y `auth-error-interceptor.ts`: sin estos no hay ni una sola llamada autenticada.
3. `app.config.ts`: registra los interceptores y el router.
4. `app.routes.ts` las rutas con guards y lazy loading. Ponlas todas aunque los componentes estén vacíos; así el routing funciona desde el día uno.
5. `core/auth/auth-guard.ts` y `role-guard.ts` — necesarios para que las rutas no sean accesibles sin token.

## Fase 2: Shell visual (layout + login)

Lo que el usuario ve siempre, independientemente de la feature.

1. `features/auth/login`: formulario de login que llama a `AuthService.login()` y redirige a `/dashboard`. Es la primera pantalla funcional de punta a punta.
2. `layout/auth-layout`: contenedor sin sidebar (solo para el login).
3. `shared/components/sidebar`: el menú lateral con los ítems filtrados por rol. Hardcodea los ítems como array y aplica `*hasRole` para ocultarlos. Aquí ya verás la app con su forma definitiva.
4. `shared/components/topbar`: nombre del usuario y botón de cerrar sesión.
5. `layout/main-layout`: une sidebar + topbar + `<router-outlet>`. A partir de aquí cada feature que implementes ya aparece dentro del layout correcto.

## Fase 3: Componentes shared (antes que las features)

Hacer antes de las features porque todas los van a usar. Si los haces bien aquí, las features se escriben casi solas.

1. `shared/components/status-badge`: simple pero se usa en todas las tablas.
2. `shared/components/filter-dropdown`: input/output con las opciones. Lo usan Agentes, Eventos y Riesgos.
3. `shared/components/search-bar`: con debounce de 300ms para no spamear la API.
4. `shared/components/data-table`: la más importante. Columnas configurables, paginación, evento de click por fila. Si la haces genérica aquí, cada feature solo necesita pasarle datos.
5. `shared/components/modal`: wrapper con `ng-content`, título, botón de cerrar, backdrop.
6. `shared/pipes/time-ago-pipe` y `severity-label-pipe`: dos líneas cada uno, pero se usan en todas las tablas.
7. `shared/directives/has-role`: imprescindible para ocultar botones según rol.

## Fase 4: Features por orden de complejidad

Ahora sí, las pantallas. Las ordeno de menor a mayor complejidad para que el ritmo sea positivo.

1. Dashboard: solo lectura, datos agregados. Implementa primero las tarjetas de KPIs (`compliance-card`, `agents-card`…) con datos reales de la API. Las gráficas (`compliance-chart`, `risk-distribution-chart`) van después; necesitas una librería de charts como `ng2-charts` o `ngx-charts`.
2. Eventos y logs: listado con filtros. Usa `data-table` + `filter-dropdown` + `search-bar`. Es la feature más representativa del patrón estándar: si esta queda bien, el resto fluyen igual.
3. Agentes: igual que eventos pero con acciones sobre filas (activar/desactivar). Añade el modal de detalle.
4. Políticas: listado + modal de detalle con tabs (Información / Controles / Normativas) + subida de JSON.
5. Normativas: cards en grid + modal de detalle + descarga de PDF + subida (solo ADMIN).
6. Riesgos: la más visual. La matriz de probabilidad × impacto es una grid CSS donde cada celda filtra la lista inferior. El modal de detalle muestra políticas mitigadoras y agentes afectados.
7. Reportes: selector de tipo + configuración + botón de generar. La parte compleja es el panel de preview si decides implementarlo.
8. Usuarios: CRUD completo solo visible para ADMIN. Usa el `user-form` para crear y editar.
9. Perfil: la más simple: datos del usuario actual, quizás cambio de contraseña.

## Fase 5: Pulido

1. `shared/components/empty-state`, `loading-spinner`, `error-banner`: añádelos a cada feature para que los estados de carga y error sean consistentes.
2. `shared/components/confirm-dialog`: para las acciones destructivas (eliminar agente, eliminar política). Reutilizable desde cualquier feature.
3. `shared/components/export-buttons`: CSV y PDF en Eventos y Reportes.
4. `shared/directives/click-outside`: para cerrar dropdowns al clicar fuera.

## Reglas para desarrollar features

Por cada feature, por favor, seguir este orden de desarrollo:

1. Rellena el modelo en `core/models/` con las interfaces del DTO
   Implementa el servicio en `core/services/` con los métodos que necesita esa feature
   Haz el componente de listado (`*-list`) conectado al servicio real
   Añade los filtros (`*-filter-bar`)
   Añade el modal de detalle (`*-detail-modal`)
   Añade acciones (botones con guards de rol)

Así cada feature pasa de cero a completamente funcional en un solo ciclo, y en todo momento hay algo que enseñar (Por si no da tiempo a acabarlo).
