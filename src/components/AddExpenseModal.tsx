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
  const [selectedJarId, setSelectedJarId] = useState(jars[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (preselectedJarId) setSelectedJarId(preselectedJarId);
    else if (jars.length > 0) setSelectedJarId(jars[0].id);
  }, [preselectedJarId, jars]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const num = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (!description.trim()) { setError('Escribí qué gastaste.'); return; }
    if (isNaN(num) || num <= 0) { setError('Ingresá un monto válido.'); return; }
    const jar = jars.find(j => j.id === selectedJarId);
    if (!jar) { setError('Elegí un frasco.'); return; }

    try {
      setLoading(true);
      await onAddExpense(description.trim(), num, jar.id, jar.name);
      soundFX.playCoinDeduct();
      confetti({ particleCount: 20, spread: 50, origin: { y: 0.7 }, colors: ['#EF4444', '#F59E0B'] });
      setDescription(''); setAmount(''); setLoading(false); onClose();
    } catch {
      setError('Error al guardar.'); setLoading(false);
    }
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Minus size={18} className="text-red-500" />
            <span className="font-pixel text-[0.6rem] text-white">ANOTAR GASTO</span>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white"><X size={18} /></button>
        </div>

        {error && <p className="text-red-400 font-body text-xs mb-4 bg-red-950/50 border border-red-500/30 rounded-lg p-2">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Jar selector */}
          <div>
            <p className="font-pixel text-[0.5rem] text-white/50 mb-2">FRASCO</p>
            <div className="flex gap-2">
              {jars.map(jar => (
                <button
                  key={jar.id}
                  type="button"
                  onClick={() => { soundFX.playClick(); setSelectedJarId(jar.id); }}
                  className={`flex-1 py-2.5 px-3 rounded-xl border-2 font-pixel text-[0.5rem] transition-all ${
                    jar.id === selectedJarId
                      ? 'bg-amber-500 text-black border-amber-400 shadow-[3px_3px_0_0_#000]'
                      : 'bg-white/5 text-white/60 border-white/10 hover:border-white/30'
                  }`}
                >
                  {jar.name}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="font-pixel text-[0.5rem] text-white/50 mb-2">CONCEPTO</p>
            <input
              type="text"
              placeholder="Ej: Cena, Médico..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-body text-base focus:outline-none focus:border-amber-500"
              autoFocus
            />
          </div>

          {/* Amount */}
          <div>
            <p className="font-pixel text-[0.5rem] text-white/50 mb-2">MONTO</p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 font-pixel text-sm">$</span>
              <input
                type="number"
                step="any"
                placeholder="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-emerald-400 font-pixel text-lg focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-pixel bg-white/10 text-white/60 py-2.5 px-4 rounded-xl flex-1">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-pixel bg-red-600 text-white py-2.5 px-4 rounded-xl flex-1">
              {loading ? '...' : '- Restar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
