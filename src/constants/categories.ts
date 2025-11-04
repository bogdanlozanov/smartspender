import type { ExpenseCategory } from '@/src/types';

export const DEFAULT_CATEGORIES: ExpenseCategory[] = [
  { id: 'groceries', name: 'Groceries', icon: 'shopping-basket' },
  { id: 'dining', name: 'Dining', icon: 'utensils' },
  { id: 'transport', name: 'Transport', icon: 'car' },
  { id: 'utilities', name: 'Utilities', icon: 'bolt' },
  { id: 'health', name: 'Health', icon: 'heartbeat' },
  { id: 'entertainment', name: 'Entertainment', icon: 'film' },
  { id: 'shopping', name: 'Shopping', icon: 'shopping-bag' },
  { id: 'travel', name: 'Travel', icon: 'plane' },
  { id: 'education', name: 'Education', icon: 'book' },
  { id: 'home', name: 'Home', icon: 'home' },
  { id: 'other', name: 'Other', icon: 'ellipsis-h' },
];

export const CATEGORY_ORDER = DEFAULT_CATEGORIES.map((category) => category.id);
