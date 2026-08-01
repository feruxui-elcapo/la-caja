import React, { useState } from 'react';
import type { Expense, Jar } from '../types';
import { X, Trash2 } from 'lucide-react';
import { soundFX } from '../utils/audio';

interface ExpenseHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  jars: Jar[];
  onDeleteExpense: (expenseId: string) => Promise<void>;
}

export const ExpenseHistoryModal: React.FC<ExpenseHistoryModalProps> = ({
  isOpen, onClose, expenses, jars, onDeleteExpense
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este gasto? El dinero vuelve al frasco.')) return;
    setDeletingId(id);
    try { soundFX.playClick(); await onDeleteExpense(id); } catch {}
    setDeletingId(null);
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <span className="font-pixel text-[0.6rem] text-white">HISTORIAL</span>
          <button onClick={onClose} className="text-white/30 hover:text-white"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {expenses.length === 0 ? (
            <p className="text-center text-white/30 font-body text-sm py-10">Sin gastos este mes.</p>
          ) : expenses.map(exp => (
            <div key={exp.id} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2.5 border border-white/5">
              <div className="min-w-0">
                <p className="font-body text-sm text-white truncate">{exp.description}</p>
                <p className="font-body text-xs text-white/30">{exp.jarName} · {fmtDate(exp.date)} · {exp.userName || exp.userEmail?.split('@')[0]}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className="font-pixel text-[0.5rem] text-red-400">-{fmt(exp.amount)}</span>
                <button onClick={() => handleDelete(exp.id)} disabled={deletingId === exp.id} className="p-1 text-white/20 hover:text-red-400">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
