export interface Jar {
  id: string;
  name: string;
  percentage: number; // e.g. 40 for 40% of total budget
  allocatedBudget: number; // calculated or custom amount
  color: string; // e.g. '#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6'
  icon?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  jarId: string;
  jarName: string;
  date: string; // ISO string
  monthKey: string; // e.g., '2026-08'
  userEmail: string;
  userName: string;
}

export interface AppConfig {
  totalMonthlyBudget: number;
  secondaryEmail: string;
  allowedEmails: string[];
  jars: Jar[];
}

export interface MonthSummary {
  monthKey: string; // YYYY-MM
  totalBudget: number;
  totalSpent: number;
  remaining: number;
}
