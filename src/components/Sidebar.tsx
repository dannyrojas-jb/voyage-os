'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/clients', label: 'Clients' },
  { href: '/trips', label: 'Trips' },
  { href: '/commissions', label: 'Commissions' },
];

export default function Sidebar({ email }: { email?: string | null }) {
  const path = usePathname();
  return (
    <aside className="flex w-56 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-teal text-sm font-bold text-white">V</div>
        <span className="font-bold text-ink">Voyage OS</span>
      </div>
      <nav className="flex-1 px-3">
        {NAV.map((item) => {
          const active = path.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-1 block rounded-lg px-3 py-2 text-sm font-medium transition ${
                active ? 'bg-teal/10 text-teal' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-200 px-4 py-4">
        <div className="mb-2 truncate text-xs text-slate-400">{email}</div>
        <form action="/auth/signout" method="post">
          <button className="text-sm font-medium text-slate-500 hover:text-rose-600">Sign out</button>
        </form>
      </div>
    </aside>
  );
}
