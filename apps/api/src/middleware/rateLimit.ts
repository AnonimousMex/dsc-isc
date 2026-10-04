import rateLimit from 'express-rate-limit';

/**
 * Límite por IP sobre el endpoint de login, como defensa adicional (no
 * sustituye) al bloqueo de cuenta tras 5 intentos fallidos que aplica
 * src/services/authService.ts sobre cada usuario individual.
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Intenta de nuevo más tarde.' },
});

/**
 * Límite sobre los endpoints de recuperación de contraseña por correo — más
 * estricto que el login porque además cuestan un envío de correo real.
 */
export const passwordResetRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Intenta de nuevo más tarde.' },
});

/** Límite general para endpoints públicos de escritura (ej. contacto, si se agregan). */
export const writeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' },
});
