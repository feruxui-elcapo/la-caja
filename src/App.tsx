import React, { useState, useEffect } from 'react';
import { auth, onAuthStateChanged, type User } from './firebase';
import type { 
  AppConfig, 
  Expense, 
  Jar 
} from './types';
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
import { Navbar } from './components/Navbar';
import { ResetCountdown } from './components/ResetCountdown';
import { CardboardBox } from './components/CardboardBox';
import { AddExpenseModal } from './components/AddExpenseModal';
import { ExpenseHistoryModal } from './components/ExpenseHistoryModal';
import { SettingsModal } from './components/SettingsModal';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Firestore App State
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [preselectedJarId, setPreselectedJarId] = useState<string | undefined>(undefined);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
    });
    return () => unsubscribe();
  }, [user]);

  // Subscribe to Expenses for current month
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
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <span className="text-amber-200 text-xs font-bold tracking-widest uppercase">Cargando La Caja...</span>
        </div>
      </div>
    );
  }

  if (!user || !isAuthorized) {
    return (
      <LoginScreen
        user={user}
        isAuthorized={isAuthorized}
        allowedEmails={allowedList}
      />
    );
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 flex flex-col selection:bg-amber-500 selection:text-gray-950">
      {/* Navbar */}
      <Navbar
        user={user}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        totalExpensesCount={expenses.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-8 flex flex-col justify-center items-center">
        {/* Budget Reset Countdown */}
        <ResetCountdown />

        {/* The 2 Jars (Salidas & Salud) */}
        <CardboardBox
          jars={config.jars || []}
          expenses={expenses}
          totalBudget={config.totalMonthlyBudget || 300000}
          onDeductClick={handleOpenAddExpense}
        />
      </main>

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        jars={config.jars || []}
        preselectedJarId={preselectedJarId}
        onAddExpense={handleAddExpenseSubmit}
      />

      <ExpenseHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        expenses={expenses}
        jars={config.jars || []}
        onDeleteExpense={deleteExpense}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={saveConfig}
        currentUserEmail={user.email || ''}
      />
    </div>
  );
};

export default App;
