import React, { useState, useEffect } from 'react';
import { auth, onAuthStateChanged, logout, type User } from './firebase';
import type { AppConfig, Expense, Jar } from './types';
import { 
  DEFAULT_CONFIG, 
  getCurrentMonthKey, 
  subscribeToConfig, 
  subscribeToExpenses, 
  saveConfig, 
  addExpense, 
  deleteExpense,
  updateExpense
} from './services/firestore';
import { LoginScreen } from './components/LoginScreen';
import { ResetCountdown } from './components/ResetCountdown';
import { CardboardBox } from './components/CardboardBox';
import { AddExpenseModal } from './components/AddExpenseModal';
import { EditExpenseModal } from './components/EditExpenseModal';
import { 
  Home, 
  History, 
  User as UserIcon, 
  Trash2, 
  Edit3,
  Save, 
  LogOut, 
  CheckCircle2, 
  Search,
  Download
} from 'lucide-react';
import { soundFX } from './utils/audio';

type Tab = 'home' | 'history' | 'profile';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Firestore & Local State
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Navigation & Modal state
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [preselectedJarId, setPreselectedJarId] = useState<string | undefined>(undefined);

  // Profile Form state
  const [totalBudget, setTotalBudget] = useState<number>(300000);
  const [secondaryEmail, setSecondaryEmail] = useState<string>('');
  const [jars, setJars] = useState<Jar[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [historySearch, setHistorySearch] = useState('');

  // PWA Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Config
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToConfig((newConfig) => {
      setConfig(newConfig);
      setTotalBudget(newConfig.totalMonthlyBudget || 300000);
      setSecondaryEmail(newConfig.secondaryEmail || '');
      setJars(newConfig.jars || []);
    });
    return () => unsubscribe();
  }, [user]);

  // Subscribe to Expenses
  useEffect(() => {
    if (!user) return;
    const currentMonthKey = getCurrentMonthKey();
    const unsubscribe = subscribeToExpenses(currentMonthKey, (fetchedExpenses) => {
      setExpenses(fetchedExpenses);
    });
    return () => unsubscribe();
  }, [user]);

  // Authorization Check
  const allowedList = [
    'fernandocastrofiore@gmail.com',
    ...(config.allowedEmails || []),
    ...(config.secondaryEmail ? [config.secondaryEmail.toLowerCase().trim()] : [])
  ];

  const userEmail = user?.email?.toLowerCase().trim() || '';
  const isAuthorized = allowedList.some(e => e.toLowerCase().trim() === userEmail);

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: "'Pixelify Sans', monospace", fontWeight: 700, fontSize: '16px', color: '#F59E0B' }}>
          Cargando La Caja...
        </div>
      </div>
    );
  }

  if (!user || !isAuthorized) {
    return <LoginScreen user={user} isAuthorized={isAuthorized} allowedEmails={allowedList} />;
  }

  const handleOpenAddExpense = (jar?: Jar) => {
    setPreselectedJarId(jar?.id);
    setIsAddExpenseOpen(true);
  };

  const handleAddExpenseSubmit = async (
    description: string,
    amount: number,
    jarId: string,
    jarName: string
  ) => {
    return await addExpense(
      description,
      amount,
      jarId,
      jarName,
      user.email || 'usuario',
      user.displayName || user.email?.split('@')[0] || 'Usuario'
    );
  };

  const handleUpdateExpenseSubmit = async (
    expenseId: string,
    updatedFields: Partial<Expense>
  ) => {
    await updateExpense(expenseId, updatedFields);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSec = secondaryEmail.trim().toLowerCase();
    const allowed = ['fernandocastrofiore@gmail.com'];
    if (cleanSec) allowed.push(cleanSec);

    await saveConfig({
      totalMonthlyBudget: totalBudget,
      secondaryEmail: cleanSec,
      allowedEmails: allowed,
      jars
    });

    soundFX.playPowerup();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  const filteredExpenses = expenses.filter(exp =>
    exp.description.toLowerCase().includes(historySearch.toLowerCase()) ||
    exp.jarName.toLowerCase().includes(historySearch.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0c', color: '#f3f4f6', display: 'flex', flexDirection: 'column', fontFamily: "'Pixelify Sans', monospace" }}>
      
      {/* MAIN CONTAINER */}
      <main style={{ flex: 1, maxWidth: '480px', width: '100%', margin: '0 auto', padding: activeTab === 'home' ? '20px 16px' : '24px 16px' }}>

        {/* TAB 1: INICIO */}
        {activeTab === 'home' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ResetCountdown />
            <CardboardBox
              jars={config.jars || []}
              expenses={expenses}
              totalBudget={config.totalMonthlyBudget || 300000}
              onDeductClick={handleOpenAddExpense}
            />
          </div>
        )}

        {/* TAB 2: HISTORIAL DE GASTOS */}
        {activeTab === 'history' && (
          <div>
            <h2 className="font-pixel" style={{ fontWeight: 700, fontSize: '24px', color: '#F59E0B', marginBottom: '20px', textAlign: 'center', letterSpacing: '0.04em' }}>
              Historial de Gastos
            </h2>

            {/* Search Input */}
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
              <input
                type="text"
                placeholder="Buscar gasto por concepto o frasco..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                style={{
                  width: '100%',
                  height: '48px',
                  paddingLeft: '44px',
                  paddingRight: '16px',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '16px',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 500,
                  outline: 'none'
                }}
              />
            </div>

            {/* Expenses List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredExpenses.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '15px', fontWeight: 500, padding: '48px 0', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  Sin gastos registrados este mes.
                </div>
              ) : (
                filteredExpenses.map((exp) => (
                  <div
                    key={exp.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      padding: '16px'
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1, paddingRight: '12px' }}>
                      <p style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
                        {exp.description}
                      </p>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.5)', marginTop: '4px', margin: 0 }}>
                        <span style={{ color: '#FBBF24', fontWeight: 700 }}>{exp.jarName}</span> · {fmtDate(exp.date)}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', shrink: 0 }}>
                      <span className="font-arcade" style={{ fontSize: '22px', fontWeight: 700, color: '#EF4444', letterSpacing: '0.04em' }}>
                        -{fmt(exp.amount)}
                      </span>
                      <button
                        onClick={() => {
                          soundFX.playClick();
                          setEditingExpense(exp);
                        }}
                        style={{
                          background: 'rgba(245, 158, 11, 0.12)',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          borderRadius: '12px',
                          color: '#F59E0B',
                          cursor: 'pointer',
                          padding: '8px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease'
                        }}
                        title="Editar fecha y detalles"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('¿Eliminar este gasto? El dinero volverá al frasco.')) {
                            soundFX.playClick();
                            await deleteExpense(exp.id);
                          }
                        }}
                        style={{
                          background: 'rgba(239, 68, 68, 0.12)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '12px',
                          color: '#EF4444',
                          cursor: 'pointer',
                          padding: '8px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease'
                        }}
                        title="Eliminar gasto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PERFIL Y AJUSTES */}
        {activeTab === 'profile' && (
          <div>
            <h2 className="font-pixel" style={{ fontWeight: 700, fontSize: '24px', color: '#F59E0B', marginBottom: '24px', textAlign: 'center', letterSpacing: '0.04em' }}>
              Perfil y Ajustes
            </h2>

            {/* User Profile Card */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '24px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
              {user.photoURL ? (
                <img src={user.photoURL} alt="" style={{ width: '52px', height: '52px', borderRadius: '50%', border: '2px solid #F59E0B' }} />
              ) : (
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.2)', border: '1.5px solid #F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B', fontWeight: 700 }}>
                  {user.displayName?.[0] || 'U'}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '17px', fontWeight: 700, color: '#FFFFFF', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.displayName || user.email?.split('@')[0]}
                </p>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.5)', marginTop: '4px', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.email}
                </p>
              </div>
              <button
                onClick={() => { soundFX.playClick(); logout(); }}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '14px',
                  color: '#EF4444',
                  cursor: 'pointer',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  fontWeight: 700
                }}
                title="Cerrar Sesión"
              >
                <LogOut size={16} />
                <span>Salir</span>
              </button>
            </div>

            {/* PWA Install Button */}
            {deferredPrompt && (
              <button
                onClick={async () => {
                  soundFX.playPowerup();
                  deferredPrompt.prompt();
                  await deferredPrompt.userChoice;
                  setDeferredPrompt(null);
                }}
                style={{
                  width: '100%',
                  backgroundColor: '#10B981',
                  color: '#000000',
                  fontWeight: 700,
                  fontSize: '16px',
                  padding: '16px',
                  borderRadius: '20px',
                  marginBottom: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
                  cursor: 'pointer'
                }}
              >
                <Download size={20} />
                <span>INSTALAR APP EN CELULAR</span>
              </button>
            )}

            {saveSuccess && (
              <div style={{ backgroundColor: 'rgba(16,185,129,0.15)', border: '1px solid #10B981', color: '#10B981', borderRadius: '16px', padding: '14px 16px', fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <CheckCircle2 size={20} />
                <span>Configuración guardada exitosamente.</span>
              </div>
            )}

            {/* Profile Settings Form */}
            <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#FBBF24', marginBottom: '10px', letterSpacing: '0.04em' }}>
                  PRESUPUESTO TOTAL MENSUAL ($)
                </label>
                <input
                  type="number"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(Number(e.target.value))}
                  className="font-arcade"
                  style={{ width: '100%', height: '52px', padding: '0 16px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px', color: '#34D399', fontSize: '24px', fontWeight: 700, outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '10px', letterSpacing: '0.04em' }}>
                  SEGUNDO EMAIL AUTORIZADO
                </label>
                <input
                  type="email"
                  placeholder="ej: parejacompartida@gmail.com"
                  value={secondaryEmail}
                  onChange={(e) => setSecondaryEmail(e.target.value)}
                  style={{ width: '100%', height: '52px', padding: '0 16px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px', color: '#FFFFFF', fontSize: '15px', fontWeight: 500, outline: 'none' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  height: '54px',
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  color: '#000000',
                  fontWeight: 700,
                  fontSize: '17px',
                  borderRadius: '16px',
                  border: 'none',
                  marginTop: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 18px rgba(245, 158, 11, 0.4)',
                  cursor: 'pointer'
                }}
              >
                <Save size={20} />
                <span>GUARDAR CAMBIOS</span>
              </button>
            </form>
          </div>
        )}

      </main>

      {/* MOBILE BOTTOM NAVBAR */}
      <nav className="bottom-navbar">
        <button
          onClick={() => { soundFX.playClick(); setActiveTab('home'); }}
          className={`bottom-tab-btn ${activeTab === 'home' ? 'active' : ''}`}
        >
          <Home size={22} />
          <span>INICIO</span>
        </button>

        <button
          onClick={() => { soundFX.playClick(); setActiveTab('history'); }}
          className={`bottom-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
        >
          <History size={22} />
          <span>HISTORIAL</span>
        </button>

        <button
          onClick={() => { soundFX.playClick(); setActiveTab('profile'); }}
          className={`bottom-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
        >
          <UserIcon size={22} />
          <span>PERFIL</span>
        </button>
      </nav>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        jars={config.jars || []}
        preselectedJarId={preselectedJarId}
        onAddExpense={handleAddExpenseSubmit}
      />

      {/* Edit Expense Modal */}
      <EditExpenseModal
        isOpen={!!editingExpense}
        onClose={() => setEditingExpense(null)}
        expense={editingExpense}
        jars={config.jars || []}
        onUpdateExpense={handleUpdateExpenseSubmit}
      />
    </div>
  );
};

export default App;
