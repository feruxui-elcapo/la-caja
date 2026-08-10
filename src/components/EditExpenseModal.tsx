import React, { useState, useEffect } from 'react';
import type { Expense, Jar } from '../types';
import { X, Edit3, AlertCircle, Calendar } from 'lucide-react';
import { soundFX } from '../utils/audio';

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  jars: Jar[];
  onUpdateExpense: (expenseId: string, updatedFields: Partial<Expense>) => Promise<void>;
}

const toDatetimeLocal = (isoString: string): string => {
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  isOpen,
  onClose,
  expense,
  jars,
  onUpdateExpense
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedJarId, setSelectedJarId] = useState('');
  const [datetimeLocal, setDatetimeLocal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && expense) {
      setError('');
      setDescription(expense.description || '');
      setAmount(String(expense.amount || ''));
      setSelectedJarId(expense.jarId || (jars[0]?.id ?? ''));
      setDatetimeLocal(toDatetimeLocal(expense.date));
    }
  }, [isOpen, expense, jars]);

  if (!isOpen || !expense) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanAmountStr = amount.replace(',', '.').replace(/[^0-9.]/g, '');
    const num = parseFloat(cleanAmountStr);

    if (!description.trim()) {
      setError('Por favor indicá el concepto.');
      return;
    }
    if (isNaN(num) || num <= 0) {
      setError('Por favor ingresá un monto mayor a 0.');
      return;
    }
    if (!datetimeLocal) {
      setError('Por favor elegí una fecha y hora válida.');
      return;
    }

    const selectedDate = new Date(datetimeLocal);
    if (isNaN(selectedDate.getTime())) {
      setError('Fecha inválida.');
      return;
    }

    const jar = jars.find(j => j.id === selectedJarId) || jars[0];

    try {
      setLoading(true);
      await onUpdateExpense(expense.id, {
        description: description.trim(),
        amount: num,
        jarId: jar.id,
        jarName: jar.name,
        date: selectedDate.toISOString()
      });

      soundFX.playPowerup();
      setLoading(false);
      onClose();
    } catch (err: any) {
      console.error('Error al editar gasto:', err);
      setError(err?.message ? `Error: ${err.message}` : 'No se pudo guardar la edición.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '14px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F59E0B'
            }}>
              <Edit3 size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-pixel" style={{ fontWeight: 700, fontSize: '20px', color: '#FFFFFF', margin: 0, letterSpacing: '0.02em' }}>
                Editar Gasto
              </h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                Modificá la fecha o detalles del registro
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.4)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#FCA5A5', backgroundColor: 'rgba(153, 27, 27, 0.6)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '16px', padding: '14px', marginBottom: '24px', fontSize: '14px' }}>
            <AlertCircle size={18} style={{ color: '#EF4444', shrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* SECTION 1: Date & Time Picker */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#FBBF24', marginBottom: '8px', letterSpacing: '0.05em' }}>
              FECHA Y HORA DEL GASTO
            </label>
            <div style={{ position: 'relative', width: '100%' }}>
              <Calendar
                size={18}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#F59E0B',
                  pointerEvents: 'none',
                  zIndex: 2
                }}
              />
              <input
                type="datetime-local"
                value={datetimeLocal}
                onChange={e => setDatetimeLocal(e.target.value)}
                style={{
                  width: '100%',
                  height: '50px',
                  paddingLeft: '44px',
                  paddingRight: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  borderRadius: '16px',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 600,
                  outline: 'none',
                  colorScheme: 'dark'
                }}
              />
            </div>
          </div>

          {/* SECTION 2: Jar selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '8px', letterSpacing: '0.05em' }}>
              FRASCO
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {jars.map(jar => {
                const isSelected = jar.id === selectedJarId;
                return (
                  <button
                    key={jar.id}
                    type="button"
                    onClick={() => { soundFX.playClick(); setSelectedJarId(jar.id); }}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '14px',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      color: isSelected ? '#FDE047' : 'rgba(255, 255, 255, 0.7)',
                      border: isSelected ? '2px solid #F59E0B' : '1px solid rgba(255, 255, 255, 0.12)'
                    }}
                  >
                    <span>{jar.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: Description */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '8px', letterSpacing: '0.05em' }}>
              CONCEPTO / DETALLE
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{
                width: '100%',
                height: '50px',
                padding: '0 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '16px',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 500,
                outline: 'none'
              }}
            />
          </div>

          {/* SECTION 4: Amount Input */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '8px', letterSpacing: '0.05em' }}>
              MONTO ($)
            </label>
            <div style={{ position: 'relative', width: '100%' }}>
              <span 
                className="font-arcade"
                style={{ 
                  position: 'absolute', 
                  left: '16px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: '#10B981', 
                  fontSize: '24px', 
                  fontWeight: 700, 
                  pointerEvents: 'none',
                  zIndex: 2
                }}
              >
                $
              </span>
              <input
                type="number"
                step="any"
                placeholder="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="font-arcade"
                style={{
                  width: '100%',
                  height: '50px',
                  paddingLeft: '44px',
                  paddingRight: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '16px',
                  color: '#10B981',
                  fontSize: '24px',
                  fontWeight: 700,
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '14px', paddingTop: '8px' }}>
            <button 
              type="button" 
              onClick={onClose} 
              style={{
                flex: 1,
                height: '50px',
                borderRadius: '16px',
                fontWeight: 700,
                fontSize: '15px',
                color: 'rgba(255,255,255,0.8)',
                backgroundColor: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Cancelar
            </button>

            <button 
              type="submit" 
              disabled={loading} 
              style={{
                flex: 1.2,
                height: '50px',
                borderRadius: '16px',
                fontWeight: 700,
                fontSize: '15px',
                color: '#000000',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                border: 'none',
                boxShadow: '0 4px 16px rgba(245, 158, 11, 0.4)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <Edit3 size={18} strokeWidth={2.5} />
              <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
