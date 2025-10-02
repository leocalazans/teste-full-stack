export const environment = {
  production: false,
  // include the /api prefix so all service calls target the backend API routes
  // use relative path so the Angular dev server proxy forwards requests to backend
  // and cookies are treated as same-origin (avoids SameSite/CORS cookie issues)
  apiBaseUrl: '/api',
};
