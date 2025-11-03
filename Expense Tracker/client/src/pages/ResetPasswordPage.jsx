import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { resetPassword } from "../services/auth.js";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({ defaultValues: { password: "", confirmPassword: "" } });

  const onSubmit = async (formData) => {
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await resetPassword({ token, password: formData.password });
      navigate("/login", { replace: true, state: { resetSuccess: true } });
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to reset password. Please try again.");
    }
  };

  const passwordValue = watch("password");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-primary-700">Create a new password</h1>
          <p className="mt-2 text-sm text-slate-500">Enter and confirm your new password to regain access.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <label className="flex flex-col text-sm font-medium text-slate-600">
            <span>New password</span>
            <input
              type="password"
              className="mt-1 rounded-lg border px-3 py-2"
              {...register("password", { required: "Password is required", minLength: { value: 6, message: "Minimum 6 characters" } })}
            />
            {errors.password && <span className="mt-1 text-xs text-rose-500">{errors.password.message}</span>}
          </label>
          <label className="flex flex-col text-sm font-medium text-slate-600">
            <span>Confirm password</span>
            <input
              type="password"
              className="mt-1 rounded-lg border px-3 py-2"
              {...register("confirmPassword", {
                required: "Confirm your password",
                validate: (value) => value === passwordValue || "Passwords do not match"
              })}
            />
            {errors.confirmPassword && <span className="mt-1 text-xs text-rose-500">{errors.confirmPassword.message}</span>}
          </label>
          {error && <div className="rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</div>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary-700 disabled:opacity-75"
          >
            {isSubmitting ? "Updating..." : "Reset password"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          <Link to="/login" className="font-semibold text-primary-600 hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
