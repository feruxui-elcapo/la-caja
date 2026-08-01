import React, { useState, useEffect } from 'react';
import { Package, Settings, History, LogOut, Download, User as UserIcon } from 'lucide-react';
import { logout, type User } from '../firebase';
import { soundFX } from '../utils/audio';

interface NavbarProps {
  user: User;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  totalExpensesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenHistory,
  onOpenSettings,
  totalExpensesCount
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    soundFX.playPowerup();
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted PWA installation');
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <header className="bg-black/90 border-b-4 border-black sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#4D331A] border-2 border-black rounded-xl text-amber-300 shadow-[2px_2px_0_0_#000]">
            <Package size={20} />
          </div>
          <div>
            <h1 className="text-xs md:text-sm font-pixel-title text-amber-100 tracking-tight leading-none">
              LA CAJA 8-BIT
            </h1>
            <span className="text-[8px] font-pixel-title text-amber-400 tracking-widest uppercase">
              GASTOS CHIBI
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* PWA Install Button */}
          {isInstallable && (
            <button
              onClick={handleInstallPWA}
              className="btn-pixel btn-pixel-green px-2.5 py-1.5 rounded-lg text-[9px] flex items-center gap-1.5"
              title="Instalar App PWA"
            >
              <Download size={14} />
              <span className="hidden sm:inline">INSTALAR APP</span>
            </button>
          )}

          {/* History Button */}
          <button
            onClick={() => { soundFX.playClick(); onOpenHistory(); }}
            className="btn-pixel bg-gray-900 text-gray-200 px-2.5 py-1.5 rounded-lg text-[9px] flex items-center gap-1.5"
            title="Ver Historial"
          >
            <History size={14} className="text-amber-400" />
            <span className="hidden sm:inline">HISTORIAL</span>
            {totalExpensesCount > 0 && (
              <span className="bg-amber-500 text-black font-pixel-title text-[8px] px-1 py-0.2 rounded">
                {totalExpensesCount}
              </span>
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={() => { soundFX.playClick(); onOpenSettings(); }}
            className="btn-pixel bg-gray-900 text-gray-200 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-[9px] flex items-center gap-1.5"
            title="Ajustes"
          >
            <Settings size={14} className="text-amber-400" />
            <span className="hidden sm:inline">AJUSTES</span>
          </button>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l-2 border-gray-800">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Usuario'}
                className="w-7 h-7 rounded-full border-2 border-amber-500"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-amber-900 border-2 border-amber-500 flex items-center justify-center text-amber-200 text-xs">
                <UserIcon size={14} />
              </div>
            )}

            <button
              onClick={() => { soundFX.playClick(); logout(); }}
              className="p-1.5 text-gray-400 hover:text-red-400 bg-gray-900 border border-gray-800 rounded-lg"
              title="Cerrar Sesión"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
