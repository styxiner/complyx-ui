// Las rutas son relativas — en dev el proxy de ng serve redirige /api → localhost:8080
// En producción nginx redirige /api → BACKEND_URL (definido en docker-compose)
const BASE = '';   // sin host ni puerto

export const API = {
  agents: {
    base:          `${BASE}/api/agents`,
    byId:          (id: string)              => `${BASE}/api/agents/${id}`,
    enable:        (id: string)              => `${BASE}/api/agents/${id}/enable`,
    disable:       (id: string)              => `${BASE}/api/agents/${id}/disable`,
    addToGroup:    (aId: string, gId: string)=> `${BASE}/api/agents/${aId}/groups/${gId}`,
    removeFromGroup:(aId: string, gId: string)=>`${BASE}/api/agents/${aId}/groups/${gId}`,
    policies:      (id: string)              => `${BASE}/api/policies/agent/${id}`,
    results:       (aId: string, pId: string)=> `${BASE}/api/agents/${aId}/policies/${pId}/results`,
  },
  groups: {
    base:  `${BASE}/api/groups`,
    byId:  (id: string) => `${BASE}/api/groups/${id}`,
  },
  policies: {
    base:          `${BASE}/api/policies`,
    byId:          (id: string)              => `${BASE}/api/policies/${id}`,
    assignAgent:   (pId: string, aId: string)=> `${BASE}/api/policies/${pId}/agents/${aId}`,
    unassignAgent: (pId: string, aId: string)=> `${BASE}/api/policies/${pId}/agents/${aId}`,
    assignGroup:   (pId: string, gId: string)=> `${BASE}/api/policies/${pId}/groups/${gId}`,
    unassignGroup: (pId: string, gId: string)=> `${BASE}/api/policies/${pId}/groups/${gId}`,
    byAgent:       (id: string)              => `${BASE}/api/policies/agent/${id}`,
  },
  risks: {
    base:         `${BASE}/api/risks`,
    byId:         (id: string)              => `${BASE}/api/risks/${id}`,
    accept:       (id: string)              => `${BASE}/api/risks/${id}/accept`,
    transfer:     (id: string)              => `${BASE}/api/risks/${id}/transfer`,
    monitor:      (id: string)              => `${BASE}/api/risks/${id}/monitor`,
    close:        (id: string)              => `${BASE}/api/risks/${id}/close`,
    linkPolicy:   (rId: string, pId: string)=> `${BASE}/api/risks/${rId}/policies/${pId}`,
    unlinkPolicy: (rId: string, pId: string)=> `${BASE}/api/risks/${rId}/policies/${pId}`,
  },
  threats: {
    base: `${BASE}/api/threats`,
    byId: (id: string) => `${BASE}/api/threats/${id}`,
  },
  users: {
    base:        `${BASE}/api/users`,
    byId:        (id: string)              => `${BASE}/api/users/${id}`,
    assignRole:  (uId: string, rId: string)=> `${BASE}/api/users/${uId}/roles/${rId}`,
    removeRole:  (uId: string, rId: string)=> `${BASE}/api/users/${uId}/roles/${rId}`,
    me:          `${BASE}/api/users/me`,
  },
  regulations: {
    base:    `${BASE}/api/regulations`,
    byId:    (id: string) => `${BASE}/api/regulations/${id}`,
    pdf:     (id: string) => `${BASE}/api/regulations/${id}/pdf`,
    section:    (id: string) => `${BASE}/api/regulations/${id}/sections`,
    uploadPdf: (id: string) => `${BASE}/api/regulations/${id}/pdf`,
  },
  roles: {
    base: `${BASE}/api/roles`,
  },
  auth: {
    login:   `${BASE}/api/auth/login`,
    refresh: `${BASE}/api/auth/refresh`,
    logout:  `${BASE}/api/auth/logout`,
  },
};