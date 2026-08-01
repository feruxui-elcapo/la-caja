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
  Save, 
  LogOut, 
  CheckCircle2, 
  Search,
  Download,
  WifiOff
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
      <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center p-4">
        <div className="font-sans font-bold text-sm text-amber-400 flex items-center gap-2 animate-pulse">
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
    <div className="min-h-screen bg-[#0b0c10] text-gray-100 flex flex-col font-sans">
      
      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-[480px] w-full mx-auto px-4 py-6">

        {/* TAB 1: INICIO */}
        {activeTab === 'home' && (
          <div className="flex flex-col items-center">
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
            <h2 className="font-extrabold text-lg text-amber-400 mb-4 text-center tracking-tight">
              Historial de Gastos
            </h2>

            {/* Search Input */}
            <div className="relative mb-4">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Buscar gasto por concepto o frasco..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-sans text-sm outline-none focus:border-amber-400/50 transition-colors placeholder:text-stone-500"
              />
            </div>

            {/* Expenses List */}
            <div className="flex flex-col gap-2.5">
              {filteredExpenses.length === 0 ? (
                <div className="text-center text-stone-500 font-sans text-sm py-12 bg-white/3 rounded-2xl border border-white/5">
                  Sin gastos registrados este mes.
                </div>
              ) : (
                filteredExpenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between bg-white/5 border border-white/8 hover:border-white/15 rounded-2xl p-4 transition-all"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="font-bold text-sm text-white truncate">
                        {exp.description}
                      </p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        <span className="text-amber-400/90 font-semibold">{exp.jarName}</span> · {fmtDate(exp.date)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-bold text-sm text-red-400">
                        -{fmt(exp.amount)}
                      </span>
                      <button
                        onClick={async () => {
                          if (confirm('¿Eliminar este gasto? El dinero volverá al frasco.')) {
                            soundFX.playClick();
                            await deleteExpense(exp.id);
                          }
                        }}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
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

        {/* TAB 3: PERFIL Y AJUSTES */}
        {activeTab === 'profile' && (
          <div>
            <h2 className="font-extrabold text-lg text-amber-400 mb-6 text-center tracking-tight">
              Perfil y Ajustes
            </h2>

            {/* User Profile Card */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 flex items-center gap-4 mb-6">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-12 h-12 rounded-full border-2 border-amber-400" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400 font-bold">
                  {user.displayName?.[0] || 'U'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-white truncate">
                  {user.displayName || user.email?.split('@')[0]}
                </p>
                <p className="text-xs text-stone-400 mt-0.5 truncate">
                  {user.email}
                </p>
              </div>
              <button
                onClick={() => { soundFX.playClick(); logout(); }}
                className="py-2 px-3.5 rounded-xl bg-red-500/12 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold text-xs transition-all flex items-center gap-1.5 shrink-0"
                title="Cerrar Sesión"
              >
                <LogOut size={14} />
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
                className="w-full py-4 px-4 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-2xl mb-6 shadow-[0_4px_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2"
              >
                <Download size={18} />
                <span>Instalar App en Celular</span>
              </button>
            )}

            {saveSuccess && (
              <div className="bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 rounded-2xl p-4 text-sm font-semibold flex items-center gap-2.5 mb-5">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <span>Configuración guardada exitosamente.</span>
              </div>
            )}

            {/* Profile Settings Form */}
            <form onSubmit={handleProfileSave} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                  Presupuesto Total Mensual ($)
                </label>
                <input
                  type="number"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(Number(e.target.value))}
                  className="w-full p-4 bg-white/5 border border-white/12 rounded-2xl text-amber-300 font-extrabold text-xl outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                  Segundo Email Autorizado
                </label>
                <input
                  type="email"
                  placeholder="ej: parejacompartida@gmail.com"
                  value={secondaryEmail}
                  onChange={(e) => setSecondaryEmail(e.target.value)}
                  className="w-full p-4 bg-white/5 border border-white/12 rounded-2xl text-white font-sans text-sm outline-none focus:border-amber-400 transition-colors placeholder:text-stone-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 px-6 rounded-2xl font-bold text-gray-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-[0_4px_20px_rgba(245,158,11,0.35)] transition-all scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
              >
                <Save size={18} />
                <span>Guardar Cambios</span>
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
