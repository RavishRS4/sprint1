import { NavLink, Outlet } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext.jsx";

const navItems = [
  { to: "/app", label: "Dashboard", end: true },
  { to: "/app/transactions", label: "Transactions" },
  { to: "/app/goals", label: "Goals" },
  { to: "/app/reports", label: "Reports" }
];

const Layout = () => {
  const { user, logout } = useAuthContext();

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      <aside className="hidden w-64 flex-col bg-white shadow-lg lg:flex">
        <div className="px-6 py-8 text-2xl font-semibold text-primary-600">Expense Tracker</div>
        <nav className="flex-1 space-y-1 px-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-2 font-medium transition hover:bg-primary-50 hover:text-primary-600 ${
                  isActive ? "bg-primary-100 text-primary-700" : "text-slate-700"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t px-6 py-4 text-sm text-slate-500">
          <div className="font-semibold text-slate-700">{user?.name}</div>
          <div className="truncate">{user?.email}</div>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center border-b bg-white px-4 py-3 shadow-sm lg:px-8">
          <div className="text-lg font-semibold text-primary-700 lg:hidden">Expense Tracker</div>
          <button
            onClick={logout}
            className="ml-auto rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary-700"
          >
            Logout
          </button>
        </header>
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
