import type { SupabaseClient } from "@supabase/supabase-js";
import type { Frequency, RecurringRule } from "@/lib/types";

function addInterval(date: Date, frequency: Frequency, interval: number): Date {
  const step = Math.max(1, interval);
  const next = new Date(date);
  if (frequency === "daily") {
    next.setDate(next.getDate() + step);
  } else if (frequency === "weekly") {
    next.setDate(next.getDate() + step * 7);
  } else {
    next.setMonth(next.getMonth() + step);
  }
  return next;
}

/**
 * Creates any transactions whose recurring rules are due, then advances each
 * rule's next_run. Safe to call on every page load — it only acts on past-due
 * runs and is naturally idempotent.
 */
export async function runDueRecurring(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const now = new Date();
  const nowIso = now.toISOString();

  const { data: rules, error } = await supabase
    .from("recurring_rules")
    .select("*")
    .eq("user_id", userId)
    .lte("next_run", nowIso);

  if (error || !rules) return 0;

  let created = 0;

  for (const rule of rules as RecurringRule[]) {
    let cursor = new Date(rule.next_run);
    const endAt = rule.end_at ? new Date(rule.end_at) : null;
    let guard = 0;

    while (cursor <= now && guard < 500) {
      guard += 1;
      if (endAt && cursor > endAt) break;

      const { error: insertError } = await supabase.from("transactions").insert({
        user_id: userId,
        account_id: rule.account_id,
        to_account_id: null,
        category_id: rule.category_id,
        amount: rule.amount,
        type: rule.type,
        occurred_at: cursor.toISOString(),
        note: rule.note,
      });
      if (!insertError) created += 1;

      cursor = addInterval(cursor, rule.frequency, rule.interval);
    }

    await supabase
      .from("recurring_rules")
      .update({ next_run: cursor.toISOString() })
      .eq("id", rule.id);
  }

  return created;
}
