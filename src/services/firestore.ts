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

export const getCurrentMonthKey = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const subscribeToConfig = (onUpdate: (config: AppConfig) => void) => {
  return onSnapshot(CONFIG_DOC_PATH, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data() as AppConfig;
      const allowed = Array.isArray(data.allowedEmails) ? data.allowedEmails : ['fernandocastrofiore@gmail.com'];
      if (!allowed.includes('fernandocastrofiore@gmail.com')) {
        allowed.push('fernandocastrofiore@gmail.com');
      }

      // If user still has old 4-jar config in Firestore, automatically update to 2 jars (Salidas & Salud)
      const hasOldConfig = !data.jars || data.jars.length > 2 || data.totalMonthlyBudget === 1000000;
      if (hasOldConfig) {
        const updated = {
          ...DEFAULT_CONFIG,
          allowedEmails: allowed,
          secondaryEmail: data.secondaryEmail || ''
        };
        setDoc(CONFIG_DOC_PATH, updated).catch(console.error);
        onUpdate(updated);
      } else {
        onUpdate({ ...data, allowedEmails: allowed });
      }
    } else {
      // Initialize default config in Firestore
      setDoc(CONFIG_DOC_PATH, DEFAULT_CONFIG)
        .then(() => onUpdate(DEFAULT_CONFIG))
        .catch(err => console.error("Error creating default config in Firestore:", err));
    }
  });
};

export const saveConfig = async (newConfig: Partial<AppConfig>) => {
  try {
    await updateDoc(CONFIG_DOC_PATH, newConfig);
  } catch (err) {
    console.error("Error updating config:", err);
    // Fallback setDoc if document didn't exist
    await setDoc(CONFIG_DOC_PATH, newConfig, { merge: true });
  }
};

export const subscribeToExpenses = (
  monthKey: string, 
  onUpdate: (expenses: Expense[]) => void
) => {
  const q = query(
    EXPENSES_COLLECTION,
    where('monthKey', '==', monthKey),
    orderBy('date', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const expenses: Expense[] = [];
    snapshot.forEach((docSnap) => {
      expenses.push({ id: docSnap.id, ...docSnap.data() } as Expense);
    });
    onUpdate(expenses);
  }, (error) => {
    console.error("Error subscribing to expenses:", error);
    // If index missing fallback query without order
    const fallbackQ = query(EXPENSES_COLLECTION, where('monthKey', '==', monthKey));
    onSnapshot(fallbackQ, (snapshot) => {
      const fallbackExpenses: Expense[] = [];
      snapshot.forEach((docSnap) => {
        fallbackExpenses.push({ id: docSnap.id, ...docSnap.data() } as Expense);
      });
      fallbackExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onUpdate(fallbackExpenses);
    });
  });
};

export const addExpense = async (
  description: string,
  amount: number,
  jarId: string,
  jarName: string,
  userEmail: string,
  userName: string
) => {
  const monthKey = getCurrentMonthKey();
  const date = new Date().toISOString();
  await addDoc(EXPENSES_COLLECTION, {
    description: (description || 'Gasto').trim(),
    amount: Math.abs(Number(amount)) || 0,
    jarId: String(jarId || ''),
    jarName: String(jarName || 'Frasco'),
    date,
    monthKey,
    userEmail: String(userEmail || 'usuario'),
    userName: String(userName || 'Usuario')
  });
};

export const deleteExpense = async (expenseId: string) => {
  const expenseRef = doc(db, 'expenses', expenseId);
  await deleteDoc(expenseRef);
};
