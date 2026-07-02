import { STATUS_TONE } from '@/lib/format';

export default function StatusBadge({ status, label }: { status: string; label?: string }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        STATUS_TONE[status] ?? 'bg-slate-100 text-slate-600'
      }`}
    >
      {label ?? status}
    </span>
  );
}
