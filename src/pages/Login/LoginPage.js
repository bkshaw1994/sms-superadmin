import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  loginSuperadmin,
  selectAuthError,
  selectAuthStatus,
} from "../../features/auth/authSlice";

function LoginPage({ isAuthenticated }) {
  const dispatch = useDispatch();
  const loginStatus = useSelector(selectAuthStatus);
  const loginError = useSelector(selectAuthError);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const isLoading = loginStatus === "loading";

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
          <h2 className="mt-3 text-3xl font-bold text-slate-950">Sign in</h2>

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
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
