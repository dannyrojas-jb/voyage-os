import { createClient } from '@/lib/supabase/server';
import StatusBadge from '@/components/StatusBadge';
import { money } from '@/lib/format';
import { changePlan } from './actions';

export const dynamic = 'force-dynamic';

const PLANS = [
  { id: 'starter', name: 'Starter', price: 29, blurb: 'Solo agents getting set up', features: ['1 seat', 'CRM + client portal', 'AI proposal builder'] },
  { id: 'pro', name: 'Pro', price: 79, blurb: 'Growing agencies', features: ['Up to 5 seats', 'Everything in Starter', 'Commission tracking', 'Flight search'] },
  { id: 'agency', name: 'Agency', price: 199, blurb: 'Full teams at scale', features: ['Unlimited seats', 'Everything in Pro', 'Priority support', 'Custom branding'] },
];

export default async function BillingPage() {
  const supabase = createClient();
  const [{ data: sub }, { data: invData }] = await Promise.all([
    supabase.from('subscriptions').select('*').maybeSingle(),
    supabase.from('invoices').select('*').order('issued_date', { ascending: false }),
  ]);
  const invoices = (invData ?? []) as any[];
  const currentPlan = (sub as any)?.plan ?? null;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-ink">Billing</h1>
      <p className="mb-6 text-sm text-slate-500">
        Manage your subscription and invoices. Payments run through Stripe (test mode) - switching a plan here updates
        your subscription; in production it opens Stripe Checkout.
      </p>

      {sub && (
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400">Current plan</div>
            <div className="text-lg font-bold text-water capitalize">{(sub as any).plan}</div>
          </div>
          <StatusBadge status={(sub as any).status === 'active' ? 'earned' : 'pending'} label={(sub as any).status} />
          {(sub as any).current_period_end && (
            <div className="text-sm text-slate-500">Renews {(sub as any).current_period_end}</div>
          )}
          <div className="ml-auto text-sm text-slate-500">{(sub as any).seats} seat{(sub as any).seats === 1 ? '' : 's'}</div>
        </div>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {PLANS.map((p) => {
          const active = currentPlan === p.id;
          return (
            <div key={p.id} className={`rounded-xl border bg-white p-5 ${active ? 'border-teal ring-1 ring-teal' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <div className="font-bold text-ink">{p.name}</div>
                {active && <span className="rounded-full bg-teal/10 px-2 py-0.5 text-xs font-semibold text-teal">Current</span>}
              </div>
              <div className="mt-1 text-2xl font-bold text-water">{money(p.price)}<span className="text-sm font-medium text-slate-400">/mo</span></div>
              <div className="mb-3 text-xs text-slate-400">{p.blurb}</div>
              <ul className="mb-4 space-y-1">
                {p.features.map((f) => <li key={f} className="text-sm text-slate-600">· {f}</li>)}
              </ul>
              <form action={changePlan.bind(null, p.id)}>
                <button
                  disabled={active}
                  className={`w-full rounded-lg py-2 text-sm font-semibold ${active ? 'cursor-default bg-slate-100 text-slate-400' : 'bg-teal text-white hover:bg-teal/90'}`}
                >
                  {active ? 'Current plan' : `Switch to ${p.name}`}
                </button>
              </form>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Invoices</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3">Invoice</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3 text-right">Amount</th>
              <th className="px-5 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((v) => (
              <tr key={v.id} className="border-b border-slate-50 last:border-0">
                <td className="px-5 py-3"><span className="font-semibold text-ink">{v.number}</span><div className="text-xs text-slate-400">{v.description}</div></td>
                <td className="px-5 py-3 text-slate-500">{v.issued_date}</td>
                <td className="px-5 py-3 text-right font-medium text-slate-700">{money(Number(v.amount))}</td>
                <td className="px-5 py-3 text-right"><StatusBadge status={v.status === 'paid' ? 'earned' : 'pending'} label={v.status} /></td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-6 text-center text-slate-400">No invoices yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
