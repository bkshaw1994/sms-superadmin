import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  loginSuperadmin,
  selectAuthError,
  selectAuthStatus,
  requestPasswordResetOtp,
  selectForgotPasswordError,
  selectForgotPasswordMessage,
  selectForgotPasswordStatus,
  selectVerifyOtpError,
  selectVerifyOtpMessage,
  selectVerifyOtpStatus,
  verifyPasswordResetOtp,
} from "../../features/auth/authSlice";

function LoginPage({ isAuthenticated }) {
  const dispatch = useDispatch();
  const loginStatus = useSelector(selectAuthStatus);
  const loginError = useSelector(selectAuthError);
  const forgotPasswordStatus = useSelector(selectForgotPasswordStatus);
  const forgotPasswordError = useSelector(selectForgotPasswordError);
  const forgotPasswordMessage = useSelector(selectForgotPasswordMessage);
  const verifyOtpStatus = useSelector(selectVerifyOtpStatus);
  const verifyOtpError = useSelector(selectVerifyOtpError);
  const verifyOtpMessage = useSelector(selectVerifyOtpMessage);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotFormError, setForgotFormError] = useState("");
  const [otpFormError, setOtpFormError] = useState("");
  const isLoading = loginStatus === "loading";
  const isForgotPasswordLoading = forgotPasswordStatus === "loading";
  const isVerifyOtpLoading = verifyOtpStatus === "loading";

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedUsername = username.trim();

    if (!trimmedUsername || !password) {
      setFormError("Please enter username and password.");
      return;
    }

    setFormError("");
    dispatch(loginSuperadmin({ username: trimmedUsername, password }));
  };

  const handleForgotPasswordSubmit = async (event) => {
    event.preventDefault();
    const trimmedEmail = forgotEmail.trim();

    if (!trimmedEmail) {
      setForgotFormError("Please enter your registered email.");
      return;
    }

    setForgotFormError("");

    try {
      await dispatch(requestPasswordResetOtp({ email: trimmedEmail })).unwrap();
      setAuthMode("otp");
    } catch {
      // API errors are rendered from redux state.
    }
  };

  const handleOtpSubmit = async (event) => {
    event.preventDefault();
    const trimmedEmail = forgotEmail.trim();
    const trimmedOtp = otp.trim();

    if (!trimmedOtp || !forgotNewPassword || !forgotConfirmPassword) {
      setOtpFormError("Please enter OTP, new password, and confirm password.");
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setOtpFormError("New password and confirm password must match.");
      return;
    }

    setOtpFormError("");

    try {
      await dispatch(
        verifyPasswordResetOtp({
          email: trimmedEmail,
          otp: trimmedOtp,
          newPassword: forgotNewPassword,
        }),
      ).unwrap();
      setAuthMode("otp-verified");
      setOtp("");
      setForgotNewPassword("");
      setForgotConfirmPassword("");
    } catch {
      // API errors are rendered from redux state.
    }
  };

  return (
    <main className="app-canvas grid place-items-center">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/70 bg-white/75 shadow-[0_32px_90px_-42px_rgba(15,23,42,0.45)] backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative overflow-hidden bg-slate-950 px-6 py-8 text-white md:px-8 md:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.32),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.24),_transparent_35%)]" />
          <div className="relative flex h-full flex-col">
            <h1 className="text-4xl font-bold md:text-5xl">SMS Superadmin</h1>
            <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300 md:text-base">
              Access the school management system
            </p>
          </div>
        </div>

        <div className="px-6 py-8 md:px-8 md:py-10">
          <h2 className="mt-3 text-3xl font-bold text-slate-950">
            {authMode === "login" ? "Sign in" : "Forgot password"}
          </h2>

          {authMode === "login" ? (
            <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
              <label className="field-label" htmlFor="username">
                Username or Email
                <input
                  className="field-input"
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Enter username or email"
                />
              </label>

              <label className="field-label" htmlFor="password">
                Password
                <input
                  className="field-input"
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                />
              </label>

              <button
                className="justify-self-start text-sm font-semibold text-teal-700 transition hover:text-teal-800"
                type="button"
                onClick={() => {
                  setAuthMode("forgot");
                  setForgotEmail(username.trim());
                  setForgotFormError("");
                }}
              >
                Forgot password?
              </button>

              {formError ? (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </p>
              ) : null}
              {loginError ? (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {loginError}
                </p>
              ) : null}

              <button
                className="primary-button mt-2 w-full gap-2"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          ) : null}

          {authMode === "forgot" ? (
            <form
              className="mt-8 grid gap-4"
              onSubmit={handleForgotPasswordSubmit}
            >
              <p className="text-sm text-slate-600">
                Enter your registered email to receive an OTP.
              </p>
              <label className="field-label" htmlFor="forgot-email">
                Registered Email
                <input
                  className="field-input"
                  id="forgot-email"
                  type="email"
                  value={forgotEmail}
                  onChange={(event) => setForgotEmail(event.target.value)}
                  placeholder="Enter your registered email"
                />
              </label>

              {forgotFormError ? (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {forgotFormError}
                </p>
              ) : null}

              {forgotPasswordError ? (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {forgotPasswordError}
                </p>
              ) : null}

              {forgotPasswordMessage ? (
                <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  {forgotPasswordMessage}
                </p>
              ) : null}

              <button
                className="primary-button mt-2 w-full gap-2"
                type="submit"
                disabled={isForgotPasswordLoading}
              >
                {isForgotPasswordLoading ? "Sending OTP..." : "Send OTP"}
              </button>

              <button
                className="secondary-button mt-1 w-full"
                type="button"
                onClick={() => setAuthMode("login")}
              >
                Back to sign in
              </button>
            </form>
          ) : null}

          {authMode === "otp" || authMode === "otp-verified" ? (
            <form className="mt-8 grid gap-4" onSubmit={handleOtpSubmit}>
              <p className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
                Check your mail for OTP.
              </p>

              <label className="field-label" htmlFor="otp">
                Enter OTP
                <input
                  className="field-input"
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  placeholder="Enter OTP"
                />
              </label>

              <label className="field-label" htmlFor="forgot-new-password">
                New Password
                <input
                  className="field-input"
                  id="forgot-new-password"
                  type="password"
                  value={forgotNewPassword}
                  onChange={(event) => setForgotNewPassword(event.target.value)}
                  placeholder="Enter new password"
                />
              </label>

              <label className="field-label" htmlFor="forgot-confirm-password">
                Confirm Password
                <input
                  className="field-input"
                  id="forgot-confirm-password"
                  type="password"
                  value={forgotConfirmPassword}
                  onChange={(event) =>
                    setForgotConfirmPassword(event.target.value)
                  }
                  placeholder="Confirm new password"
                />
              </label>

              {otpFormError ? (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {otpFormError}
                </p>
              ) : null}

              {verifyOtpError ? (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {verifyOtpError}
                </p>
              ) : null}

              {verifyOtpMessage ? (
                <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  {verifyOtpMessage}
                </p>
              ) : null}

              <button
                className="primary-button mt-2 w-full gap-2"
                type="submit"
                disabled={isVerifyOtpLoading || authMode === "otp-verified"}
              >
                {isVerifyOtpLoading ? "Submitting..." : "Submit OTP"}
              </button>

              <button
                className="secondary-button mt-1 w-full"
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setOtp("");
                  setForgotNewPassword("");
                  setForgotConfirmPassword("");
                  setOtpFormError("");
                }}
              >
                Back to sign in
              </button>
            </form>
          ) : null}
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
