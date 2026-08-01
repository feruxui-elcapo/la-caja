import React from 'react';
import { Package, ShieldAlert, LogOut } from 'lucide-react';
import { loginWithGoogle, logout, type User } from '../firebase';
import { soundFX } from '../utils/audio';

interface LoginScreenProps {
  user: User | null;
  isAuthorized: boolean;
  allowedEmails: string[];
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ user, isAuthorized, allowedEmails }) => {
  const [loading, setLoading] = React.useState(false);
  const [loginError, setLoginError] = React.useState('');

  const handleLogin = async () => {
    try {
      soundFX.playClick();
      setLoading(true);
      setLoginError('');
      await loginWithGoogle();
    } catch (err: any) {
      console.error(err);
      setLoginError('No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  // Unauthorized
  if (user && !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="text-center max-w-xs">
          <ShieldAlert size={40} className="mx-auto mb-4 text-red-500" />
          <h2 className="font-pixel text-xs text-white mb-2">ACCESO DENEGADO</h2>
          <p className="font-body text-sm text-white/60 mb-6">
            {user.email} no está autorizado.
          </p>
          <button onClick={() => logout()} className="btn-pixel bg-white/10 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 mx-auto">
            <LogOut size={14} />
            <span>Cambiar cuenta</span>
          </button>
        </div>
      </div>
    );
  }

  // Login
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="text-center max-w-xs">
        <Package size={48} className="mx-auto mb-5 text-amber-400" />
        <h1 className="font-pixel text-sm text-amber-200 mb-1">LA CAJA</h1>
        <p className="font-body text-sm text-white/40 mb-8">Gastos compartidos en frascos</p>

        {loginError && (
          <p className="text-red-400 font-body text-xs mb-4">{loginError}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="btn-pixel bg-white text-gray-900 w-full py-3.5 rounded-xl flex items-center justify-center gap-3"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>{loading ? 'Ingresando...' : 'Ingresar con Google'}</span>
        </button>
      </div>
    </div>
  );
};
