import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import Modal from "../components/ui/Modal.jsx";
import {
  fetchGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  addContribution,
  fetchContributions,
  updateContribution,
  deleteContribution
} from "../services/goals.js";
import { formatCurrency, formatDate } from "../lib/format.js";

const goalDefaults = {
  name: "",
  targetAmount: "",
  description: "",
  endDate: ""
};

const contributionDefaults = {
  amount: "",
  contributionDate: formatDate(new Date())
};

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [contributionModalOpen, setContributionModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [editingContribution, setEditingContribution] = useState(null);
  const goalForm = useForm({ defaultValues: goalDefaults });
  const contributionForm = useForm({ defaultValues: contributionDefaults });

  const loadGoals = async () => {
    setLoading(true);
    try {
      const { goals: data } = await fetchGoals();
      setGoals(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const openGoalModal = (goal = null) => {
    setSelectedGoal(goal);
    if (goal) {
      goalForm.reset({
        name: goal.name,
        targetAmount: Number(goal.target_amount),
        description: goal.description ?? "",
        endDate: goal.end_date ? formatDate(goal.end_date) : ""
      });
    } else {
      goalForm.reset(goalDefaults);
    }
    setModalOpen(true);
  };

  const closeGoalModal = () => {
    goalForm.reset(goalDefaults);
    setModalOpen(false);
    setSelectedGoal(null);
  };

  const openContributionModal = async (goal) => {
    setSelectedGoal(goal);
    contributionForm.reset(contributionDefaults);
    const { contributions: data } = await fetchContributions(goal.id);
    setContributions(data);
    setEditingContribution(null);
    setContributionModalOpen(true);
  };

  const closeContributionModal = () => {
    contributionForm.reset(contributionDefaults);
    setContributionModalOpen(false);
    setSelectedGoal(null);
    setContributions([]);
    setEditingContribution(null);
  };

  const submitGoal = goalForm.handleSubmit(async (formData) => {
    const payload = {
      ...formData,
      targetAmount: Number(formData.targetAmount),
      endDate: formData.endDate || null
    };
    if (selectedGoal) {
      const { goal } = await updateGoal(selectedGoal.id, payload);
      setGoals((prev) => prev.map((item) => (item.id === goal.id ? goal : item)));
    } else {
      const { goal } = await createGoal(payload);
      setGoals((prev) => [goal, ...prev]);
    }
    closeGoalModal();
  });

  const submitContribution = contributionForm.handleSubmit(async (formData) => {
    if (!selectedGoal) return;
    const payload = {
      amount: Number(formData.amount),
      contributionDate: formatDate(formData.contributionDate)
    };
    let goal;
    if (editingContribution) {
      ({ goal } = await updateContribution(selectedGoal.id, editingContribution.id, payload));
    } else {
      ({ goal } = await addContribution(selectedGoal.id, payload));
    }
    setGoals((prev) => prev.map((item) => (item.id === goal.id ? goal : item)));
    const { contributions: updated } = await fetchContributions(selectedGoal.id);
    setContributions(updated);
    contributionForm.reset(contributionDefaults);
    setEditingContribution(null);
  });

  const startEditContribution = (item) => {
    setEditingContribution(item);
    contributionForm.reset({
      amount: Number(item.amount),
      contributionDate: formatDate(item.contribution_date)
    });
  };

  const removeContributionItem = async (item) => {
    if (!selectedGoal) return;
    const ok = window.confirm("Delete this contribution?");
    if (!ok) return;
    const { goal } = await deleteContribution(selectedGoal.id, item.id);
    setGoals((prev) => prev.map((g) => (g.id === goal.id ? goal : g)));
    const { contributions: updated } = await fetchContributions(selectedGoal.id);
    setContributions(updated);
    if (editingContribution && editingContribution.id === item.id) {
      setEditingContribution(null);
      contributionForm.reset(contributionDefaults);
    }
  };

  const removeGoal = async (goalId) => {
    await deleteGoal(goalId);
    setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
  };

  const progressBar = (goal) => {
    const target = Number(goal.target_amount ?? 0);
    const saved = Number(goal.saved_amount ?? 0);
    if (!target) return 0;
    return Math.min(Math.round((saved / target) * 100), 100);
  };

  const totals = useMemo(() => {
    return goals.reduce(
      (acc, goal) => {
        acc.target += Number(goal.target_amount ?? 0);
        acc.saved += Number(goal.saved_amount ?? 0);
        return acc;
      },
      { target: 0, saved: 0 }
    );
  }, [goals]);

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-6 shadow">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Financial Goals</h1>
            <p className="text-sm text-slate-500">Plan, track, and achieve your savings targets.</p>
          </div>
          <button
            type="button"
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary-700"
            onClick={() => openGoalModal()}
          >
            Add Goal
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-slate-50 p-4">
            <div className="text-xs uppercase text-slate-500">Total Target</div>
            <div className="mt-2 text-xl font-semibold text-primary-600">
              {formatCurrency(totals.target)}
            </div>
          </div>
          <div className="rounded-lg border bg-slate-50 p-4">
            <div className="text-xs uppercase text-slate-500">Total Saved</div>
            <div className="mt-2 text-xl font-semibold text-emerald-600">
              {formatCurrency(totals.saved)}
            </div>
          </div>
          <div className="rounded-lg border bg-slate-50 p-4">
            <div className="text-xs uppercase text-slate-500">Progress</div>
            <div className="mt-2 text-xl font-semibold text-slate-700">
              {totals.target ? `${Math.round((totals.saved / totals.target) * 100)}%` : "0%"}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {loading ? (
          <div className="rounded-xl bg-white p-6 text-center text-slate-500 shadow">
            Loading goals...
          </div>
        ) : goals.length === 0 ? (
          <div className="rounded-xl bg-white p-6 text-center text-slate-400 shadow">
            No goals found. Start by creating one!
          </div>
        ) : (
          goals.map((goal) => (
            <div key={goal.id} className="rounded-xl bg-white p-6 shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">{goal.name}</h2>
                  <div className="mt-1 text-sm text-slate-500">
                    Target {formatCurrency(goal.target_amount)} · Saved {formatCurrency(goal.saved_amount)}
                  </div>
                </div>
                <span
                  className={`rounded-full px-4 py-1 text-xs font-semibold uppercase ${
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

              {goal.description && (
                <p className="mt-2 text-sm text-slate-600">{goal.description}</p>
              )}

              <div className="mt-4">
                <div className="flex justify-between text-xs font-semibold text-slate-500">
                  <span>Progress</span>
                  <span>{progressBar(goal)}%</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-primary-500 transition-all"
                    style={{ width: `${progressBar(goal)}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-4 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  onClick={() => openContributionModal(goal)}
                >
                  Contributions
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-primary-200 px-4 py-1 text-xs font-semibold text-primary-600 hover:bg-primary-50"
                  onClick={() => openGoalModal(goal)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-rose-200 px-4 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                  onClick={() => removeGoal(goal.id)}
                >
                  Delete
                </button>
              </div>

              {goal.end_date && (
                <div className="mt-4 text-xs text-slate-500">
                  Complete by <span className="font-semibold text-slate-600">{formatDate(goal.end_date)}</span>
                </div>
              )}
            </div>
          ))
        )}
      </section>

      <Modal title={selectedGoal ? "Edit Goal" : "Add Goal"} isOpen={modalOpen} onClose={closeGoalModal}>
        <form className="space-y-4" onSubmit={submitGoal}>
          <label className="flex flex-col text-sm font-medium text-slate-600">
            <span>Name</span>
            <input
              className="mt-1 rounded-lg border px-3 py-2"
              {...goalForm.register("name", { required: true })}
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col text-sm font-medium text-slate-600">
              <span>Target Amount</span>
              <input
                type="number"
                step="0.01"
                className="mt-1 rounded-lg border px-3 py-2"
                {...goalForm.register("targetAmount", { required: true, min: 0.01 })}
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-slate-600">
              <span>End Date</span>
              <input
                type="date"
                className="mt-1 rounded-lg border px-3 py-2"
                {...goalForm.register("endDate")}
              />
            </label>
          </div>
          <label className="flex flex-col text-sm font-medium text-slate-600">
            <span>Description</span>
            <textarea className="mt-1 rounded-lg border px-3 py-2" rows={3} {...goalForm.register("description")} />
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeGoalModal}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              {selectedGoal ? "Save Changes" : "Create Goal"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        title={selectedGoal ? `Contributions · ${selectedGoal.name}` : "Contributions"}
        isOpen={contributionModalOpen}
        onClose={closeContributionModal}
      >
        <form className="space-y-4" onSubmit={submitContribution}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col text-sm font-medium text-slate-600">
              <span>Amount</span>
              <input
                type="number"
                step="0.01"
                className="mt-1 rounded-lg border px-3 py-2"
                {...contributionForm.register("amount", { required: true, min: 0.01 })}
              />
            </label>
            <label className="flex flex-col text-sm font-medium text-slate-600">
              <span>Date</span>
              <input
                type="date"
                className="mt-1 rounded-lg border px-3 py-2"
                {...contributionForm.register("contributionDate", { required: true })}
              />
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeContributionModal}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Close
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              {editingContribution ? "Save Changes" : "Add Contribution"}
            </button>
          </div>
        </form>

        <div className="mt-6 max-h-52 overflow-y-auto rounded-lg border">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contributions.length ? (
                contributions.map((item) => (
                  <tr key={item.id} className="border-t text-slate-600">
                    <td className="px-4 py-2">{formatDate(item.contribution_date)}</td>
                    <td className="px-4 py-2">{formatCurrency(item.amount)}</td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => startEditContribution(item)}
                        className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => removeContributionItem(item)}
                        className="ml-2 rounded-md border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-center text-slate-400">
                    No contributions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
};

export default GoalsPage;
