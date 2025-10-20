import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../services/auth.js";
import { useForgotPasswordContext } from "../context/ForgotPasswordContext.jsx";

const ForgotPasswordPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const { setEmail, setResetLink, setDelivered, delivered, resetLink, email } = useForgotPasswordContext();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ defaultValues: { email: "" } });

  const onSubmit = async (formData) => {
    const data = await requestPasswordReset(formData);
    setSubmitted(true);
    setEmail(formData.email);
    setDelivered(Boolean(data?.delivered));
    setResetLink(data?.resetLink ?? "");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-primary-700">Reset your password</h1>
          <p className="mt-2 text-sm text-slate-500">
            Enter your registered email and we&apos;ll send instructions to reset your password.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4 text-center">
            <div className="rounded-lg bg-primary-50 px-4 py-3 text-sm text-primary-700">
              {delivered
                ? "If the email exists in our system, a reset link has been sent. Please check your inbox."
                : "Email delivery is currently unavailable. Use the reset link below to continue."}
            </div>
            {!delivered && resetLink && (
              <div className="rounded-lg border border-dashed border-primary-200 bg-white px-4 py-3 text-sm text-slate-600">
                <div className="text-xs uppercase text-slate-400">Reset link</div>
                <a href={resetLink} className="break-words font-semibold text-primary-600" rel="noreferrer">
                  {resetLink}
                </a>
              </div>
            )}
            {email && !delivered && (
              <p className="text-xs text-slate-500">
                Copy the link above and open it in your browser to reset the password for <span className="font-semibold">{email}</span>.
              </p>
            )}
            <Link to="/login" className="text-sm font-semibold text-primary-600 hover:underline">
              Return to sign in
            </Link>
          </div>
        ) : (
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
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary-700 disabled:opacity-75"
            >
              {isSubmitting ? "Sending..." : "Send reset link"}
            </button>
            <div className="text-center text-sm text-slate-500">
              Remembered your password?{" "}
              <Link to="/login" className="font-semibold text-primary-600 hover:underline">
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
