import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { apiPost, ApiError } from '../lib/apiClient';
import { useAuth } from '../lib/AuthContext';

type Step = 'credentials' | 'totp-required' | 'totp-setup' | 'forgot-request' | 'forgot-reset';

export default function Login() {
  const { login, confirmTotpSetup } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [setupToken, setSetupToken] = useState('');
  const [otpauthUrl, setOtpauthUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [info, setInfo] = useState<string | null>(null);

  const secretFromUrl = (() => {
    try {
      return new URL(otpauthUrl).searchParams.get('secret') ?? '';
    } catch {
      return '';
    }
  })();

  const goToApp = (mustChangePassword: boolean) => {
    navigate(mustChangePassword ? '/cambiar-contrasena' : '/', { replace: true });
  };

  const handleCredentialsSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await login(email, password);
      if ('requiresTotpSetup' in result) {
        setSetupToken(result.setupToken);
        setOtpauthUrl(result.otpauthUrl);
        setStep('totp-setup');
      } else {
        goToApp(result.user.mustChangePassword);
      }
    } catch (err) {
      if (err instanceof ApiError && err.message.includes('doble factor')) {
        setStep('totp-required');
      } else {
        setError(err instanceof ApiError ? err.message : 'No se pudo iniciar sesión');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleTotpSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await login(email, password, totpCode);
      if ('user' in result) goToApp(result.user.mustChangePassword);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Código inválido');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTotpSetupSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await confirmTotpSetup(setupToken, totpCode);
      goToApp(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Código inválido');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotRequestSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiPost('/auth/forgot-password', { email });
      setInfo('Si el correo existe, se envió un código de recuperación. Revisa tu bandeja de entrada.');
      setStep('forgot-reset');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo enviar el código');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotResetSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiPost('/auth/reset-password', { email, code: resetCode, newPassword });
      setInfo('Contraseña actualizada. Ya puedes iniciar sesión con ella.');
      setPassword('');
      setResetCode('');
      setNewPassword('');
      setStep('credentials');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo actualizar la contraseña');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-elevated px-4">
      <div className="w-full max-w-sm rounded-lg border border-line bg-surface p-8 shadow-sm">
        <img src="/logos/dsc-logo.png" alt="Departamento de Sistemas y Computación" className="h-10 w-auto" />
        <h1 className="mt-4 text-xl font-bold text-ink">Iniciar sesión</h1>

        {info && (step === 'credentials' || step === 'forgot-request' || step === 'forgot-reset') && (
          <p className="mt-4 text-sm text-primary">{info}</p>
        )}

        {step === 'credentials' && (
          <form className="mt-6 flex flex-col gap-4" onSubmit={handleCredentialsSubmit}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <p role="alert" aria-live="assertive" className="text-sm text-red-600">
                {error}
              </p>
            )}
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Entrando…' : 'Entrar'}
            </Button>
            <button
              type="button"
              className="text-sm text-muted underline underline-offset-4 hover:text-primary"
              onClick={() => {
                setError(null);
                setInfo(null);
                setStep('forgot-request');
              }}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </form>
        )}

        {step === 'forgot-request' && (
          <form className="mt-6 flex flex-col gap-4" onSubmit={handleForgotRequestSubmit}>
            <p className="text-sm text-muted">
              Escribe tu correo y te enviaremos un código de recuperación de 6 dígitos, válido por 15
              minutos.
            </p>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="forgot-email">Correo</Label>
              <Input
                id="forgot-email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {error && (
              <p role="alert" aria-live="assertive" className="text-sm text-red-600">
                {error}
              </p>
            )}
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Enviando…' : 'Enviar código'}
            </Button>
            <button
              type="button"
              className="text-sm text-muted underline underline-offset-4 hover:text-primary"
              onClick={() => {
                setError(null);
                setInfo(null);
                setStep('credentials');
              }}
            >
              Volver a iniciar sesión
            </button>
          </form>
        )}

        {step === 'forgot-reset' && (
          <form className="mt-6 flex flex-col gap-4" onSubmit={handleForgotResetSubmit}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reset-code">Código de recuperación</Label>
              <Input
                id="reset-code"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                autoFocus
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-password">Nueva contraseña</Label>
              <Input
                id="new-password"
                type="password"
                required
                minLength={12}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            {error && (
              <p role="alert" aria-live="assertive" className="text-sm text-red-600">
                {error}
              </p>
            )}
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Guardando…' : 'Cambiar contraseña'}
            </Button>
            <button
              type="button"
              className="text-sm text-muted underline underline-offset-4 hover:text-primary"
              onClick={() => {
                setError(null);
                setInfo(null);
                setStep('forgot-request');
              }}
            >
              Pedir un código nuevo
            </button>
          </form>
        )}

        {step === 'totp-required' && (
          <form className="mt-6 flex flex-col gap-4" onSubmit={handleTotpSubmit}>
            <p className="text-sm text-muted">
              Ingresa el código de 6 dígitos de tu aplicación de autenticación.
            </p>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="totp">Código de verificación</Label>
              <Input
                id="totp"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                autoFocus
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
              />
            </div>
            {error && (
              <p role="alert" aria-live="assertive" className="text-sm text-red-600">
                {error}
              </p>
            )}
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Verificando…' : 'Verificar'}
            </Button>
          </form>
        )}

        {step === 'totp-setup' && (
          <form className="mt-6 flex flex-col gap-4" onSubmit={handleTotpSetupSubmit}>
            <p className="text-sm text-muted">
              Tu cuenta requiere doble factor de autenticación. Escanea este enlace en Google
              Authenticator, Authy o una app similar (o captura la clave manualmente), y confirma con
              el código generado.
            </p>
            <div className="rounded-md border border-line bg-elevated p-3 text-xs">
              <p className="font-mono break-all text-muted">{otpauthUrl}</p>
              {secretFromUrl && (
                <p className="mt-2 font-mono text-sm font-bold text-ink">Clave: {secretFromUrl}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="totp-setup-code">Código de verificación</Label>
              <Input
                id="totp-setup-code"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                autoFocus
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
              />
            </div>
            {error && (
              <p role="alert" aria-live="assertive" className="text-sm text-red-600">
                {error}
              </p>
            )}
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Confirmando…' : 'Confirmar y entrar'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
