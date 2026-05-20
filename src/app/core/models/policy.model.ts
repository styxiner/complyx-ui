// ─────────────────────────────────────────────────────────────────────────────
// policy.model.ts — DTOs del backend + tipos del agente Rust (checks + remediadores)
// ─────────────────────────────────────────────────────────────────────────────

export type Severity     = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type PolicyStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type CompareOperator = '=' | '!=' | '>=' | '<=' | '>' | '<' | 'contains' | 'not_contains' | 'regex';

// ── Tipos de executor (checks) ────────────────────────────────────────────────

export type CheckType =
  | 'file_exists' | 'file_absent' | 'file_block' | 'file_line' | 'ini_value'
  | 'dir_contains' | 'symlink' | 'pkg_installed' | 'pkg_absent'
  | 'service' | 'sysctl' | 'user_attr';

export interface FileExistsParams   { type: 'file_exists';   path: string; file_type?: 'file'|'dir'|'symlink'; owner?: string; group?: string; mode?: string; }
export interface FileAbsentParams   { type: 'file_absent';   path: string; }
export interface FileBlockParams    { type: 'file_block';    path: string; must_contain?: string[]; must_not_contain?: string[]; match_mode?: 'regex'|'literal'; case_insensitive?: boolean; }
export interface FileLineParams     { type: 'file_line';     path: string; key: string; operator: CompareOperator; value: string; separator?: string; comment_chars?: string[]; required?: boolean; }
export interface IniValueParams     { type: 'ini_value';     path: string; section?: string|null; key: string; operator: CompareOperator; value: string; required?: boolean; separator?: string; }
export interface DirContainsParams  { type: 'dir_contains';  path: string; glob?: string; must_contain?: boolean; min_count?: number; max_count?: number; }
export interface SymlinkParams      { type: 'symlink';       path: string; target?: string; }
export interface PkgInstalledParams { type: 'pkg_installed'; name: string; version?: string; operator?: CompareOperator; package_manager?: 'auto'|'dpkg'|'rpm'|'pacman'; }
export interface PkgAbsentParams    { type: 'pkg_absent';    name: string; reason?: string; package_manager?: 'auto'|'dpkg'|'rpm'|'pacman'; }
export interface ServiceParams      { type: 'service';       name: string; active?: boolean; enabled?: boolean; }
export interface SysctlParams       { type: 'sysctl';        key: string; operator: CompareOperator; value: string; }
export interface UserAttrCheck      { attr: 'shell'|'home'|'uid'|'gid'|'groups'|'password_max_age'|'password_min_age'|'password_status'; operator: CompareOperator; value: string; }
export interface UserAttrParams     { type: 'user_attr';     username: string; checks: UserAttrCheck[]; }

export type CheckParams =
  | FileExistsParams | FileAbsentParams | FileBlockParams | FileLineParams | IniValueParams
  | DirContainsParams | SymlinkParams | PkgInstalledParams | PkgAbsentParams
  | ServiceParams | SysctlParams | UserAttrParams;

// ── Tipos de remediador ───────────────────────────────────────────────────────

export type RemediationType =
  | 'file_line_set' | 'file_block_set'
  | 'pkg_install'   | 'pkg_remove'
  | 'service_set'   | 'sysctl_set';

export type PackageManagerRem = 'auto' | 'apt' | 'dnf' | 'yum' | 'pacman';

export interface FileLineSetParams  { type: 'file_line_set';  path: string; key: string; value: string; separator?: string; comment_chars?: string[]; create_if_absent?: boolean; backup?: boolean; }
export interface FileBlockSetParams { type: 'file_block_set'; path: string; block: string; marker?: string; backup?: boolean; insert_before?: string; }
export interface PkgInstallParams   { type: 'pkg_install';    name: string; version?: string; package_manager?: PackageManagerRem; }
export interface PkgRemoveParams    { type: 'pkg_remove';     name: string; purge?: boolean; package_manager?: PackageManagerRem; }
export interface ServiceSetParams   { type: 'service_set';    name: string; active?: boolean; enabled?: boolean; }
export interface SysctlSetParams    { type: 'sysctl_set';     key: string; value: string; }

export type RemediationParams =
  | FileLineSetParams | FileBlockSetParams
  | PkgInstallParams  | PkgRemoveParams
  | ServiceSetParams  | SysctlSetParams;

// ── Metadatos para el formulario ──────────────────────────────────────────────

export interface CheckTypeMeta {
  type: CheckType; label: string; description: string;
  category: 'filesystem' | 'package' | 'system' | 'user';
}

