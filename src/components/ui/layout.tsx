import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-2xl border border-ink-100/80 bg-white p-5 shadow-card transition-shadow hover:shadow-soft", className)}>{children}</div>;
}

export function StatCard({
  label,
  value,
  hint,
  tone = "ink",
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "ink" | "gold" | "study" | "emerald";
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const tones = {
    ink: "from-ink-500/10 to-transparent border-ink-100",
    gold: "from-gold-300/20 to-transparent border-gold-200/60",
    study: "from-study-300/20 to-transparent border-study-200/60",
    emerald: "from-emerald-500/10 to-transparent border-emerald-200/60",
  };
  return (
    <Card className={cn("relative overflow-hidden bg-gradient-to-br", tones[tone])}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">{label}</p>
        {Icon ? <Icon className="h-5 w-5 text-ink-400 opacity-70" /> : null}
      </div>
      <p className="mt-2 font-display text-3xl font-semibold text-ink-800">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-500">{hint}</p> : null}
    </Card>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">{eyebrow}</p> : null}
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink-800 sm:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-ink-500 sm:text-base">{description}</p> : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
  icon: Icon,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="flex flex-col items-center justify-center py-12 text-center">
      {Icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ink-50 text-ink-500">
          <Icon className="h-6 w-6" />
        </div>
      ) : null}
      <p className="font-display text-2xl font-semibold text-ink-800">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">{body}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </Card>
  );
}

export function Banner({
  children,
  tone = "info",
}: {
  children: React.ReactNode;
  tone?: "info" | "warn" | "ok" | "error";
}) {
  const map = {
    info: "bg-mist text-ink-700 border-ink-100",
    warn: "bg-gold-50 text-amber-900 border-gold-200",
    ok: "bg-emerald-50 text-emerald-900 border-emerald-200",
    error: "bg-rose-50 text-rose-900 border-rose-200",
  };
  return <div className={cn("rounded-xl border px-4 py-3 text-sm", map[tone])}>{children}</div>;
}

export function Badge({
  children,
  tone = "ink",
  className,
}: {
  children: React.ReactNode;
  tone?: "ink" | "gold" | "study" | "muted" | "emerald" | "rose";
  className?: string;
}) {
  const map = {
    ink: "bg-ink-50 text-ink-700 border-ink-200/50",
    gold: "bg-gold-50 text-gold-600 border-gold-200/60",
    study: "bg-study-50 text-study-500 border-study-200/60",
    muted: "bg-stone-100 text-stone-600 border-stone-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        map[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function SampleMark() {
  return null; // Production mode: sample mark disabled
}

export function CardSkeleton() {
  return (
    <Card className="animate-pulse space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-5 w-48 rounded bg-ink-100" />
          <div className="h-3 w-32 rounded bg-ink-50" />
        </div>
        <div className="h-6 w-16 rounded-full bg-ink-100" />
      </div>
      <div className="h-4 w-full rounded bg-ink-50" />
      <div className="flex gap-2 pt-2">
        <div className="h-9 flex-1 rounded-xl bg-ink-100" />
        <div className="h-9 w-24 rounded-xl bg-ink-100" />
      </div>
    </Card>
  );
}

export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 w-full rounded-2xl bg-white border border-ink-100/60 p-4 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-40 rounded bg-ink-100" />
            <div className="h-3 w-24 rounded bg-ink-50" />
          </div>
          <div className="h-8 w-20 rounded-xl bg-ink-100" />
        </div>
      ))}
    </div>
  );
}
