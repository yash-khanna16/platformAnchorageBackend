// Single source of truth for order pricing constants so a future change
// (e.g. another platform fee increase) only has to happen in one place
// and is automatically reflected in confirmation emails, PDFs, and the
// analytics profit calculation.
export const PLATFORM_FEE = 15;
export const GST_RATE = 0.05;

// Item IDs that are exempt from the platform fee (meal-plan items).
// Kept as a helper here so analytics can apply the same exemption rule
// as order placement/emails without re-deriving it from scratch.
export function getMealItemIds(): string[] {
  return [
    process.env.BREAKFAST_VEG_ID,
    process.env.BREAKFAST_NON_VEG_ID,
    process.env.LUNCH_VEG_ID,
    process.env.LUNCH_NON_VEG_ID,
    process.env.DINNER_VEG_ID,
    process.env.DINNER_NON_VEG_ID,
    process.env.TEA_ID,
  ].filter((id): id is string => Boolean(id));
}

export function isMealOrder(items: { item_id: string; qty: number }[]): boolean {
  const mealIds = getMealItemIds();
  return items.some((item) => mealIds.includes(item.item_id));
}
