import React, { useState, useEffect } from 'react';
import type { Jar } from '../types';
import { X, Minus } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFX } from '../utils/audio';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  jars: Jar[];
  preselectedJarId?: string;
  onAddExpense: (description: string, amount: number, jarId: string, jarName: string) => Promise<void>;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen, onClose, jars, preselectedJarId, onAddExpense
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedJarId, setSelectedJarId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync selectedJarId whenever modal opens or jars change
  useEffect(() => {
    if (isOpen) {
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

    // Normalize comma to dot for decimal inputs
    const cleanAmountStr = amount.replace(',', '.').replace(/[^0-9.]/g, '');
    const num = parseFloat(cleanAmountStr);

    if (!description.trim()) { setError('Escribí qué gastaste.'); return; }
    if (isNaN(num) || num <= 0) { setError('Ingresá un monto válido.'); return; }
    
    const jar = jars.find(j => j.id === selectedJarId) || jars[0];
    if (!jar) { setError('Elegí un frasco.'); return; }

    try {
      setLoading(true);
      await onAddExpense(description.trim(), num, jar.id, jar.name);
      soundFX.playCoinDeduct();
      confetti({ particleCount: 25, spread: 60, origin: { y: 0.7 }, colors: ['#EF4444', '#F59E0B'] });
      setDescription(''); 
      setAmount(''); 
      setLoading(false); 
      onClose();
    } catch (err: any) {
      console.error("Error al guardar gasto:", err);
      setError(err?.message ? `Error: ${err.message}` : 'Error al guardar. Verificá tu conexión.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-red-500/20 rounded-lg border border-red-500/30">
              <Minus size={18} className="text-red-400" />
            </div>
            <span className="font-pixel text-[0.65rem] text-white tracking-wider">ANOTAR GASTO</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <p className="text-red-300 font-body text-sm mb-5 bg-red-950/70 border border-red-500/40 rounded-xl p-3 leading-relaxed">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Jar selector */}
          <div>
            <p className="font-pixel text-[0.55rem] text-amber-400/80 mb-3 tracking-wider">ELEGÍ EL FRASCO</p>
            <div className="grid grid-cols-2 gap-3.5">
              {jars.map(jar => {
                const isSelected = jar.id === selectedJarId;
                return (
                  <button
                    key={jar.id}
                    type="button"
                    onClick={() => { soundFX.playClick(); setSelectedJarId(jar.id); }}
                    className={`py-3 px-4 rounded-xl font-pixel text-[0.58rem] transition-all flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-amber-500 text-black border-2 border-amber-300 shadow-[0_4px_12px_rgba(245,158,11,0.35)] scale-[1.02]'
                        : 'bg-white/5 text-white/70 border border-white/10 hover:border-amber-500/40 hover:bg-white/10'
                    }`}
                  >
                    <span>{jar.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="font-pixel text-[0.55rem] text-white/60 mb-2 tracking-wider">CONCEPTO / DETALLE</p>
            <input
              type="text"
              placeholder="Ej: Supermercado, Farmacia..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-xl text-white font-body text-base focus:outline-none focus:border-amber-500 transition-colors"
              autoFocus
            />
          </div>

          {/* Amount */}
          <div>
            <p className="font-pixel text-[0.55rem] text-white/60 mb-2 tracking-wider">MONTO ($)</p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400/70 font-pixel text-base">$</span>
              <input
                type="number"
                step="any"
                placeholder="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-3.5 bg-white/5 border border-white/15 rounded-xl text-emerald-400 font-pixel text-lg focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {/* Action buttons with generous spacing */}
          <div className="flex gap-4 pt-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-pixel bg-white/10 hover:bg-white/15 text-white/80 py-3.5 px-4 rounded-xl flex-1 border border-white/10"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="btn-pixel bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white py-3.5 px-4 rounded-xl flex-1 shadow-[0_4px_14px_rgba(239,68,68,0.4)]"
            >
              {loading ? 'Guardando...' : '- Restar Gasto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

