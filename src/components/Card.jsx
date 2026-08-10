export default function Card({ title, value, icon: Icon, accent }) {
  return (
    <div className={`rounded-[1.75rem] bg-gradient-to-br ${accent} p-[1px] shadow-sm`}>
      <div className="rounded-[calc(1.75rem-1px)] bg-white p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">{title}</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{value}</p>
          </div>
          {Icon && (
            <div className="rounded-2xl bg-slate-100 p-3 text-blue-700">
              <Icon />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
