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
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0c', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '360px', width: '100%', padding: '32px 24px', borderRadius: '24px', backgroundColor: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(239, 68, 68, 0.35)', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>
          <ShieldAlert size={48} style={{ margin: '0 auto 16px', color: '#EF4444' }} />
          <h2 className="font-pixel" style={{ fontWeight: 700, fontSize: '22px', color: '#FFFFFF', marginBottom: '8px' }}>ACCESO DENEGADO</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', marginBottom: '24px', lineHeight: '1.5' }}>
            <strong style={{ color: '#FFFFFF' }}>{user.email}</strong> no está autorizado.
          </p>
          <button 
            onClick={() => logout()} 
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '16px',
              fontWeight: 600,
              fontSize: '15px',
              color: '#FFFFFF',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <LogOut size={18} />
            <span>Cambiar cuenta</span>
          </button>
        </div>
      </div>
    );
  }

  // Login screen
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0c', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ textAlign: 'center', maxWidth: '360px', width: '100%', padding: '36px 28px', borderRadius: '28px', backgroundColor: 'rgba(245, 158, 11, 0.06)', border: '1.5px solid rgba(245, 158, 11, 0.25)', boxShadow: '0 25px 60px rgba(0,0,0,0.9)' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '20px', backgroundColor: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#F59E0B' }}>
          <Package size={36} />
        </div>
        
        <h1 className="font-pixel" style={{ fontWeight: 700, fontSize: '28px', color: '#F59E0B', margin: '0 0 6px', letterSpacing: '0.04em' }}>LA CAJA</h1>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.65)', margin: '0 0 32px', fontWeight: 500 }}>Gastos compartidos en frascos</p>

        {loginError && (
          <p style={{ color: '#F87171', fontSize: '14px', marginBottom: '16px', backgroundColor: 'rgba(153, 27, 27, 0.4)', padding: '10px', borderRadius: '12px' }}>{loginError}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            height: '52px',
            borderRadius: '16px',
            fontWeight: 700,
            fontSize: '16px',
            color: '#000000',
            backgroundColor: '#FFFFFF',
            border: 'none',
            boxShadow: '0 4px 20px rgba(255,255,255,0.2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24">
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
