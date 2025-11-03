import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext.jsx";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuthContext();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      salary: ""
    }
  });

  const onSubmit = async (formData) => {
    await registerUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      salary: formData.salary ? Number(formData.salary) : undefined
    });
    navigate("/app");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-semibold text-primary-700">Create your Expense Tracker account</h1>
          <p className="mt-2 text-sm text-slate-500">Track income, expenses, and goals in minutes.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <label className="flex flex-col text-sm font-medium text-slate-600">
            <span>Name</span>
            <input
              className="mt-1 rounded-lg border px-3 py-2"
              {...register("name", { required: "Name is required" })}
              type="text"
            />
            {errors.name && <span className="mt-1 text-xs text-rose-500">{errors.name.message}</span>}
          </label>
          <label className="flex flex-col text-sm font-medium text-slate-600">
            <span>Email</span>
            <input
              type="email"
              className="mt-1 rounded-lg border px-3 py-2"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && <span className="mt-1 text-xs text-rose-500">{errors.email.message}</span>}
          </label>
          <label className="flex flex-col text-sm font-medium text-slate-600">
            <span>Password</span>
            <input
              type="password"
              className="mt-1 rounded-lg border px-3 py-2"
              {...register("password", { required: "Password is required", minLength: { value: 6, message: "Minimum 6 characters" } })}
            />
            {errors.password && <span className="mt-1 text-xs text-rose-500">{errors.password.message}</span>}
          </label>
          <label className="flex flex-col text-sm font-medium text-slate-600">
            <span>Monthly Salary (optional)</span>
            <input
              type="number"
              step="0.01"
              className="mt-1 rounded-lg border px-3 py-2"
              {...register("salary", { min: { value: 0, message: "Salary must be positive" } })}
            />
            {errors.salary && <span className="mt-1 text-xs text-rose-500">{errors.salary.message}</span>}
          </label>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary-700 disabled:opacity-75"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary-600 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
