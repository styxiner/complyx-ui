export const API = {
  auth: { 
    login: '/auth/login', 
    refresh: '/auth/refresh', 
    logout: '/auth/logout' 
  },
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