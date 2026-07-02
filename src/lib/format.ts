export function money(n: number | null | undefined): string {
  if (n == null) return '-';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export function dateRange(start: string | null, end: string | null): string {
  if (!start) return 'Dates TBD';
  const fmt = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return end ? `${fmt(start)} - ${fmt(end)}` : fmt(start);
}

export const TRIP_STATUS_LABEL: Record<string, string> = {
  lead: 'Lead',
  planning: 'Planning',
  proposal_sent: 'Proposal sent',
  booked: 'Booked',
  completed: 'Completed',
};

export const STATUS_TONE: Record<string, string> = {
  lead: 'bg-slate-100 text-slate-600',
  planning: 'bg-amber/10 text-amber',
  proposal_sent: 'bg-teal/10 text-teal',
  booked: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-slate-100 text-slate-500',
  draft: 'bg-slate-100 text-slate-600',
  sent: 'bg-teal/10 text-teal',
  approved: 'bg-emerald-100 text-emerald-700',
  declined: 'bg-rose-100 text-rose-700',
  projected: 'bg-slate-100 text-slate-600',
  pending: 'bg-amber/10 text-amber',
  earned: 'bg-emerald-100 text-emerald-700',
};
