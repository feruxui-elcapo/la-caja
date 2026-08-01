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
          <span className="font-pixel text-[0.6rem] text-white">AJUSTES</span>
          <button onClick={onClose} className="text-white/30 hover:text-white"><X size={18} /></button>
        </div>

        {saved && <div className="flex items-center gap-2 text-emerald-400 font-body text-xs mb-4 bg-emerald-950/50 border border-emerald-500/20 rounded-lg p-2"><CheckCircle2 size={14} /><span>Guardado.</span></div>}
        {error && <p className="text-red-400 font-body text-xs mb-4">{error}</p>}

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto space-y-5">
          {/* Budget */}
          <div>
            <p className="font-pixel text-[0.5rem] text-white/50 mb-2">PRESUPUESTO MENSUAL TOTAL</p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-pixel text-sm">$</span>
              <input type="number" value={totalBudget} onChange={e => handleBudgetChange(Number(e.target.value))}
                className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-amber-400 font-pixel text-lg focus:outline-none focus:border-amber-500" />
            </div>
          </div>

          {/* Secondary email */}
          <div>
            <p className="font-pixel text-[0.5rem] text-white/50 mb-2">SEGUNDO EMAIL AUTORIZADO</p>
            <p className="font-body text-xs text-white/30 mb-2">fernandocastrofiore@gmail.com siempre tiene acceso.</p>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input type="email" placeholder="otro@gmail.com" value={secondaryEmail} onChange={e => setSecondaryEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-body text-sm focus:outline-none focus:border-amber-500" />
            </div>
          </div>

          {/* Jars */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="font-pixel text-[0.5rem] text-white/50">FRASCOS</p>
              <button type="button" onClick={addJar} className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-pixel text-[0.5rem]">
                <Plus size={12} /> Agregar
              </button>
            </div>
            <div className="space-y-2">
              {jars.map(jar => (
                <div key={jar.id} className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center gap-3">
                  <input type="color" value={jar.color} onChange={e => handleJarChange(jar.id, 'color', e.target.value)} className="w-5 h-5 border-0 cursor-pointer bg-transparent shrink-0" />
                  <input type="text" value={jar.name} onChange={e => handleJarChange(jar.id, 'name', e.target.value)}
                    className="flex-1 bg-transparent text-white font-body text-sm focus:outline-none min-w-0" />
                  <input type="number" value={jar.allocatedBudget} onChange={e => handleJarChange(jar.id, 'allocatedBudget', Number(e.target.value))}
                    className="w-24 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-amber-300 font-pixel text-[0.5rem] text-right focus:outline-none" />
                  <button type="button" onClick={() => removeJar(jar.id)} className="text-white/20 hover:text-red-400 shrink-0"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-pixel bg-amber-500 text-black w-full py-3 rounded-xl flex items-center justify-center gap-2 mt-2">
            <Save size={14} />
            <span>{loading ? '...' : 'Guardar'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
