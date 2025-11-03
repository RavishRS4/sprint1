import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import Modal from "../components/ui/Modal.jsx";
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
} from "../services/transactions.js";
import { formatCurrency, formatDate } from "../lib/format.js";

const CATEGORIES = [
  "Salary",
  "Food",
  "Rent",
  "Travel",
  "Shopping",
  "Savings",
  "Investments",
  "Health",
  "Utilities",
  "Entertainment"
];

const defaultValues = {
  type: "expense",
  category: "Food",
  amount: "",
  description: "",
  transactionDate: formatDate(new Date())
};

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState({ type: "", category: "" });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({ defaultValues });

  const loadTransactions = async (params = {}) => {
    setLoading(true);
    try {
      const { transactions: data, summary: stats } = await fetchTransactions(params);
      setTransactions(data);
      setSummary(stats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const typeMatch = filters.type ? transaction.type === filters.type : true;
      const categoryMatch = filters.category ? transaction.category === filters.category : true;
      return typeMatch && categoryMatch;
    });
  }, [transactions, filters]);

  const revenue = useMemo(() => ({
    income: Number(summary?.totalIncome ?? 0),
    expense: Number(summary?.totalExpense ?? 0),
    balance: Number(summary?.balance ?? 0)
  }), [summary]);

  const openModal = (transaction = null) => {
    setEditing(transaction);
    if (transaction) {
      reset({
        type: transaction.type,
        category: transaction.category,
        amount: Number(transaction.amount),
        description: transaction.description ?? "",
        transactionDate: formatDate(transaction.transaction_date)
      });
    } else {
      reset(defaultValues);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const onSubmit = async (formData) => {
    const payload = {
      ...formData,
      amount: Number(formData.amount),
      transactionDate: formatDate(formData.transactionDate)
    };

    if (editing) {
      await updateTransaction(editing.id, payload);
      await loadTransactions();
    } else {
      await createTransaction(payload);
      await loadTransactions();
    }

    closeModal();
  };

  const handleDelete = async (id) => {
    await deleteTransaction(id);
    await loadTransactions();
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-6 shadow">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Transactions</h1>
            <p className="text-sm text-slate-500">Manage your income and expenses.</p>
          </div>
          <button
            type="button"
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary-700"
            onClick={() => openModal()}
          >
            Add Transaction
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-slate-50 p-4">
            <div className="text-xs uppercase text-slate-500">Total Income</div>
            <div className="mt-2 text-xl font-semibold text-emerald-600">
              {formatCurrency(revenue.income)}
            </div>
          </div>
          <div className="rounded-lg border bg-slate-50 p-4">
            <div className="text-xs uppercase text-slate-500">Total Expense</div>
            <div className="mt-2 text-xl font-semibold text-rose-600">
              {formatCurrency(revenue.expense)}
            </div>
          </div>
          <div className="rounded-lg border bg-slate-50 p-4">
            <div className="text-xs uppercase text-slate-500">Current Balance</div>
            <div className={`mt-2 text-xl font-semibold ${revenue.balance >= 0 ? "text-primary-600" : "text-rose-600"}`}>
              {formatCurrency(revenue.balance)}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-white p-6 shadow">
        <div className="flex flex-wrap gap-4">
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-500">Date</th>
                <th className="px-4 py-3 font-medium text-slate-500">Type</th>
                <th className="px-4 py-3 font-medium text-slate-500">Category</th>
                <th className="px-4 py-3 font-medium text-slate-500">Amount</th>
                <th className="px-4 py-3 font-medium text-slate-500">Description</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredTransactions.length ? (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700">{formatDate(transaction.transaction_date)}</td>
                    <td className="px-4 py-3 capitalize text-slate-700">{transaction.type}</td>
                    <td className="px-4 py-3 text-slate-700">{transaction.category}</td>
                    <td className={`px-4 py-3 font-semibold ${transaction.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{transaction.description ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                          onClick={() => openModal(transaction)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="rounded-md border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                          onClick={() => handleDelete(transaction.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        title={editing ? "Edit Transaction" : "Add Transaction"}
        isOpen={modalOpen}
        onClose={closeModal}
      >
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col text-sm font-medium text-slate-600">
              <span>Type</span>
              <select
                className="mt-1 rounded-lg border px-3 py-2"
                {...register("type", { required: true })}
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </label>
            <label className="flex flex-col text-sm font-medium text-slate-600">
              <span>Category</span>
              <select
                className="mt-1 rounded-lg border px-3 py-2"
                {...register("category", { required: true })}
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col text-sm font-medium text-slate-600">
              <span>Amount</span>
              <input
                type="number"
                step="0.01"
                className="mt-1 rounded-lg border px-3 py-2"
                {...register("amount", { required: true, min: 0.01 })}
              />
              {errors.amount && <span className="mt-1 text-xs text-rose-500">Amount must be greater than zero.</span>}
            </label>
            <label className="flex flex-col text-sm font-medium text-slate-600">
              <span>Date</span>
              <input
                type="date"
                className="mt-1 rounded-lg border px-3 py-2"
                {...register("transactionDate", { required: true })}
              />
            </label>
          </div>

          <label className="flex flex-col text-sm font-medium text-slate-600">
            <span>Description</span>
            <textarea
              rows={3}
              className="mt-1 rounded-lg border px-3 py-2"
              {...register("description")}
            />
          </label>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              {editing ? "Save Changes" : "Create Transaction"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TransactionsPage;
