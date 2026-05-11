import { HttpInterceptorFn } from '@angular/common/http';

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
