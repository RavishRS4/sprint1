import { useMemo } from "react";
import { useAuthContext } from "../context/AuthContext.jsx";
import { formatCurrency } from "../lib/format.js";
import { downloadMyReport } from "../services/reports.js";
import { downloadBlob } from "../lib/download.js";

const ReportsPage = () => {
  const { user, dashboard, goals } = useAuthContext();

  const totals = useMemo(() => {
    const goalTotals = goals.reduce(
      (acc, goal) => {
        acc.target += Number(goal.target_amount ?? 0);
        acc.saved += Number(goal.saved_amount ?? 0);
        return acc;
      },
      { target: 0, saved: 0 }
    );
    return {
      target: goalTotals.target,
      saved: goalTotals.saved,
      progress: goalTotals.target ? Math.round((goalTotals.saved / goalTotals.target) * 100) : 0
    };
  }, [goals]);

  const handleDownload = async () => {
    const blob = await downloadMyReport();
    downloadBlob(blob, `Expense Tracker-${user?.name ?? "report"}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-6 shadow">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Reports & Insights</h1>
            <p className="text-sm text-slate-500">Download detailed Excel reports of your finances.</p>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary-700"
          >
            Download My Excel Report
          </button>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-xs uppercase text-slate-500">Total Income</div>
          <div className="mt-2 text-2xl font-semibold text-primary-600">
            {formatCurrency(dashboard?.totalIncome ?? 0)}
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-xs uppercase text-slate-500">Total Expense</div>
          <div className="mt-2 text-2xl font-semibold text-rose-600">
            {formatCurrency(dashboard?.totalExpense ?? 0)}
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-xs uppercase text-slate-500">Current Balance</div>
          <div className="mt-2 text-2xl font-semibold text-emerald-600">
            {formatCurrency(dashboard?.balance ?? 0)}
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-xs uppercase text-slate-500">Goal Progress</div>
          <div className="mt-2 text-lg font-semibold text-slate-700">{totals.progress}%</div>
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-slate-800">Active Goals</h2>
        <div className="mt-4 space-y-4">
          {goals.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-slate-400">
              No goals tracked yet. Create a goal to visualize your savings progress.
            </div>
          ) : (
            goals.map((goal) => {
              const progress = goal.target_amount
                ? Math.min(Math.round((Number(goal.saved_amount ?? 0) / Number(goal.target_amount ?? 0)) * 100), 100)
                : 0;
              return (
                <div key={goal.id} className="rounded-lg border px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="text-base font-semibold text-slate-800">{goal.name}</div>
                      <div className="text-sm text-slate-500">
                        Target {formatCurrency(goal.target_amount)} · Saved {formatCurrency(goal.saved_amount)}
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                        goal.status === "achieved"
                          ? "bg-emerald-50 text-emerald-600"
                          : goal.status === "expired"
                          ? "bg-rose-50 text-rose-600"
                          : "bg-primary-50 text-primary-600"
                      }`}
                    >
                      {goal.status}
                    </span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-primary-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default ReportsPage;
