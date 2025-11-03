import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext.jsx";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (formData) => {
    setFormError("");
    try {
      await login(formData);
      navigate("/app");
    } catch (error) {
      const message = error?.response?.data?.message ?? "Unable to sign in. Please check your details and try again.";
      setFormError(message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-semibold text-primary-700">Expense Tracker</h1>
          <p className="mt-2 text-sm text-slate-500">Log in to track your expenses smarter.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && <span className="mt-1 text-xs text-rose-500">{errors.password.message}</span>}
          </label>
          <div className="text-right text-xs">
            <Link to="/forgot-password" className="font-semibold text-primary-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary-700 disabled:opacity-75"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {formError && (
          <div className="mt-4 rounded-lg bg-rose-100 px-4 py-3 text-sm text-rose-600">
            {formError}
          </div>
        )}

        <div className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-semibold text-primary-600 hover:underline">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
