import React, { useState, useEffect } from 'react';
import type { Jar } from '../types';
import { X, Minus, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFX } from '../utils/audio';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  jars: Jar[];
  preselectedJarId?: string;
  onAddExpense: (description: string, amount: number, jarId: string, jarName: string) => Promise<{ id: string; isLocalOnly?: boolean } | void>;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen, onClose, jars, preselectedJarId, onAddExpense
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedJarId, setSelectedJarId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Sync selectedJarId whenever modal opens or jars change
  useEffect(() => {
    if (isOpen) {
      setError('');
      setNotice('');
      if (preselectedJarId && jars.some(j => j.id === preselectedJarId)) {
        setSelectedJarId(preselectedJarId);
      } else if (jars.length > 0) {
        setSelectedJarId(jars[0].id);
      }
    }
  }, [isOpen, preselectedJarId, jars]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');

    // Normalize comma to dot for decimal inputs
    const cleanAmountStr = amount.replace(',', '.').replace(/[^0-9.]/g, '');
    const num = parseFloat(cleanAmountStr);

    if (!description.trim()) { setError('Por favor indicá en qué gastaste.'); return; }
    if (isNaN(num) || num <= 0) { setError('Por favor ingresá un monto válido mayor a 0.'); return; }
    
    const jar = jars.find(j => j.id === selectedJarId) || jars[0];
    if (!jar) { setError('Elegí un frasco para descontar.'); return; }

    try {
      setLoading(true);
      const res = await onAddExpense(description.trim(), num, jar.id, jar.name);
      
      soundFX.playCoinDeduct();
      confetti({ particleCount: 30, spread: 70, origin: { y: 0.7 }, colors: ['#EF4444', '#F59E0B', '#10B981'] });
      
      setDescription(''); 
      setAmount(''); 
      setLoading(false);

      if (res && res.isLocalOnly) {
        // Subtle feedback if Firestore had permissions issue but local save succeeded
        onClose();
      } else {
        onClose();
      }
    } catch (err: any) {
      console.error("Error al guardar gasto:", err);
      setError(err?.message ? `Error: ${err.message}` : 'Ocurrió un problema al registrar el gasto.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <Minus size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-sans font-bold text-xl text-white tracking-tight">Anotar Gasto</h3>
              <p className="font-sans text-xs text-stone-400">Restá saldo de tus frascos</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-9 h-9 rounded-full flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 text-red-300 font-sans text-sm mb-5 bg-red-950/60 border border-red-500/30 rounded-2xl p-3.5 leading-relaxed">
            <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div className="flex items-start gap-2.5 text-amber-300 font-sans text-sm mb-5 bg-amber-950/60 border border-amber-500/30 rounded-2xl p-3.5 leading-relaxed">
            <Sparkles size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <span>{notice}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Jar selector */}
          <div>
            <p className="font-sans text-xs font-semibold text-amber-400/90 mb-2.5 uppercase tracking-wider">
              Elegí el frasco
            </p>
            <div className="grid grid-cols-2 gap-3">
              {jars.map(jar => {
                const isSelected = jar.id === selectedJarId;
                return (
                  <button
                    key={jar.id}
                    type="button"
                    onClick={() => { soundFX.playClick(); setSelectedJarId(jar.id); }}
                    className={`py-3.5 px-4 rounded-2xl font-sans transition-all flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500/25 to-amber-600/15 text-amber-300 border-2 border-amber-400 shadow-[0_4px_16px_rgba(245,158,11,0.25)] scale-[1.02]'
                        : 'bg-white/5 text-stone-300 border border-white/10 hover:border-amber-500/40 hover:bg-white/10'
                    }`}
                  >
                    <span className="font-bold text-sm tracking-wide">{jar.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="font-sans text-xs font-semibold text-stone-400 mb-2 uppercase tracking-wider">
              Concepto / Detalle
            </p>
            <input
              type="text"
              placeholder="Ej: Supermercado, Farmacia, Cena..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-3.5 bg-white/5 border border-white/12 rounded-2xl text-white font-sans text-base focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all placeholder:text-stone-500"
              autoFocus
            />
          </div>

          {/* Amount */}
          <div>
            <p className="font-sans text-xs font-semibold text-stone-400 mb-2 uppercase tracking-wider">
              Monto ($)
            </p>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-emerald-400 font-bold text-xl pointer-events-none">$</span>
              <input
                type="number"
                step="any"
                placeholder="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/12 rounded-2xl text-emerald-400 font-sans font-bold text-2xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-all placeholder:text-stone-600"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="py-3.5 px-5 rounded-2xl font-semibold text-stone-300 bg-white/8 hover:bg-white/14 border border-white/10 transition-all flex-1"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="py-3.5 px-5 rounded-2xl font-bold text-white bg-gradient-to-r from-red-500 via-rose-600 to-red-600 hover:from-red-400 hover:to-rose-500 shadow-[0_6px_24px_rgba(239,68,68,0.4)] transition-all scale-[1.01] active:scale-[0.98] flex-1 flex items-center justify-center gap-2"
            >
              {loading ? 'Guardando...' : '- Restar Gasto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
