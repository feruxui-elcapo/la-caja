import React, { useState, useEffect } from 'react';
import type { Jar } from '../types';
import { X, Minus, DollarSign, Tag, Archive } from 'lucide-react';
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
  isOpen,
  onClose,
  jars,
  preselectedJarId,
  onAddExpense
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedJarId, setSelectedJarId] = useState(jars[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (preselectedJarId) {
      setSelectedJarId(preselectedJarId);
    } else if (jars.length > 0) {
      setSelectedJarId(jars[0].id);
    }
  }, [preselectedJarId, jars]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (!description.trim()) {
      setError('Escribí una descripción.');
      return;
    }

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Ingresá un monto mayor a $0.');
      return;
    }

    const selectedJar = jars.find(j => j.id === selectedJarId);
    if (!selectedJar) {
      setError('Seleccioná un frasco.');
      return;
    }

    try {
      setLoading(true);
      await onAddExpense(
        description.trim(),
        numAmount,
        selectedJar.id,
        selectedJar.name
      );

      // Play 8-bit sound
      soundFX.playCoinDeduct();

      // Confetti burst
      confetti({
        particleCount: 30,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#EF4444', '#F59E0B', '#10B981']
      });

      setDescription('');
      setAmount('');
      setLoading(false);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al guardar.');
      setLoading(false);
    }
  };

  return (
    <div className="pixel-modal-overlay" onClick={onClose}>
      <div className="pixel-modal-card rounded-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-3 border-b-3 border-black">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-500 border-2 border-black text-white rounded-lg shadow-[2px_2px_0_0_#000]">
              <Minus size={20} strokeWidth={3} />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-pixel-title text-white">ANOTAR GASTO</h3>
              <p className="text-[10px] font-pixel-title text-amber-300 mt-1">{"( > ﹏ < )"} Sacar dinero del frasco</p>
            </div>
          </div>
          <button 
            onClick={() => { soundFX.playClick(); onClose(); }}
            className="p-1.5 text-gray-400 hover:text-white bg-black border-2 border-gray-700 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950 border-2 border-red-500 rounded-xl text-red-300 text-xs font-pixel-title">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Jar Selector */}
          <div>
            <label className="block text-[10px] font-pixel-title text-amber-300 uppercase mb-2 flex items-center gap-1.5">
              <Archive size={14} className="text-amber-400" />
              <span>FRASCO A DESCONTAR</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {jars.map((jar) => {
                const isSelected = jar.id === selectedJarId;
                return (
                  <button
                    type="button"
                    key={jar.id}
                    onClick={() => { soundFX.playClick(); setSelectedJarId(jar.id); }}
                    className={`p-3 rounded-xl border-3 text-left transition-all flex items-center gap-2.5 ${
                      isSelected 
                        ? 'bg-amber-500 text-black border-black font-pixel-title text-xs shadow-[3px_3px_0_0_#000]' 
                        : 'bg-black text-gray-300 border-gray-800 hover:border-amber-500 text-xs font-pixel-body'
                    }`}
                  >
                    <div 
                      className="w-3 h-3 rounded-full shrink-0 border border-black" 
                      style={{ backgroundColor: jar.color || '#F59E0B' }} 
                    />
                    <span className="truncate">{jar.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-pixel-title text-amber-300 uppercase mb-1 flex items-center gap-1.5">
              <Tag size={14} className="text-amber-400" />
              <span>DESCRIPCIÓN DEL GASTO</span>
            </label>
            <input
              type="text"
              placeholder="Ej: Supermercado, Luz, Taxi"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-[#000] border-3 border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 font-pixel-body text-base font-bold"
              required
              autoFocus
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-[10px] font-pixel-title text-emerald-400 uppercase mb-1 flex items-center gap-1.5">
              <DollarSign size={14} className="text-emerald-400" />
              <span>MONTO ($)</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-pixel-title text-sm">$</span>
              <input
                type="number"
                step="any"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 bg-[#000] border-3 border-gray-700 rounded-xl text-emerald-300 placeholder-gray-600 focus:outline-none focus:border-emerald-500 font-pixel-title text-lg"
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t-3 border-black">
            <button
              type="button"
              onClick={onClose}
              className="btn-pixel bg-gray-800 text-gray-300 py-3 px-4 rounded-xl text-xs flex-1"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-pixel btn-pixel-red py-3 px-4 rounded-xl text-xs flex-1"
            >
              {loading ? 'GUARDANDO...' : '- RESTAR GASTO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
