// src/app/core/api.config.ts

export const API = {
  auth: {
    login:   '/api/auth/login',
    refresh: '/api/auth/refresh',
    logout:  '/api/auth/logout',
  },

  users: {
    base:       '/api/users',
    me:         '/api/users/me',
    byId:       (id: string) => `/api/users/${id}`,
    assignRole: (userId: string, roleId: string) => `/api/users/${userId}/roles/${roleId}`,
    removeRole: (userId: string, roleId: string) => `/api/users/${userId}/roles/${roleId}`,
  },

  agents: {
    base:            '/api/agents',
    byId:            (id: string) => `/api/agents/${id}`,
    enable:          (id: string) => `/api/agents/${id}/enable`,
    disable:         (id: string) => `/api/agents/${id}/disable`,
    addToGroup:      (agentId: string, groupId: string) => `/api/agents/${agentId}/groups/${groupId}`,
    removeFromGroup: (agentId: string, groupId: string) => `/api/agents/${agentId}/groups/${groupId}`,
    policies:        (agentId: string) => `/api/agents/${agentId}/policies`,
  },

  policies: {
    base:           '/api/policies',
    byId:           (id: string) => `/api/policies/${id}`,
    byAgent:        (agentId: string) => `/api/policies/agent/${agentId}`,
    assignAgent:    (policyId: string, agentId: string) => `/api/policies/${policyId}/agents/${agentId}`,
    unassignAgent:  (policyId: string, agentId: string) => `/api/policies/${policyId}/agents/${agentId}`,
    assignGroup:    (policyId: string, groupId: string) => `/api/policies/${policyId}/groups/${groupId}`,
    unassignGroup:  (policyId: string, groupId: string) => `/api/policies/${policyId}/groups/${groupId}`,
  },

  risks: {
    base:     '/api/risks',
    byId:     (id: string) => `/api/risks/${id}`,
    accept:   (id: string) => `/api/risks/${id}/accept`,
    transfer: (id: string) => `/api/risks/${id}/transfer`,
    close:    (id: string) => `/api/risks/${id}/close`,
  },

  regulations: {
    base:       '/api/regulations',
    byId:       (id: string) => `/api/regulations/${id}`,
    uploadPdf:  (id: string) => `/api/regulations/${id}/pdf`,
    addSection: (id: string) => `/api/regulations/${id}/sections`,
    pdf:        (id: string) => `/api/regulations/${id}/pdf`,
  },

  events: {
    base: '/api/events',
    byId: (id: string) => `/api/events/${id}`,
  },
} as const;