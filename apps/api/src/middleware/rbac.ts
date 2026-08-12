import type { NextFunction, Request, Response } from 'express';
import type { Role } from '@dsc-isc/shared';

/**
 * Autorización real de la aplicación. El admin (front) también oculta
 * botones según el rol para UX, pero eso nunca es suficiente — cada ruta
 * que muta datos debe pasar por este middleware.
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }
    if (!roles.includes(req.user.role as Role)) {
      res.status(403).json({ error: 'No tienes permiso para realizar esta acción' });
      return;
    }
    next();
  };
}
