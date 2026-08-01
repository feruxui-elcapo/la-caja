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
      setLoginError('No se pudo iniciar sesión con Google.');
    } finally {
      setLoading(false);
    }
  };

  // Unauthorized screen
  if (user && !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center p-6 font-sans">
        <div className="text-center max-w-sm p-8 rounded-3xl bg-slate-900/60 border border-red-500/30 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          <ShieldAlert size={48} className="mx-auto mb-4 text-red-500" />
          <h2 className="font-bold text-xl text-white mb-2 tracking-tight">Acceso Denegado</h2>
          <p className="text-sm text-stone-400 mb-6 leading-relaxed">
            La cuenta <strong className="text-stone-200">{user.email}</strong> no tiene permisos autorizados en La Caja.
          </p>
          <button 
            onClick={() => logout()} 
            className="w-full py-3.5 px-5 rounded-2xl font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            <span>Cambiar de cuenta</span>
          </button>
        </div>
      </div>
    );
  }

  // Login screen
  return (
    <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center p-6 font-sans">
      <div className="text-center max-w-sm w-full p-8 rounded-3xl bg-gradient-to-b from-amber-500/10 via-slate-900/80 to-slate-900/90 border border-amber-500/20 backdrop-blur-xl shadow-[0_25px_60px_rgba(0,0,0,0.9)]">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto mb-5 text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.25)]">
          <Package size={36} />
        </div>
        
        <h1 className="font-extrabold text-2xl text-white tracking-tight mb-1">LA CAJA</h1>
        <p className="text-sm text-stone-400 mb-8">Gastos compartidos en frascos</p>

        {loginError && (
          <p className="text-red-400 text-xs mb-4 bg-red-950/50 border border-red-500/20 rounded-xl p-3">{loginError}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-4 px-5 rounded-2xl font-bold text-gray-900 bg-white hover:bg-stone-100 shadow-[0_4px_20px_rgba(255,255,255,0.2)] transition-all scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
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
