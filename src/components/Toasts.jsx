export default function Toasts({ toasts }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed right-4 top-4 z-50 flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto rounded-xl p-3 text-sm shadow-lg ${t.type === 'error' ? 'bg-red-600 text-white' : t.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-white'}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
