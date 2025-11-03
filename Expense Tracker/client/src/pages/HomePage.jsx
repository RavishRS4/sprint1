import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-xl text-center p-8">
        <div className="mx-auto mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white font-bold">
          ET
        </div>
        <h1 className="text-3xl font-bold text-slate-800">Expense Tracker</h1>
        <p className="mt-3 text-slate-500">Track expenses, set goals, and stay on budget.</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/login" className="px-5 py-2.5 rounded-md bg-primary-600 text-white hover:bg-primary-700">
            Sign in
          </Link>
          <Link to="/register" className="px-5 py-2.5 rounded-md border border-primary-200 text-primary-700 hover:bg-primary-50">
            Create account
          </Link>
          <Link to="/app" className="px-5 py-2.5 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50">
            Go to app
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
