import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { Clock, Download, Globe, Info, Moon, Save, Shield, Sun, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DailyReminderSettings from '../components/DailyReminderSettings';
import { revokeAiPermissions } from '../hooks/useAiPermission';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { auth, db } from '../services/firebase';
import { setAnalyticsConsent } from '../services/analytics';
import { ANALYTICS_CONSENT_VERSION } from '../utils/legalVersions';
import { exportUserData } from '../services/userDataExportService';
import { deleteCurrentAccount } from '../services/accountDeletionService';
import { logSanitizedClientError } from '../utils/safeClientLog';

type SettingsState = {
  language: string;
  timezone: string;
  analyticsOptIn: boolean;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const accountDeletionEnabled = import.meta.env.VITE_ACCOUNT_DELETION_ENABLED === 'true';

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, setDarkMode } = useTheme();
  const navigate = useNavigate();
  const { hash } = useLocation();
  const [isLoaded, setIsLoaded] = useState(false);
  const [settingsLoadError, setSettingsLoadError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const [deletionDialogOpen, setDeletionDialogOpen] = useState(false);
  const [deletionConfirmation, setDeletionConfirmation] = useState('');
  const [deletionPassword, setDeletionPassword] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [analyticsConsentChanged, setAnalyticsConsentChanged] = useState(false);
  const [analyticsConsentMetadata, setAnalyticsConsentMetadata] = useState<{
    version: string | null;
    consentAt: unknown;
    revokedAt: unknown;
  }>({ version: null, consentAt: null, revokedAt: null });

  const currentUser = auth.currentUser;
  const isGoogleUser = currentUser?.providerData?.some((p) => p.providerId === 'google.com') ?? false;
  const hasPasswordProvider = currentUser?.providerData.some((p) => p.providerId === 'password') ?? false;
  const canReauthenticateForDeletion = isGoogleUser || hasPasswordProvider;

  // Estados para configuración
  const [settings, setSettings] = useState<SettingsState>({
    language: 'es',
    timezone: 'America/Bogota',
    analyticsOptIn: false,
  });

  useEffect(() => {
    let isCurrent = true;

    const loadSettings = async () => {
      setIsLoaded(false);
      setSettingsLoadError(false);
      setSettings((current) => ({ ...current, analyticsOptIn: false }));
      setAnalyticsConsentChanged(false);
      setAnalyticsConsentMetadata({ version: null, consentAt: null, revokedAt: null });

      if (!user) {
        setSettingsLoadError(true);
        setIsLoaded(true);
        return;
      }

      try {
        const userSnapshot = await getDoc(doc(db, 'users', user.uid));
        if (!isCurrent) {
          return;
        }
        if (!userSnapshot.exists()) {
          throw new Error('No se encontró el perfil para cargar la configuración.');
        }

        const savedSettings = userSnapshot.data().settings;
        if (isRecord(savedSettings)) {
          setSettings((current) => ({
            ...current,
            language: typeof savedSettings.language === 'string'
              ? savedSettings.language
              : current.language,
            timezone: typeof savedSettings.timezone === 'string'
              ? savedSettings.timezone
              : current.timezone,
            analyticsOptIn: savedSettings.analyticsOptIn === true
              && savedSettings.analyticsConsentVersion === ANALYTICS_CONSENT_VERSION
              && savedSettings.analyticsConsentAt != null,
          }));
          setAnalyticsConsentMetadata({
            version: typeof savedSettings.analyticsConsentVersion === 'string'
              ? savedSettings.analyticsConsentVersion : null,
            consentAt: savedSettings.analyticsConsentAt ?? null,
            revokedAt: savedSettings.analyticsConsentRevokedAt ?? null,
          });

        }
      } catch (error) {
        logSanitizedClientError('Settings load failed', error);
        if (isCurrent) {
          setSettingsLoadError(true);
          toast.error('No se pudo cargar tu configuración. Inténtalo de nuevo.');
        }
      } finally {
        if (isCurrent) {
          setIsLoaded(true);
        }
      }
    };

    void loadSettings();
    return () => {
      isCurrent = false;
    };
  }, [user]);

  const handleSettingsChange = <K extends keyof SettingsState,>(key: K, value: SettingsState[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    if (key === 'analyticsOptIn') {
      setAnalyticsConsentChanged(true);
      if (value === false) void setAnalyticsConsent(false);
    }
  };

  const saveSettings = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para guardar tu configuración.');
      return;
    }

    setLoading(true);
    try {
      const consentMetadata = settings.analyticsOptIn
        ? {
            analyticsConsentVersion: ANALYTICS_CONSENT_VERSION,
            analyticsConsentAt: analyticsConsentChanged ? serverTimestamp() : analyticsConsentMetadata.consentAt,
            analyticsConsentRevokedAt: null,
          }
        : {
            analyticsConsentVersion: analyticsConsentMetadata.version,
            analyticsConsentAt: analyticsConsentMetadata.consentAt,
            analyticsConsentRevokedAt: analyticsConsentChanged ? serverTimestamp() : analyticsConsentMetadata.revokedAt,
          };
      await updateDoc(doc(db, 'users', user.uid), {
        'settings.analyticsOptIn': settings.analyticsOptIn,
        'settings.analyticsConsentVersion': consentMetadata.analyticsConsentVersion,
        'settings.analyticsConsentAt': consentMetadata.analyticsConsentAt,
        'settings.analyticsConsentRevokedAt': consentMetadata.analyticsConsentRevokedAt,
        updatedAt: serverTimestamp(),
      });
      setAnalyticsConsentMetadata({
        version: settings.analyticsOptIn ? ANALYTICS_CONSENT_VERSION : analyticsConsentMetadata.version,
        consentAt: settings.analyticsOptIn && analyticsConsentChanged ? new Date() : analyticsConsentMetadata.consentAt,
        revokedAt: settings.analyticsOptIn ? null : analyticsConsentChanged ? new Date() : analyticsConsentMetadata.revokedAt,
      });
      setAnalyticsConsentChanged(false);
      await setAnalyticsConsent(settings.analyticsOptIn);
      toast.success('Configuración guardada exitosamente');
    } catch (error) {
      logSanitizedClientError('Settings save failed', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      logSanitizedClientError('Settings sign-out failed', error);
    }
  };

  const handleExportData = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para exportar tus datos.');
      return;
    }

    setExportingData(true);
    try {
      const dataExport = await exportUserData(user.uid, user.email ?? null, user.displayName ?? null);
      const file = new Blob([JSON.stringify(dataExport, null, 2)], { type: 'application/json' });
      const downloadUrl = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `mood-log-datos-${dataExport.exportedAt.slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      toast.success('Tus datos se descargaron correctamente.');
    } catch (error) {
      logSanitizedClientError('User data export action failed', error);
      toast.error('No se pudieron exportar tus datos. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setExportingData(false);
    }
  };

  const handleDeleteAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || deletionConfirmation !== 'ELIMINAR') {
      toast.error('Escribe ELIMINAR para confirmar la eliminación de la cuenta.');
      return;
    }
    if (hasPasswordProvider && !deletionPassword) {
      toast.error('Escribe tu contraseña actual para verificar tu identidad.');
      return;
    }

    setDeletingAccount(true);
    try {
      await deleteCurrentAccount(deletionPassword || undefined);
      toast.success('La cuenta y sus datos de Mood Log se eliminaron correctamente.');
      navigate('/', { replace: true });
    } catch (error) {
      logSanitizedClientError('Account deletion action failed', error);
      toast.error(error instanceof Error ? error.message : 'No se pudo eliminar la cuenta.');
    } finally {
      setDeletingAccount(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className='min-h-screen mood-canvas flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500'></div>
      </div>
    );
  }

  if (settingsLoadError) {
    return (
      <div className='min-h-screen mood-canvas'>
        <Header title='Configuración' subtitle='Gestiona tu perfil y preferencias' backTo='/dashboard' />
        <main className='mx-auto max-w-xl px-4 py-16 text-center'>
          <p role='alert' className={`mb-5 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            No pudimos cargar tus preferencias. No se guardarán valores predeterminados para evitar reemplazar
            tu configuración existente.
          </p>
          <button
            type='button'
            onClick={() => window.location.reload()}
            className='rounded-lg bg-purple-600 px-5 py-3 font-medium text-white hover:bg-purple-700'
          >
            Reintentar
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className='min-h-screen mood-canvas'>
      <Header title='Configuración' subtitle='Gestiona tu perfil y preferencias' backTo='/dashboard' />

      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='space-y-8'>
          <section id='recordatorio-diario' aria-labelledby='recordatorio-titulo' className='card scroll-mt-24 space-y-3' ref={(section) => {
            if (section && hash === '#recordatorio-diario') section.scrollIntoView({ block: 'start' });
          }}>
            <DailyReminderSettings key={user?.uid} />
          </section>
          <div className='card'>
            <div className='flex items-center justify-between gap-4'>
              <div className='flex items-center space-x-3'>
                <div className={`w-10 h-10 ${isDarkMode ? 'bg-indigo-900' : 'bg-indigo-100'} rounded-lg flex items-center justify-center`}>
                  {isDarkMode
                    ? <Moon className='w-5 h-5 text-indigo-300' />
                    : <Sun className='w-5 h-5 text-indigo-600' />}
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Apariencia</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Elige el modo claro u oscuro para toda la aplicación
                  </p>
                </div>
              </div>
              <button
                type='button'
                role='switch'
                aria-checked={isDarkMode}
                aria-label='Activar modo oscuro'
                onClick={() => setDarkMode(!isDarkMode)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  isDarkMode ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    isDarkMode ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Analítica opcional */}
          <div className='card'>
            <div className='flex items-center space-x-3 mb-4'>
              <div className={`w-10 h-10 ${isDarkMode ? 'bg-purple-900' : 'bg-purple-100'} rounded-lg flex items-center justify-center`}>
                <Info className={`w-5 h-5 ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`} />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Analítica opcional</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Desactivada por defecto</p>
              </div>
            </div>
            <p className={`mb-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Si la activas, Firebase Analytics de Google procesa eventos de uso y algunos datos técnicos del dispositivo.
              Los eventos definidos por Mood Log no incluyen el contenido de tus diarios ni tus puntuaciones de ánimo.
              Puedes cambiar esta opción cuando quieras; se aplica al guardar.
            </p>
            <label className='flex items-center justify-between gap-4 cursor-pointer'>
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Permitir analítica de uso</span>
              <input
                type='checkbox'
                checked={settings.analyticsOptIn}
                onChange={(event) => handleSettingsChange('analyticsOptIn', event.target.checked)}
                aria-label='Permitir analítica de uso de Firebase'
                className='h-5 w-5 accent-purple-600'
              />
            </label>
            {analyticsConsentChanged && (
              <p role='status' className={`mt-3 text-sm ${isDarkMode ? 'text-amber-200' : 'text-amber-800'}`}>
                Guarda la configuración para aplicar este cambio.
              </p>
            )}
          </div>

          {/* Información Personal */}
          <div className='card'>
            <div className='flex items-center space-x-3 mb-6'>
              <div
                className={`w-10 h-10 ${
                  isDarkMode ? 'bg-purple-900' : 'bg-purple-100'
                } rounded-lg flex items-center justify-center`}
              >
                <User className={`w-5 h-5 ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`} />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Información Personal
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Actualiza tu información de perfil
                </p>
              </div>
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Editar Perfil Completo</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Modifica tu nombre, información de contacto, biografía y más
                </p>
              </div>
              <button
                onClick={() => navigate('/profile')}
                className='px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2'
              >
                <User className='w-4 h-4' />
                <span>Editar Perfil</span>
              </button>
            </div>
          </div>

          <section className='card flex flex-wrap items-center justify-between gap-4'>
            <div>
              <h2 className='text-lg font-semibold'>Permisos de IA</h2>
              <p className='text-sm text-[var(--mood-text-muted)]'>Mood Log recuerda en este dispositivo los permisos de envío a Groq que aceptas al usar cada función.</p>
            </div>
            <button type='button' className='min-h-11 rounded-xl border border-[var(--mood-border)] px-4 text-sm font-semibold' onClick={() => {
              if (!user) return;
              revokeAiPermissions(user.uid);
              toast.success('Permisos de IA retirados en este dispositivo.');
            }}>Retirar permisos de IA</button>
          </section>

          <section className='card flex flex-wrap items-center justify-between gap-4'>
            <div>
              <h2 className='text-lg font-semibold'>Contraseña</h2>
              <p className='text-sm text-[var(--mood-text-muted)]'>
                {hasPasswordProvider ? 'Confirma el cambio desde el correo de tu cuenta.' : 'Tu proveedor de inicio de sesión gestiona la contraseña.'}
              </p>
            </div>
            {hasPasswordProvider && <Link className='btn-primary' to='/settings/password'>Cambiar contraseña</Link>}
          </section>

          <section className='card'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Autorización para ánimo y diario</h3>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Consulta, otorga o retira el permiso opcional para guardar estos registros.</p>
              </div>
              <button type='button' onClick={() => navigate('/sensitive-data-consent')} className='rounded-lg border border-purple-300 px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-950/40'>
                Gestionar autorización
              </button>
            </div>
          </section>

          <section className='card'>
            <div className='flex items-center space-x-3 mb-4'>
              <div className={`w-10 h-10 ${isDarkMode ? 'bg-emerald-900' : 'bg-emerald-100'} rounded-lg flex items-center justify-center`}>
                <Download className={`w-5 h-5 ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`} />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Exportar mis datos
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Descarga una copia JSON de tu perfil, preferencias, registros de ánimo, diario y demás datos guardados.
                </p>
              </div>
            </div>
            <p className={`mb-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Incluye tus registros actuales y anteriores y un resumen del uso de IA. No incluye archivos adjuntos ni datos
              guardados solo en el reloj. El archivo indica qué información incluye.
            </p>
            <button
              type='button'
              onClick={handleExportData}
              disabled={exportingData || !user}
              className='inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <Download className='h-4 w-4' />
              <span>{exportingData ? 'Preparando exportación…' : 'Descargar mis datos'}</span>
            </button>
          </section>

          <section className={`${isDarkMode ? 'border-red-900 bg-gray-800' : 'border-red-200 bg-white'} rounded-xl border p-6 shadow-sm`}>
            <div className='flex items-start gap-3'>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isDarkMode ? 'bg-red-950' : 'bg-red-50'}`}>
                <Shield className={`h-5 w-5 ${isDarkMode ? 'text-red-300' : 'text-red-600'}`} />
              </div>
              <div className='min-w-0 flex-1'>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Eliminar cuenta y datos
                </h3>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Borra permanentemente tu cuenta de Mood Log, perfil, registros, diario, preferencias y archivos privados guardados por la aplicación.
                </p>
                <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Esta acción no se puede deshacer. Los datos que hayas enviado a proveedores externos de IA pueden estar sujetos a sus propias políticas de conservación.
                </p>
                {!canReauthenticateForDeletion && (
                  <p role='note' className={`mt-3 text-sm ${isDarkMode ? 'text-amber-200' : 'text-amber-800'}`}>
                    La verificación segura para tu método de acceso aún no está disponible. Contacta soporte para eliminar tu cuenta.
                  </p>
                )}
                {!accountDeletionEnabled && (
                  <p role='note' className={`mt-3 text-sm ${isDarkMode ? 'text-amber-200' : 'text-amber-800'}`}>
                    La eliminación está temporalmente deshabilitada mientras se valida la configuración segura del servicio.
                  </p>
                )}
                {!deletionDialogOpen ? (
                  <button
                    type='button'
                    onClick={() => setDeletionDialogOpen(true)}
                    disabled={!accountDeletionEnabled || !user || !canReauthenticateForDeletion}
                    className='mt-4 rounded-lg border border-red-600 px-4 py-2 font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-300 dark:hover:bg-red-950/40'
                  >
                    Eliminar mi cuenta
                  </button>
                ) : (
                  <form onSubmit={handleDeleteAccount} className={`mt-5 space-y-4 rounded-lg border p-4 ${isDarkMode ? 'border-gray-700 bg-gray-900/60' : 'border-gray-200 bg-gray-50'}`}>
                    <div role='alert' className={`text-sm font-medium ${isDarkMode ? 'text-red-200' : 'text-red-800'}`}>
                      Se eliminarán de forma permanente tu cuenta y los datos de Mood Log. No podrás recuperarlos.
                    </div>
                    {hasPasswordProvider && (
                      <div>
                        <label htmlFor='delete-account-password' className={`mb-1 block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          Confirma tu contraseña actual
                        </label>
                        <input
                          id='delete-account-password'
                          type='password'
                          autoComplete='current-password'
                          required
                          value={deletionPassword}
                          onChange={(event) => setDeletionPassword(event.target.value)}
                          disabled={deletingAccount}
                          className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
                        />
                      </div>
                    )}
                    {isGoogleUser && !hasPasswordProvider && (
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Al confirmar, Google te pedirá verificar tu identidad.
                      </p>
                    )}
                    <div>
                      <label htmlFor='delete-account-confirmation' className={`mb-1 block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Escribe <span className='font-bold'>ELIMINAR</span> para habilitar la acción
                      </label>
                      <input
                        id='delete-account-confirmation'
                        type='text'
                        autoComplete='off'
                        required
                        value={deletionConfirmation}
                        onChange={(event) => setDeletionConfirmation(event.target.value)}
                        disabled={deletingAccount}
                        className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 ${isDarkMode ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'}`}
                      />
                    </div>
                    <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
                      <button
                        type='button'
                        onClick={() => {
                          setDeletionDialogOpen(false);
                          setDeletionConfirmation('');
                          setDeletionPassword('');
                        }}
                        disabled={deletingAccount}
                        className={`rounded-lg px-4 py-2 font-medium ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} disabled:opacity-50`}
                      >
                        Cancelar
                      </button>
                      <button
                        type='submit'
                        disabled={deletingAccount || deletionConfirmation !== 'ELIMINAR' || (hasPasswordProvider && !deletionPassword)}
                        className='rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        {deletingAccount ? 'Eliminando datos…' : 'Verificar y eliminar definitivamente'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </section>

          {/* Información del Sistema */}
          <div className='card'>
            <div className='flex items-center space-x-3 mb-6'>
              <div
                className={`w-10 h-10 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                } rounded-lg flex items-center justify-center`}
              >
                <Info className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Información del Sistema
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Detalles de tu cuenta y configuración
                </p>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='flex items-center space-x-3'>
                <Globe className='w-5 h-5 text-gray-400' />
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Idioma</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Español (Colombia)</p>
                </div>
              </div>

              <div className='flex items-center space-x-3'>
                <Shield className='w-5 h-5 text-gray-400' />
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Rol</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Usuario
                  </p>
                </div>
              </div>

              <div className='flex items-center space-x-3'>
                <Clock className='w-5 h-5 text-gray-400' />
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Zona Horaria</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>América/Bogotá</p>
                </div>
              </div>

              <div className='flex items-center space-x-3'>
                <Info className='w-5 h-5 text-gray-400' />
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Versión</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Mood Log v1.1</p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className='flex justify-between items-center'>
            <button
              onClick={saveSettings}
              disabled={loading}
              className='px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-2'
            >
              <Save className='w-5 h-5' />
              <span>Guardar Configuración</span>
            </button>

            <button
              onClick={handleLogout}
              className='px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2'
            >
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
