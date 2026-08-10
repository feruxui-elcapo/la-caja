import { 
  db, 
  doc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy 
} from '../firebase';
import type { AppConfig, Expense, Jar } from '../types';

const CONFIG_DOC_PATH = doc(db, 'config', 'settings');
const EXPENSES_COLLECTION = collection(db, 'expenses');

const LOCAL_EXPENSES_KEY = 'la_caja_expenses_v1';
const LOCAL_CONFIG_KEY = 'la_caja_config_v1';

export const DEFAULT_JARS: Jar[] = [
  { id: '1', name: 'Salidas', percentage: 83, allocatedBudget: 250000, color: '#F59E0B', icon: 'coffee' },
  { id: '2', name: 'Salud', percentage: 17, allocatedBudget: 50000, color: '#10B981', icon: 'heart' },
];

export const DEFAULT_CONFIG: AppConfig = {
  totalMonthlyBudget: 300000,
  secondaryEmail: '',
  allowedEmails: ['fernandocastrofiore@gmail.com'],
  jars: DEFAULT_JARS
};

// Local storage helpers
export const getLocalConfig = (): AppConfig => {
  try {
    const raw = localStorage.getItem(LOCAL_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return { ...DEFAULT_CONFIG, ...parsed };
    }
  } catch (e) {
    console.warn('Error reading local config:', e);
  }
  return DEFAULT_CONFIG;
};

export const saveLocalConfig = (config: AppConfig) => {
  try {
    localStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Error saving local config:', e);
  }
};

export const getLocalExpenses = (monthKey: string): Expense[] => {
  try {
    const raw = localStorage.getItem(LOCAL_EXPENSES_KEY);
    if (raw) {
      const all: Expense[] = JSON.parse(raw);
      return all.filter(e => e.monthKey === monthKey);
    }
  } catch (e) {
    console.warn('Error reading local expenses:', e);
  }
  return [];
};

export const saveLocalExpense = (expense: Expense) => {
  try {
    const raw = localStorage.getItem(LOCAL_EXPENSES_KEY);
    const all: Expense[] = raw ? JSON.parse(raw) : [];
    const updated = [expense, ...all.filter(e => e.id !== expense.id)];
    localStorage.setItem(LOCAL_EXPENSES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error saving local expense:', e);
  }
};

export const removeLocalExpense = (expenseId: string) => {
  try {
    const raw = localStorage.getItem(LOCAL_EXPENSES_KEY);
    if (raw) {
      const all: Expense[] = JSON.parse(raw);
      const updated = all.filter(e => e.id !== expenseId);
      localStorage.setItem(LOCAL_EXPENSES_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('Error removing local expense:', e);
  }
};

export const getCurrentMonthKey = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const subscribeToConfig = (onUpdate: (config: AppConfig) => void) => {
  // Emit local config immediately so UI never hangs
  const initialLocal = getLocalConfig();
  onUpdate(initialLocal);

  return onSnapshot(
    CONFIG_DOC_PATH,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as AppConfig;
        const allowed = Array.isArray(data.allowedEmails) ? data.allowedEmails : ['fernandocastrofiore@gmail.com'];
        if (!allowed.includes('fernandocastrofiore@gmail.com')) {
          allowed.push('fernandocastrofiore@gmail.com');
        }

        const hasOldConfig = !data.jars || data.jars.length > 2 || data.totalMonthlyBudget === 1000000;
        const mergedConfig: AppConfig = hasOldConfig
          ? { ...DEFAULT_CONFIG, allowedEmails: allowed, secondaryEmail: data.secondaryEmail || '' }
          : { ...data, allowedEmails: allowed };

        saveLocalConfig(mergedConfig);
        onUpdate(mergedConfig);

        if (hasOldConfig) {
          setDoc(CONFIG_DOC_PATH, mergedConfig).catch(() => {});
        }
      } else {
        const localCfg = getLocalConfig();
        setDoc(CONFIG_DOC_PATH, localCfg)
          .then(() => onUpdate(localCfg))
          .catch(() => onUpdate(localCfg));
      }
    },
    (err) => {
      console.warn("Firestore config snapshot fallback to local:", err.message);
      onUpdate(getLocalConfig());
    }
  );
};

export const saveConfig = async (newConfig: Partial<AppConfig>) => {
  const current = getLocalConfig();
  const updated = { ...current, ...newConfig };
  saveLocalConfig(updated);

  try {
    await updateDoc(CONFIG_DOC_PATH, newConfig);
  } catch (err) {
    console.warn("Firestore saveConfig warning (saved to localStorage):", err);
    try {
      await setDoc(CONFIG_DOC_PATH, newConfig, { merge: true });
    } catch (e) {
      console.warn("Firestore setDoc fallback warning:", e);
    }
  }
};

export const subscribeToExpenses = (
  monthKey: string, 
  onUpdate: (expenses: Expense[]) => void
) => {
  // Emit local expenses immediately
  const localExpenses = getLocalExpenses(monthKey);
  onUpdate(localExpenses);

  const processSnapshot = (snapshot: any) => {
    const remoteMap = new Map<string, Expense>();
    snapshot.forEach((docSnap: any) => {
      remoteMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() } as Expense);
    });

    const currentLocal = getLocalExpenses(monthKey);
    currentLocal.forEach(exp => {
      if (!remoteMap.has(exp.id)) {
        remoteMap.set(exp.id, exp);
      }
    });

    const merged = Array.from(remoteMap.values());
    merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    onUpdate(merged);
  };

  const q = query(
    EXPENSES_COLLECTION,
    where('monthKey', '==', monthKey),
    orderBy('date', 'desc')
  );

  return onSnapshot(
    q,
    processSnapshot,
    (error) => {
      console.warn("Error subscribing to expenses from Firestore (using local fallback):", error.message);
      const fallbackQ = query(EXPENSES_COLLECTION, where('monthKey', '==', monthKey));
      onSnapshot(
        fallbackQ,
        processSnapshot,
        (fallbackErr) => {
          console.warn("Fallback query also failed, using local storage:", fallbackErr.message);
          onUpdate(getLocalExpenses(monthKey));
        }
      );
    }
  );
};

