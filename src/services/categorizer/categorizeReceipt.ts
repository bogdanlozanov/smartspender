import type { ExpenseCategoryKey, LineItem } from '@/src/types';
import { DEFAULT_CATEGORIES } from '@/src/constants/categories';

const KEYWORDS: Record<ExpenseCategoryKey, RegExp[]> = {
  groceries: [/milk/i, /bread/i, /fruit/i, /vegetable/i, /meat/i, /cheese/i, /market/i],
  dining: [/restaurant/i, /cafe/i, /bar/i, /meal/i, /burger/i, /pizza/i],
  transport: [/fuel/i, /gas/i, /taxi/i, /transport/i, /bus/i, /train/i],
  utilities: [/electric/i, /water/i, /internet/i, /telecom/i, /utility/i],
  health: [/pharmacy/i, /medicine/i, /clinic/i, /health/i],
  entertainment: [/cinema/i, /movie/i, /concert/i, /ticket/i, /game/i],
  shopping: [/clothing/i, /apparel/i, /store/i, /shop/i, /cosmetic/i],
  travel: [/hotel/i, /flight/i, /air/i, /booking/i, /travel/i],
  education: [/book/i, /course/i, /school/i, /education/i],
  home: [/furniture/i, /home/i, /hardware/i, /diy/i],
  other: [],
};

interface CategorizeResult {
  items: LineItem[];
  receiptCategory: ExpenseCategoryKey;
}

const guessCategory = (description: string): { category: ExpenseCategoryKey; confidence: number } => {
  const normalized = description.toLowerCase();

  for (const [category, patterns] of Object.entries(KEYWORDS) as Array<
    [ExpenseCategoryKey, RegExp[]]
  >) {
    for (const pattern of patterns) {
      if (pattern.test(normalized)) {
        return { category, confidence: 0.8 };
      }
    }
  }

  return { category: 'other', confidence: 0.3 };
};

export const categorizeReceipt = (items: LineItem[]): CategorizeResult => {
  const categorizedItems = items.map((item) => {
    if (item.categoryGuess) {
      return item;
    }

    const { category, confidence } = guessCategory(item.description);
    return {
      ...item,
      categoryGuess: category,
      confidence,
    };
  });

  const tally = categorizedItems.reduce<Record<ExpenseCategoryKey, number>>((acc, item) => {
    const key = item.categoryGuess ?? 'other';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {} as Record<ExpenseCategoryKey, number>);

  const majorityCategory =
    (Object.entries(tally).sort(([, countA], [, countB]) => countB - countA)[0]?.[0] as
      | ExpenseCategoryKey
      | undefined) ?? 'other';

  const receiptCategory = DEFAULT_CATEGORIES.some((category) => category.id === majorityCategory)
    ? majorityCategory
    : 'other';

  return {
    items: categorizedItems,
    receiptCategory,
  };
};
