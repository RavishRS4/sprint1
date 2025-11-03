import { useEffect, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar
} from "recharts";
import { useAuthContext } from "../context/AuthContext.jsx";
import { formatCurrency } from "../lib/format.js";

const PIE_COLORS = ["#2b60ff", "#21c55d"];

const MOTIVATION = [
  "Track every rupee today to build wealth tomorrow.",
  "Savings grow when expenses are intentional.",
  "A budget is telling your money where to go instead of wondering where it went.",
  "Small consistent savings lead to big financial freedom.",
  "Set a goal, plan it, and watch your finances align."
];

const DashboardPage = () => {
  const { user, dashboard, refreshProfile } = useAuthContext();

  useEffect(() => {
    if (!dashboard) {
      refreshProfile();
    }
  }, [dashboard, refreshProfile]);

  const pieData = useMemo(() => {
    if (!dashboard) {
      return [];
    }
    const totalIncome = Number(dashboard.totalIncome ?? 0);
    const totalExpense = Number(dashboard.totalExpense ?? 0);
    const savings = Math.max(totalIncome - totalExpense, 0);
    return [
      { name: "Expenses", value: totalExpense },
      { name: "Savings", value: savings }
    ];
  }, [dashboard]);

  const monthlyData = useMemo(() => {
    return dashboard?.monthlySavings?.map((item) => ({
      month: item.month,
      income: Number(item.income ?? 0),
      expense: Number(item.expense ?? 0),
      savings: Number(item.savings ?? 0)
    })) ?? [];
  }, [dashboard]);

  const motivationalQuote = useMemo(() => {
    const index = Math.floor(Math.random() * MOTIVATION.length);
    return MOTIVATION[index];
  }, [dashboard]);

  return (
    <div className="space-y-8">
      <header className="rounded-xl bg-gradient-to-r from-primary-500 to-primary-700 px-8 py-10 text-white shadow-lg">
        <div className="text-sm uppercase tracking-wide">Welcome back</div>
        <div className="mt-2 text-3xl font-semibold">{user?.name}</div>
        <p className="mt-4 max-w-2xl text-base text-primary-50">{motivationalQuote}</p>
      </header>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm font-medium text-slate-500">Total Income</div>
          <div className="mt-3 text-2xl font-semibold text-primary-700">
            {formatCurrency(dashboard?.totalIncome ?? 0)}
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm font-medium text-slate-500">Total Expense</div>
          <div className="mt-3 text-2xl font-semibold text-rose-600">
            {formatCurrency(dashboard?.totalExpense ?? 0)}
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm font-medium text-slate-500">Current Balance</div>
          <div className="mt-3 text-2xl font-semibold text-emerald-600">
            {formatCurrency(dashboard?.balance ?? 0)}
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="text-sm font-medium text-slate-500">Salary</div>
          <div className="mt-3 text-2xl font-semibold text-primary-700">
            {formatCurrency(user?.salary ?? 0)}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow">
          <div className="mb-4 text-lg font-semibold text-slate-700">Expenses vs Savings</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie dataKey="value" data={pieData} innerRadius={60} outerRadius={90} paddingAngle={4}>
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl bg-white p-6 shadow">
          <div className="mb-4 text-lg font-semibold text-slate-700">Monthly Overview</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#21c55d" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
                <Bar dataKey="savings" name="Savings" fill="#2b60ff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
