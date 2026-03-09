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
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-100 p-4 grid place-items-center">
      <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-300/30">
        <h1 className="text-2xl font-bold text-slate-900">Login</h1>
        <p className="mt-1 text-sm text-slate-600">
          Sign in to access your dashboard.
        </p>

        <form className="mt-5 grid gap-3" onSubmit={handleSubmit}>
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="username"
          >
            Username or Email
          </label>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            id="username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Enter username or email"
          />

          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="password"
          >
            Password
          </label>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter password"
          />

          {formError ? (
            <p className="text-sm text-red-600">{formError}</p>
          ) : null}
          {loginError ? (
            <p className="text-sm text-red-600">{loginError}</p>
          ) : null}

          <button
            className="mt-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;
