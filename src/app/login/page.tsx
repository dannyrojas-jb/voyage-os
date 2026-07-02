import { login } from './actions';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-water to-ink px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-teal font-bold text-white">V</div>
          <div>
            <div className="text-lg font-bold text-ink">Voyage OS</div>
            <div className="text-xs text-slate-500">Travel agency operations</div>
          </div>
        </div>

        {searchParams.error && (
          <div className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {searchParams.error}
          </div>
        )}

        <form action={login} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              defaultValue="agent@voyage.demo"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              defaultValue="voyagedemo123"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-teal py-2.5 font-semibold text-white transition hover:bg-teal/90"
          >
            Sign in
          </button>
        </form>

        <p className="mt-5 rounded-lg bg-sand px-3 py-2.5 text-center text-xs text-slate-500">
          Demo account is pre-filled. Just click <b>Sign in</b> to explore.
        </p>
      </div>
    </div>
  );
}
