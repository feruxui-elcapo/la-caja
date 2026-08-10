import React, { useState, useEffect } from 'react';
import type { Jar } from '../types';
import { X, Minus, AlertCircle } from 'lucide-react';
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

  // Sync selectedJarId whenever modal opens or jars change
  useEffect(() => {
    if (isOpen) {
      setError('');
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

    if (!description.trim()) { setError('Por favor indicá qué gastaste.'); return; }
    if (isNaN(num) || num <= 0) { setError('Por favor ingresá un monto mayor a 0.'); return; }
    
    const jar = jars.find(j => j.id === selectedJarId) || jars[0];
    if (!jar) { setError('Elegí un frasco para descontar.'); return; }

    try {
      setLoading(true);
      await onAddExpense(description.trim(), num, jar.id, jar.name);
      
      soundFX.playCoinDeduct();
      confetti({ particleCount: 30, spread: 70, origin: { y: 0.7 }, colors: ['#EF4444', '#F59E0B', '#10B981'] });
      
      setDescription(''); 
      setAmount(''); 
      setLoading(false);
      onClose();
    } catch (err: any) {
      console.error("Error al guardar gasto:", err);
      setError(err?.message ? `Error: ${err.message}` : 'No se pudo guardar el gasto.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '14px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#EF4444'
            }}>
              <Minus size={22} strokeWidth={3} />
            </div>
            <div>
              <h3 className="font-pixel" style={{ fontWeight: 700, fontSize: '20px', color: '#FFFFFF', margin: 0, letterSpacing: '0.02em' }}>
                Anotar Gasto
              </h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                Restá saldo de tus frascos
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
          
          {/* SECTION 1: Jar selector */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#FBBF24', marginBottom: '10px', letterSpacing: '0.05em' }}>
              ELEGÍ EL FRASCO
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
                      padding: '14px 16px',
                      borderRadius: '16px',
                      fontSize: '15px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      backgroundColor: isSelected ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      color: isSelected ? '#FDE047' : 'rgba(255, 255, 255, 0.7)',
                      border: isSelected ? '2px solid #F59E0B' : '1px solid rgba(255, 255, 255, 0.12)',
                      boxShadow: isSelected ? '0 4px 16px rgba(245, 158, 11, 0.3)' : 'none',
                      transform: isSelected ? 'scale(1.02)' : 'none'
                    }}
                  >
                    <span>{jar.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: Description */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '10px', letterSpacing: '0.05em' }}>
              CONCEPTO / DETALLE
            </label>
            <input
              type="text"
              placeholder="Ej: Supermercado, Farmacia, Cena..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{
                width: '100%',
                height: '52px',
                padding: '0 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '16px',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 500,
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              autoFocus
            />
          </div>

          {/* SECTION 3: Amount Input with Explicit Fixed Padding */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '10px', letterSpacing: '0.05em' }}>
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
                  fontSize: '26px', 
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
                  height: '54px',
                  paddingLeft: '44px',
                  paddingRight: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '16px',
                  color: '#10B981',
                  fontSize: '26px',
                  fontWeight: 700,
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* SECTION 4: Action buttons with Generous Gaps */}
          <div style={{ display: 'flex', gap: '14px', paddingTop: '8px' }}>
            <button 
              type="button" 
              onClick={onClose} 
              style={{
                flex: 1,
                height: '52px',
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
                height: '52px',
                borderRadius: '16px',
                fontWeight: 700,
                fontSize: '15px',
                color: '#FFFFFF',
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                border: 'none',
                boxShadow: '0 4px 16px rgba(239, 68, 68, 0.4)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <Minus size={18} strokeWidth={3} />
              <span>{loading ? 'Guardando...' : 'Restar Gasto'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
