import React, { useState } from 'react';
import type { Expense, Jar } from '../types';
import { X, History, Trash2, Search, Filter, Calendar } from 'lucide-react';
import { soundFX } from '../utils/audio';

interface ExpenseHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  jars: Jar[];
  onDeleteExpense: (expenseId: string) => Promise<void>;
}

export const ExpenseHistoryModal: React.FC<ExpenseHistoryModalProps> = ({
  isOpen,
  onClose,
  expenses,
  jars,
  onDeleteExpense
}) => {
  const [selectedJarFilter, setSelectedJarFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredExpenses = expenses.filter((exp) => {
    const matchesJar = selectedJarFilter === 'all' || exp.jarId === selectedJarFilter;
    const matchesSearch = exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.userName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesJar && matchesSearch;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Seguro que querés eliminar este gasto? El dinero volverá al frasco.')) {
      try {
        setDeletingId(id);
        soundFX.playClick();
        await onDeleteExpense(id);
      } catch (err) {
        console.error("Error deleting expense:", err);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="pixel-modal-overlay" onClick={onClose}>
      <div className="pixel-modal-card max-w-2xl max-h-[85vh] flex flex-col rounded-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b-3 border-black shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 border-2 border-black text-black rounded-lg shadow-[2px_2px_0_0_#000]">
              <History size={20} />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-pixel-title text-white">HISTORIAL DE GASTOS</h3>
              <p className="text-[10px] font-pixel-title text-amber-300 mt-0.5">( ◠‿◠ ) Movimientos del mes</p>
            </div>
          </div>
          <button 
            onClick={() => { soundFX.playClick(); onClose(); }}
            className="p-1.5 text-gray-400 hover:text-white bg-black border-2 border-gray-700 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filters */}
        <div className="py-3 border-b-3 border-black/50 flex flex-col sm:flex-row gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input
              type="text"
              placeholder="Buscar gasto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-black border-2 border-gray-700 rounded-xl text-white font-pixel-body text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 bg-black border-2 border-gray-700 rounded-xl px-3 py-1.5">
            <Filter size={14} className="text-amber-400 shrink-0" />
            <select
              value={selectedJarFilter}
              onChange={(e) => setSelectedJarFilter(e.target.value)}
              className="bg-transparent text-white font-pixel-title text-[10px] focus:outline-none cursor-pointer pr-2"
            >
              <option value="all" className="bg-black text-white">Todos los frascos</option>
              {jars.map((j) => (
                <option key={j.id} value={j.id} className="bg-black text-white">
                  {j.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Expenses List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-1">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <Calendar size={32} className="mx-auto mb-2 opacity-50 text-amber-400" />
              <p className="font-pixel-title text-xs">Sin gastos en esta selección.</p>
            </div>
          ) : (
            filteredExpenses.map((exp) => {
              const jar = jars.find(j => j.id === exp.jarId);
              return (
                <div
                  key={exp.id}
                  className="bg-black border-2 border-gray-800 p-3 rounded-xl flex items-center justify-between gap-3 shadow-[2px_2px_0_0_#000]"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-8 rounded-full shrink-0 border border-black" 
                      style={{ backgroundColor: jar?.color || '#F59E0B' }} 
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-pixel-title text-xs text-white">{exp.description}</span>
                        <span className="text-[8px] font-pixel-title px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">
                          {exp.jarName}
                        </span>
                      </div>
                      <div className="text-[10px] font-pixel-body text-gray-400 mt-1 flex items-center gap-2">
                        <span>{formatDate(exp.date)}</span>
                        <span>•</span>
                        <span className="text-amber-300 font-bold">{exp.userName || exp.userEmail?.split('@')[0]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-pixel-title text-xs font-bold text-red-400">
                      -{formatCurrency(exp.amount)}
                    </span>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      disabled={deletingId === exp.id}
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-950 border border-gray-800 rounded-lg transition-colors"
                      title="Eliminar gasto"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t-3 border-black text-right shrink-0">
          <button
            onClick={() => { soundFX.playClick(); onClose(); }}
            className="btn-pixel bg-gray-800 text-white text-xs px-4 py-2 rounded-xl"
          >
            CERRAR
          </button>
        </div>
      </div>
    </div>
  );
};
