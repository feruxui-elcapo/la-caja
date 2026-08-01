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
  deleteExpense 
} from './services/firestore';
import { LoginScreen } from './components/LoginScreen';
import { ResetCountdown } from './components/ResetCountdown';
import { CardboardBox } from './components/CardboardBox';
import { AddExpenseModal } from './components/AddExpenseModal';
import { 
  Home, 
  History, 
  User as UserIcon, 
  Trash2, 
  Plus, 
  Save, 
  Mail, 
  LogOut, 
  CheckCircle2, 
  Search,
  DollarSign,
  Download
} from 'lucide-react';
import { soundFX } from './utils/audio';

type Tab = 'home' | 'history' | 'profile';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Firestore App State
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Navigation & Modal state
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
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
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '11px', color: '#F59E0B' }}>
          CARGANDO LA CAJA...
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
    await addExpense(
      description,
      amount,
      jarId,
      jarName,
      user.email || 'usuario',
      user.displayName || user.email?.split('@')[0] || 'Usuario'
    );
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
    setTimeout(() => setSaveSuccess(false), 2000);
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
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      
      {/* MAIN BODY AREA (NO TOPBAR!) */}
      <main style={{ flex: 1, maxWidth: '480px', width: '100%', margin: '0 auto', padding: '20px 16px' }}>

        {/* TAB 1: INICIO (2 Jars Side by Side) */}
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
            <h2 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '12px', color: '#F59E0B', marginBottom: '16px', textAlign: 'center' }}>
              HISTORIAL DE GASTOS
            </h2>

            {/* Search Input */}
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
              <input
                type="text"
                placeholder="Buscar gasto..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '36px',
                  paddingRight: '12px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontFamily: "'Pixelify Sans', 'VT323', monospace",
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Expenses List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredExpenses.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontFamily: "'Pixelify Sans', monospace", fontSize: '14px', padding: '40px 0' }}>
                  Sin gastos registrados este mes.
                </p>
              ) : (
                filteredExpenses.map((exp) => (
                  <div
                    key={exp.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      padding: '12px 14px'
                    }}
                  >
                    <div>
                      <p style={{ fontFamily: "'Pixelify Sans', monospace", fontSize: '15px', color: '#fff', fontWeight: 'bold' }}>
                        {exp.description}
                      </p>
                      <p style={{ fontFamily: "'Pixelify Sans', monospace", fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                        {exp.jarName} · {fmtDate(exp.date)}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px', color: '#EF4444' }}>
                        -{fmt(exp.amount)}
                      </span>
                      <button
                        onClick={async () => {
                          if (confirm('¿Eliminar gasto? El dinero volverá al frasco.')) {
                            soundFX.playClick();
                            await deleteExpense(exp.id);
                          }
                        }}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          borderRadius: '8px',
                          color: '#F87171',
                          cursor: 'pointer',
                          padding: '6px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease'
                        }}
                        title="Eliminar gasto"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PERFIL & AJUSTES */}
        {activeTab === 'profile' && (
          <div>
            <h2 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '12px', color: '#F59E0B', marginBottom: '24px', textAlign: 'center' }}>
              MI PERFIL Y AJUSTES
            </h2>

            {/* Active User Card */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '18px', display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
              {user.photoURL ? (
                <img src={user.photoURL} alt="" style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid #F59E0B' }} />
              ) : (
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#5c3e1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserIcon size={22} color="#F59E0B" />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '10px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.displayName || user.email?.split('@')[0]}
                </p>
                <p style={{ fontFamily: "'Pixelify Sans', monospace", fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                  {user.email}
                </p>
              </div>
              <button
                onClick={() => { soundFX.playClick(); logout(); }}
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '10px',
                  color: '#EF4444',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontFamily: "'Pixelify Sans', monospace"
                }}
                title="Cerrar Sesión"
              >
                <LogOut size={16} />
                <span>Salir</span>
              </button>
            </div>

            {/* PWA Install Button inside Profile */}
            {deferredPrompt && (
              <button
                onClick={async () => {
                  soundFX.playPowerup();
                  deferredPrompt.prompt();
                  await deferredPrompt.userChoice;
                  setDeferredPrompt(null);
                }}
                className="btn-pixel"
                style={{ width: '100%', backgroundColor: '#10B981', color: '#fff', padding: '14px', borderRadius: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
              >
                <Download size={18} />
                <span>INSTALAR APP EN CELULAR</span>
              </button>
            )}

            {saveSuccess && (
              <div style={{ backgroundColor: 'rgba(16,185,129,0.15)', border: '1px solid #10B981', color: '#10B981', borderRadius: '12px', padding: '12px 14px', fontSize: '13px', fontFamily: "'Pixelify Sans', monospace", display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <CheckCircle2 size={18} />
                <span>Configuración guardada exitosamente.</span>
              </div>
            )}

            {/* Profile Settings Form */}
            <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontFamily: "'Press Start 2P', monospace", fontSize: '8px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                  PRESUPUESTO TOTAL MENSUAL ($)
                </label>
                <input
                  type="number"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(Number(e.target.value))}
                  style={{ width: '100%', padding: '14px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', color: '#FBBF24', fontFamily: "'Press Start 2P', monospace", fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: "'Press Start 2P', monospace", fontSize: '8px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                  SEGUNDO EMAIL AUTORIZADO
                </label>
                <input
                  type="email"
                  placeholder="ej: parejacompartida@gmail.com"
                  value={secondaryEmail}
                  onChange={(e) => setSecondaryEmail(e.target.value)}
                  style={{ width: '100%', padding: '14px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', color: '#fff', fontFamily: "'Pixelify Sans', monospace", fontSize: '15px', outline: 'none' }}
                />
              </div>

              <button
                type="submit"
                className="btn-pixel"
                style={{
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  color: '#000',
                  padding: '14px 20px',
                  borderRadius: '14px',
                  marginTop: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)'
                }}
              >
                <Save size={18} />
                <span>GUARDAR CAMBIOS</span>
              </button>
            </form>
          </div>
        )}

      </main>

      {/* MOBILE BOTTOM NAVBAR (TIPO ANDROID) */}
      <nav className="bottom-navbar">
        <button
          onClick={() => { soundFX.playClick(); setActiveTab('home'); }}
          className={`bottom-tab-btn ${activeTab === 'home' ? 'active' : ''}`}
        >
          <Home size={20} />
          <span>INICIO</span>
        </button>

        <button
          onClick={() => { soundFX.playClick(); setActiveTab('history'); }}
          className={`bottom-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
        >
          <History size={20} />
          <span>HISTORIAL</span>
        </button>

        <button
          onClick={() => { soundFX.playClick(); setActiveTab('profile'); }}
          className={`bottom-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
        >
          <UserIcon size={20} />
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
    </div>
  );
};

export default App;
