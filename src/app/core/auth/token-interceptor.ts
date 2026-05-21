import { HttpInterceptorFn } from '@angular/common/http';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
const token = localStorage.getItem('complyx_access_token');
  // Si tenemos el token, clonamos la petición y le ponemos la cabecera
  if (token) {
    //Las peticiones en Angular son "inmutables" por eso creamos un clon con los cambios.
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next(req);
};
