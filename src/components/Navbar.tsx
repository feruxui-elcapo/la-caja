import React from 'react';
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
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);

  React.useEffect(() => {
    const handler = (e: any) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    soundFX.playPowerup();
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  return (
    <header className="border-b border-white/10 sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Package size={20} className="text-amber-400" />
          <span className="font-pixel text-[0.6rem] text-amber-200">LA CAJA</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {deferredPrompt && (
            <button onClick={handleInstall} className="p-2 text-emerald-400 hover:bg-white/5 rounded-lg" title="Instalar App">
              <Download size={16} />
            </button>
          )}
          <button onClick={() => { soundFX.playClick(); onOpenHistory(); }} className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg relative" title="Historial">
            <History size={16} />
            {totalExpensesCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-black font-pixel text-[6px] w-4 h-4 flex items-center justify-center rounded-full">
                {totalExpensesCount}
              </span>
            )}
          </button>
          <button onClick={() => { soundFX.playClick(); onOpenSettings(); }} className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg" title="Ajustes">
            <Settings size={16} />
          </button>

          <div className="w-px h-5 bg-white/10 mx-1" />

          {user.photoURL ? (
            <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full border border-white/20" />
          ) : (
            <UserIcon size={16} className="text-white/40" />
          )}
          <button onClick={() => { soundFX.playClick(); logout(); }} className="p-2 text-white/30 hover:text-red-400 rounded-lg" title="Salir">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  );
};
