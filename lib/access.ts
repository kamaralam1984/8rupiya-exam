import { db } from "./db";
import { getFlag } from "./feature-flags";

export type PlanKind = "MONTH" | "YEAR" | "LIFETIME";

const SETTING_KEY = "paid_plan_kind";
const DEFAULT_PLAN: PlanKind = "MONTH";

const PLAN_LABELS: Record<PlanKind, string> = {
  MONTH: "1 month",
  YEAR: "1 year",
  LIFETIME: "Lifetime",
};

const LIFETIME_END = new Date("9999-12-31T00:00:00.000Z");

export function planLabel(p: PlanKind) {
  return PLAN_LABELS[p];
}

export function endsAtFor(plan: PlanKind, start = new Date()): Date {
  if (plan === "LIFETIME") return LIFETIME_END;
  const d = new Date(start.getTime());
  if (plan === "MONTH") d.setDate(d.getDate() + 30);
  if (plan === "YEAR") d.setDate(d.getDate() + 365);
  return d;
}

export async function getDefaultPlanKind(): Promise<PlanKind> {
  const row = await db.platformSetting.findUnique({ where: { key: SETTING_KEY } });
  const v = row?.value;
  if (v === "MONTH" || v === "YEAR" || v === "LIFETIME") return v;
  return DEFAULT_PLAN;
}

export async function setDefaultPlanKind(plan: PlanKind) {
  await db.platformSetting.upsert({
    where: { key: SETTING_KEY },
    update: { value: plan },
    create: { key: SETTING_KEY, value: plan },
  });
}

/** Active subscription = active flag true AND endsAt in future. */
export async function hasPaidAccess(userId: string): Promise<boolean> {
  const sub = await db.subscription.findFirst({
    where: { userId, active: true, endsAt: { gt: new Date() } },
    orderBy: { endsAt: "desc" },
    select: { id: true },
  });
  return !!sub;
}

export async function activeSubscription(userId: string) {
  return db.subscription.findFirst({
    where: { userId, active: true, endsAt: { gt: new Date() } },
    orderBy: { endsAt: "desc" },
  });
}

/** Grant a subscription with the current configured plan duration. */
export async function grantSubscription(opts: {
  userId: string;
  plan?: PlanKind;
  reason?: string;
}) {
  const plan = opts.plan ?? (await getDefaultPlanKind());
  const startsAt = new Date();
  const endsAt = endsAtFor(plan, startsAt);

  // Deactivate existing active subscriptions
  await db.subscription.updateMany({
    where: { userId: opts.userId, active: true },
    data: { active: false },
  });

  return db.subscription.create({
    data: { userId: opts.userId, plan, startsAt, endsAt, active: true },
  });
}

export async function revokeSubscription(userId: string) {
  return db.subscription.updateMany({
    where: { userId, active: true },
    data: { active: false },
  });
}

export type FeatureGate = "ok" | "disabled" | "paywall";

/** What the user can do with this feature. */
export async function checkFeatureAccess(key: string, userId: string | null): Promise<FeatureGate> {
  const flag = await getFlag(key);
  // Missing flag = treat as enabled+free (graceful default)
  if (!flag) return "ok";
  if (!flag.enabled) return "disabled";
  if (!flag.requiresPaid) return "ok";
  if (!userId) return "paywall";
  const paid = await hasPaidAccess(userId);
  return paid ? "ok" : "paywall";
}
