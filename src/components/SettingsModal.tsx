import React, { useState } from 'react';
import type { AppConfig, Jar } from '../types';
import { X, Plus, Trash2, Save, Mail, CheckCircle2 } from 'lucide-react';
import { soundFX } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSaveConfig: (newConfig: Partial<AppConfig>) => Promise<void>;
  currentUserEmail: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen, onClose, config, onSaveConfig
}) => {
  const [totalBudget, setTotalBudget] = useState(config.totalMonthlyBudget || 300000);
  const [secondaryEmail, setSecondaryEmail] = useState(config.secondaryEmail || '');
  const [jars, setJars] = useState<Jar[]>(config.jars || []);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleJarChange = (id: string, field: keyof Jar, value: any) => {
    setJars(prev => prev.map(j => {
      if (j.id !== id) return j;
      const updated = { ...j, [field]: value };
      if (field === 'percentage') updated.allocatedBudget = Math.round((totalBudget * (Number(value) || 0)) / 100);
      return updated;
    }));
  };

  const handleBudgetChange = (val: number) => {
    setTotalBudget(val);
    setJars(prev => prev.map(j => ({ ...j, allocatedBudget: Math.round((val * j.percentage) / 100) })));
  };

  const addJar = () => {
    soundFX.playClick();
    const c = ['#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6'];
    setJars(prev => [...prev, { id: String(Date.now()), name: 'Nuevo', percentage: 10, allocatedBudget: Math.round(totalBudget * 0.1), color: c[prev.length % c.length], icon: 'box' }]);
  };

  const removeJar = (id: string) => {
    soundFX.playClick();
    if (jars.length <= 1) return;
    setJars(prev => prev.filter(j => j.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSaved(false);
    const allowed = ['fernandocastrofiore@gmail.com'];
    const sec = secondaryEmail.trim().toLowerCase();
    if (sec) allowed.push(sec);
    try {
      setLoading(true);
      await onSaveConfig({ totalMonthlyBudget: totalBudget, secondaryEmail: sec, allowedEmails: allowed, jars });
      soundFX.playPowerup();
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 1000);
    } catch { setError('Error al guardar.'); }
    finally { setLoading(false); }
  };

  const fmt = (n: number) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box max-w-lg max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <span className="font-pixel text-lg font-bold text-white tracking-wider">AJUSTES Y CONFIGURACIÓN</span>
          <button onClick={onClose} className="text-white/40 hover:text-white p-1 transition-colors"><X size={20} /></button>
        </div>

        {saved && <div className="flex items-center gap-2 text-emerald-400 font-body text-xs mb-4 bg-emerald-950/50 border border-emerald-500/20 rounded-xl p-3"><CheckCircle2 size={16} /><span>Guardado correctamente.</span></div>}
        {error && <p className="text-red-400 font-body text-xs mb-4 bg-red-950/50 border border-red-500/20 rounded-xl p-3">{error}</p>}

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto space-y-5 pr-1">
          {/* Budget */}
          <div>
            <p className="font-sans text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">PRESUPUESTO MENSUAL TOTAL</p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 font-arcade text-2xl font-bold">$</span>
              <input type="number" value={totalBudget} onChange={e => handleBudgetChange(Number(e.target.value))}
                className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/15 rounded-xl text-emerald-400 font-arcade text-2xl font-bold focus:outline-none focus:border-amber-500" />
            </div>
          </div>

          {/* Secondary email */}
          <div>
            <p className="font-sans text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">SEGUNDO EMAIL AUTORIZADO</p>
            <p className="font-body text-xs text-white/50 mb-2">fernandocastrofiore@gmail.com siempre tiene acceso.</p>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input type="email" placeholder="otro@gmail.com" value={secondaryEmail} onChange={e => setSecondaryEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white font-body text-sm focus:outline-none focus:border-amber-500" />
            </div>
          </div>

          {/* Jars */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="font-sans text-xs font-bold text-amber-400 uppercase tracking-wider">FRASCOS</p>
              <button type="button" onClick={addJar} className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-body text-xs font-bold transition-colors">
                <Plus size={14} /> Agregar
              </button>
            </div>
            <div className="space-y-2">
              {jars.map(jar => (
                <div key={jar.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3">
                  <input type="color" value={jar.color} onChange={e => handleJarChange(jar.id, 'color', e.target.value)} className="w-6 h-6 border-0 cursor-pointer bg-transparent shrink-0" />
                  <input type="text" value={jar.name} onChange={e => handleJarChange(jar.id, 'name', e.target.value)}
                    className="flex-1 bg-transparent text-white font-body text-sm font-medium focus:outline-none min-w-0" />
                  <input type="number" value={jar.allocatedBudget} onChange={e => handleJarChange(jar.id, 'allocatedBudget', Number(e.target.value))}
                    className="w-28 bg-white/5 border border-white/15 rounded-lg px-2.5 py-1.5 text-amber-300 font-arcade text-lg font-bold text-right focus:outline-none" />
                  <button type="button" onClick={() => removeJar(jar.id)} className="text-white/30 hover:text-red-400 shrink-0 p-1 transition-colors"><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-body font-bold text-base flex items-center justify-center gap-2 mt-4 shadow-lg shadow-amber-500/20 transition-all cursor-pointer">
            <Save size={16} />
            <span>{loading ? 'Guardando...' : 'Guardar Ajustes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
