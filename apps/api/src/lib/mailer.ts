import nodemailer from 'nodemailer';
import { env } from './env.js';

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.password) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.password },
    });
  }
  return transporter;
}

/**
 * Envía el código de recuperación de contraseña. Si SMTP no está configurado
 * (falta SMTP_PASSWORD en .env — la contraseña de aplicación de Gmail), el
 * código se registra en consola en su lugar para no romper el flujo en
 * desarrollo local, pero no llega a ningún correo real.
 */
export async function sendPasswordResetEmail(to: string, code: string): Promise<void> {
  const client = getTransporter();
  if (!client) {
    console.warn(
      `[mailer] SMTP no configurado (falta SMTP_PASSWORD) — código de recuperación para ${to}: ${code}`,
    );
    return;
  }

  await client.sendMail({
    from: env.smtp.from,
    to,
    subject: 'Código de recuperación — Panel DSC ISC',
    text: `Tu código de recuperación es: ${code}\n\nExpira en 15 minutos. Si no lo solicitaste, ignora este correo.`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <p>Tu código de recuperación para el panel administrativo del Departamento de Sistemas y Computación es:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${code}</p>
        <p style="color: #666; font-size: 13px;">Expira en 15 minutos. Si no lo solicitaste, ignora este correo.</p>
      </div>
    `,
  });
}