export const CHECK_TYPE_META: CheckTypeMeta[] = [
  { type: 'file_exists',   label: 'Fichero existe',       description: 'Existencia, tipo, propietario y permisos', category: 'filesystem' },
  { type: 'file_absent',   label: 'Fichero ausente',      description: 'Verifica que un path NO existe',           category: 'filesystem' },
  { type: 'file_block',    label: 'Bloque en fichero',    description: 'Patrones regex/literal en el contenido',   category: 'filesystem' },
  { type: 'file_line',     label: 'Línea key=value',      description: 'Compara directiva (sshd_config, etc.)',    category: 'filesystem' },
  { type: 'ini_value',     label: 'Valor INI',            description: 'Clave en fichero .ini con secciones',      category: 'filesystem' },
  { type: 'dir_contains',  label: 'Contenido directorio', description: 'Ficheros en directorio por glob',          category: 'filesystem' },
  { type: 'symlink',       label: 'Enlace simbólico',     description: 'Symlink existe y apunta al target',        category: 'filesystem' },
  { type: 'pkg_installed', label: 'Paquete instalado',    description: 'Paquete instalado (dpkg/rpm/pacman)',       category: 'package'    },
  { type: 'pkg_absent',    label: 'Paquete ausente',      description: 'Paquete NO instalado',                     category: 'package'    },
  { type: 'service',       label: 'Servicio systemd',     description: 'Estado activo/enabled de un servicio',     category: 'system'     },
  { type: 'sysctl',        label: 'Parámetro kernel',     description: 'Parámetro del kernel vía /proc/sys',       category: 'system'     },
  { type: 'user_attr',     label: 'Atributo de usuario',  description: 'Shell, uid, grupos, contraseña',           category: 'user'       },
];

export interface RemediationTypeMeta {
  type: RemediationType; label: string; description: string;
  category: 'filesystem' | 'package' | 'system';
}

export const REMEDIATION_TYPE_META: RemediationTypeMeta[] = [
  { type: 'file_line_set',  label: 'Escribir directiva',   description: 'Escribe o reemplaza key=value en un fichero de config',    category: 'filesystem' },
  { type: 'file_block_set', label: 'Insertar bloque',      description: 'Añade un bloque de texto a un fichero si no está presente', category: 'filesystem' },
  { type: 'pkg_install',    label: 'Instalar paquete',     description: 'Instala un paquete con apt/dnf/pacman',                    category: 'package'    },
  { type: 'pkg_remove',     label: 'Desinstalar paquete',  description: 'Elimina un paquete del sistema',                           category: 'package'    },
  { type: 'service_set',    label: 'Configurar servicio',  description: 'Arranca/para y habilita/deshabilita un servicio systemd',  category: 'system'     },
  { type: 'sysctl_set',     label: 'Establecer sysctl',    description: 'Escribe parámetro kernel en 99-complyx.conf + runtime',    category: 'system'     },
];

export const COMPARE_OPERATORS: { value: CompareOperator; label: string }[] = [
  { value: '=',            label: 'Igual a (=)'       },
  { value: '!=',           label: 'Distinto de (!=)'  },
  { value: '>=',           label: 'Mayor o igual (>=)'},
  { value: '<=',           label: 'Menor o igual (<=)'},
  { value: '>',            label: 'Mayor que (>)'     },
  { value: '<',            label: 'Menor que (<)'     },
  { value: 'contains',     label: 'Contiene'          },
  { value: 'not_contains', label: 'No contiene'       },
  { value: 'regex',        label: 'Regex'             },
];

// ── DTOs de listado ───────────────────────────────────────────────────────────

export interface PolicySummaryDTO {
  id: string; name: string; version: string;
  severity: Severity; status: string; createdAt: string;
}

// ── DTOs de detalle ───────────────────────────────────────────────────────────

export interface PolicyDetailDTO {
  id: string; name: string; version: string; description: string;
  status: string; severity: Severity; createdAt: string;
  elements: PolicyElementDTO[];
}

export interface PolicyElementDTO {
  id: string; name: string; checks: PolicyCheckDTO[];
}

export interface PolicyCheckDTO {
  id: string; name: string; rationale: string;
  checkParams: CheckParams;
  remediations: PolicyRemediationDTO[];
  regulationSectionIds: string[];
}

export interface PolicyRemediationDTO {
  id: string; name: string; description: string;
  remediationParams: RemediationParams;
}

// ── DTOs de creación ──────────────────────────────────────────────────────────

export interface PolicyCreateDTO {
  name: string; description: string; version: string;
  severity: Severity; status: PolicyStatus;
  elements: PolicyElementCreateDTO[];
}

export interface PolicyElementCreateDTO {
  name: string; description?: string; checks: PolicyCheckCreateDTO[];
}

export interface PolicyCheckCreateDTO {
  name: string; checkParams: CheckParams; rationale?: string;
  remediations?: PolicyRemediationCreateDTO[];
  regulationSectionIds?: string[];
}

export interface PolicyRemediationCreateDTO {
  name: string; description?: string;
  remediationParams: RemediationParams;
}

// ── DTOs de actualización ─────────────────────────────────────────────────────

export interface PolicyUpdateDTO {
  name: string; version: string; description: string;
  severity: Severity; status: PolicyStatus;
  elements: PolicyElementUpdateDTO[];
}

export interface PolicyElementUpdateDTO {
  id?: string; name: string; description?: string; checks: PolicyCheckUpdateDTO[];
}

export interface PolicyCheckUpdateDTO {
  id?: string; name: string; checkParams: CheckParams; rationale?: string;
  remediations?: PolicyRemediationUpdateDTO[];
  regulationSectionIds?: string[];
}

export interface PolicyRemediationUpdateDTO {
  id?: string; name: string; description?: string;
  remediationParams: RemediationParams;
}

// ── Filtro ────────────────────────────────────────────────────────────────────

export interface PolicyFilter {
  name?: string; severity?: Severity;
  assignedToAgentId?: string; assignedToGroupId?: string; includeUnassigned?: boolean;
  regulationId?: string;
}