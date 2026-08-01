import React, { useState } from 'react';
import type { AppConfig, Jar } from '../types';
import { X, Settings, DollarSign, Users, Plus, Trash2, Save, Mail, CheckCircle2 } from 'lucide-react';
import { soundFX } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSaveConfig: (newConfig: Partial<AppConfig>) => Promise<void>;
  currentUserEmail: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig
}) => {
  const [totalBudget, setTotalBudget] = useState<number>(config.totalMonthlyBudget || 1000000);
  const [secondaryEmail, setSecondaryEmail] = useState<string>(config.secondaryEmail || '');
  const [jars, setJars] = useState<Jar[]>(config.jars || []);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleJarChange = (id: string, field: keyof Jar, value: any) => {
    setJars(prev => prev.map(j => {
      if (j.id === id) {
        const updated = { ...j, [field]: value };
        if (field === 'percentage') {
          updated.allocatedBudget = Math.round((totalBudget * (Number(value) || 0)) / 100);
        }
        return updated;
      }
      return j;
    }));
  };

  const handleTotalBudgetChange = (val: number) => {
    setTotalBudget(val);
    setJars(prev => prev.map(j => ({
      ...j,
      allocatedBudget: Math.round((val * (j.percentage || 0)) / 100)
    })));
  };

  const handleAddJar = () => {
    soundFX.playClick();
    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', '#14B8A6'];
    const newId = String(Date.now());
    const nextColor = colors[jars.length % colors.length];
    setJars(prev => [
      ...prev,
      {
        id: newId,
        name: 'Nuevo Frasco',
        percentage: 10,
        allocatedBudget: Math.round((totalBudget * 10) / 100),
        color: nextColor,
        icon: 'box'
      }
    ]);
  };

  const handleRemoveJar = (id: string) => {
    soundFX.playClick();
    if (jars.length <= 1) {
      alert('Debe haber al menos 1 frasco de gastos.');
      return;
    }
    setJars(prev => prev.filter(j => j.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (totalBudget <= 0) {
      setErrorMsg('El presupuesto debe ser mayor a $0.');
      return;
    }

    const cleanSecondary = secondaryEmail.trim().toLowerCase();
    const allowedEmails = ['fernandocastrofiore@gmail.com'];
    if (cleanSecondary) {
      allowedEmails.push(cleanSecondary);
    }

    try {
      setLoading(true);
      await onSaveConfig({
        totalMonthlyBudget: totalBudget,
        secondaryEmail: cleanSecondary,
        allowedEmails,
        jars
      });

      soundFX.playPowerup();
      setSuccessMsg('¡Ajustes guardados con éxito! ( ◠‿◠ )');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      setErrorMsg('Error al guardar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pixel-modal-overlay" onClick={onClose}>
      <div className="pixel-modal-card max-w-2xl max-h-[85vh] flex flex-col rounded-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b-3 border-black shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 border-2 border-black text-black rounded-lg shadow-[2px_2px_0_0_#000]">
              <Settings size={20} />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-pixel-title text-white">CONFIGURACIÓN</h3>
              <p className="text-[10px] font-pixel-title text-amber-300 mt-0.5">Ajustes de presupuesto y mails autorizados</p>
            </div>
          </div>
          <button 
            onClick={() => { soundFX.playClick(); onClose(); }}
            className="p-1.5 text-gray-400 hover:text-white bg-black border-2 border-gray-700 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {successMsg && (
          <div className="mt-3 p-3 bg-emerald-950 border-2 border-emerald-500 rounded-xl text-emerald-300 text-xs font-pixel-title flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-3 p-3 bg-red-950 border-2 border-red-500 rounded-xl text-red-300 text-xs font-pixel-title">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          {/* Total Budget */}
          <div className="bg-black border-2 border-gray-800 p-4 rounded-xl shadow-[3px_3px_0_0_#000]">
            <label className="block text-[10px] font-pixel-title text-amber-300 uppercase mb-2 flex items-center gap-2">
              <DollarSign size={16} className="text-emerald-400" />
              <span>PRESUPUESTO MENSUAL TOTAL ($)</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-pixel-title">$</span>
              <input
                type="number"
                value={totalBudget}
                onChange={(e) => handleTotalBudgetChange(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-3 bg-[#000] border-2 border-gray-700 rounded-xl text-amber-300 font-pixel-title text-lg focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          {/* Allowed Emails */}
          <div className="bg-black border-2 border-gray-800 p-4 rounded-xl shadow-[3px_3px_0_0_#000]">
            <label className="block text-[10px] font-pixel-title text-amber-300 uppercase mb-2 flex items-center gap-2">
              <Users size={16} className="text-amber-400" />
              <span>MAILS AUTORIZADOS (GOOGLE LOGIN)</span>
            </label>

            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 p-2.5 rounded-lg">
                <Mail size={16} className="text-emerald-400 shrink-0" />
                <span className="font-pixel-title text-[10px] text-gray-200 flex-1">fernandocastrofiore@gmail.com</span>
                <span className="text-[8px] font-pixel-title bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                  TITULAR
                </span>
              </div>

              <div>
                <label className="text-[10px] font-pixel-body text-gray-400">Segundo mail autorizado:</label>
                <div className="relative mt-1">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                  <input
                    type="email"
                    placeholder="Escribí el otro mail de Google..."
                    value={secondaryEmail}
                    onChange={(e) => setSecondaryEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white font-pixel-body text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Jars List */}
          <div className="bg-black border-2 border-gray-800 p-4 rounded-xl shadow-[3px_3px_0_0_#000]">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-[10px] font-pixel-title text-amber-300 uppercase">
                FRASCOS (CATEGORÍAS)
              </label>
              <button
                type="button"
                onClick={handleAddJar}
                className="btn-pixel btn-pixel-amber px-2.5 py-1 rounded text-[9px] flex items-center gap-1"
              >
                <Plus size={12} />
                <span>NUEVO FRASCO</span>
              </button>
            </div>

            <div className="space-y-3">
              {jars.map((jar) => (
                <div key={jar.id} className="bg-gray-900 border border-gray-700 p-3 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={jar.color || '#F59E0B'}
                      onChange={(e) => handleJarChange(jar.id, 'color', e.target.value)}
                      className="w-6 h-6 border-0 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={jar.name}
                      onChange={(e) => handleJarChange(jar.id, 'name', e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-black border border-gray-700 rounded text-white font-pixel-title text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveJar(jar.id)}
                      className="p-1.5 text-gray-500 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-[9px] font-pixel-title text-gray-400 mb-1">% PRESUPUESTO</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={jar.percentage}
                        onChange={(e) => handleJarChange(jar.id, 'percentage', Number(e.target.value))}
                        className="w-full px-2 py-1 bg-black border border-gray-700 rounded text-white font-pixel-title text-xs"
                      />
                    </div>
                    <div>
                      <span className="block text-[9px] font-pixel-title text-gray-400 mb-1">MONTO ($)</span>
                      <input
                        type="number"
                        value={jar.allocatedBudget}
                        onChange={(e) => handleJarChange(jar.id, 'allocatedBudget', Number(e.target.value))}
                        className="w-full px-2 py-1 bg-black border border-gray-700 rounded text-amber-300 font-pixel-title text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-pixel btn-pixel-amber py-3 px-4 rounded-xl text-xs w-full flex items-center justify-center gap-2"
            >
              <Save size={16} />
              <span>{loading ? 'GUARDANDO...' : 'GUARDAR CONFIGURACIÓN'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
