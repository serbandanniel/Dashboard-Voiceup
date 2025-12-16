export interface IncomeItem {
  id?: string;
  name: string;
  val: number;
  taxable: boolean;
  timestamp: number;
}

export interface ExpenseItem {
  id?: string;
  name: string;
  val: number;
  user: string;
  timestamp: number;
}

export const SEED_INCOMES: Omit<IncomeItem, 'id' | 'timestamp'>[] = [
  { name: "Taxe Participare", val: 8200, taxable: true },
  { name: "Sponsorizare Daniel", val: 3000, taxable: true },
  { name: "Sponsorizare Marius", val: 2000, taxable: false },
  { name: "Servicii Foto", val: 2400, taxable: false }
];

export const SEED_EXPENSES: Omit<ExpenseItem, 'id' | 'timestamp'>[] = [
  { name: "Promovare Facebook", val: 964.52, user: "Sistem" },
  { name: "Promovare TikTok", val: 1105.00, user: "Sistem" }
];