export const addExpense = async (
  description: string,
  amount: number,
  jarId: string,
  jarName: string,
  userEmail: string,
  userName: string
): Promise<{ id: string; isLocalOnly: boolean }> => {
  const monthKey = getCurrentMonthKey();
  const date = new Date().toISOString();
  const tempId = 'local_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

  const newExpense: Expense = {
    id: tempId,
    description: (description || 'Gasto').trim(),
    amount: Math.abs(Number(amount)) || 0,
    jarId: String(jarId || ''),
    jarName: String(jarName || 'Frasco'),
    date,
    monthKey,
    userEmail: String(userEmail || 'usuario'),
    userName: String(userName || 'Usuario')
  };

  // Always save locally first so user data is NEVER lost!
  saveLocalExpense(newExpense);

  try {
    const docRef = await addDoc(EXPENSES_COLLECTION, {
      description: newExpense.description,
      amount: newExpense.amount,
      jarId: newExpense.jarId,
      jarName: newExpense.jarName,
      date: newExpense.date,
      monthKey: newExpense.monthKey,
      userEmail: newExpense.userEmail,
      userName: newExpense.userName
    });

    // Replace temporary local expense with Firestore document ID
    removeLocalExpense(tempId);
    saveLocalExpense({ ...newExpense, id: docRef.id });

    return { id: docRef.id, isLocalOnly: false };
  } catch (err: any) {
    console.warn("Firestore addDoc permission/network warning (saved in localStorage):", err?.message || err);
    // Return local status without throwing so user form never breaks!
    return { id: tempId, isLocalOnly: true };
  }
};

export const deleteExpense = async (expenseId: string) => {
  removeLocalExpense(expenseId);
  try {
    const expenseRef = doc(db, 'expenses', expenseId);
    await deleteDoc(expenseRef);
  } catch (err) {
    console.warn("Firestore deleteDoc warning (deleted from localStorage):", err);
  }
};

export const updateExpense = async (
  expenseId: string,
  updatedFields: Partial<Expense>
): Promise<void> => {
  const fieldsToSave = { ...updatedFields };
  if (updatedFields.date) {
    const d = new Date(updatedFields.date);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      fieldsToSave.monthKey = `${year}-${month}`;
    }
  }

  // Update in localStorage
  try {
    const raw = localStorage.getItem(LOCAL_EXPENSES_KEY);
    if (raw) {
      const all: Expense[] = JSON.parse(raw);
      const updated = all.map(e => (e.id === expenseId ? { ...e, ...fieldsToSave } : e));
      localStorage.setItem(LOCAL_EXPENSES_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.warn('Error updating local expense:', e);
  }

  // Update in Firestore
  try {
    const expenseRef = doc(db, 'expenses', expenseId);
    await updateDoc(expenseRef, fieldsToSave);
  } catch (err) {
    console.warn('Firestore updateDoc warning (updated in localStorage):', err);
  }
};

