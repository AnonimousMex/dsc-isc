import type { Request } from 'express';
import { HttpError } from '../middleware/errorHandler.js';

/**
 * Los tipos de Express declaran req.params como
 * `{ [key: string]: string | string[] }` (más `| undefined` por
 * `noUncheckedIndexedAccess`), porque en teoría un patrón de ruta podría
 * capturar varios valores. En este proyecto ninguna ruta usa ese patrón,
 * así que cualquier valor que no sea un string simple es un error de
 * enrutamiento, no una entrada de usuario a validar con Zod.
 */
export function pathParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== 'string') {
    throw new HttpError(400, `Parámetro de ruta "${name}" inválido`);
  }
  return value;
}
