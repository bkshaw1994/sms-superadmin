import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  resetSuperadminPassword,
  selectAuthDisplayName,
  selectAuthEmail,
  selectAuthPhone,
  selectAuthUsername,
  selectResetPasswordError,
  selectResetPasswordMessage,
  selectResetPasswordStatus,
} from "../../features/auth/authSlice";

function ProfilePage() {
  const dispatch = useDispatch();
  const displayName = useSelector(selectAuthDisplayName);
  const username = useSelector(selectAuthUsername);
  const email = useSelector(selectAuthEmail);
  const phone = useSelector(selectAuthPhone);
  const resetPasswordStatus = useSelector(selectResetPasswordStatus);
  const resetPasswordError = useSelector(selectResetPasswordError);
  const resetPasswordMessage = useSelector(selectResetPasswordMessage);
  const [activeTab, setActiveTab] = useState("profile");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");

  const isResetLoading = resetPasswordStatus === "loading";

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setFormError("Please fill all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError("New password and confirm password must match.");
      return;
    }

    if (currentPassword === newPassword) {
      setFormError("New password must be different from current password.");
      return;
    }

    setFormError("");

    try {
      await dispatch(
        resetSuperadminPassword({
          currentPassword,
          newPassword,
        }),
      ).unwrap();
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      // API errors are rendered from redux state.
    }
  };

  return (
    <div className="space-y-5">
      <section className="app-panel overflow-hidden p-6 md:p-8">
        <p className="page-kicker">Account</p>
        <h1 className="page-title mt-3">Profile settings</h1>
        <p className="page-subtitle mt-3 max-w-2xl">
          Manage your profile details and update your password securely.
        </p>

        <div className="mt-6 flex flex-wrap gap-3 border-b border-slate-200 pb-4">
          <button
            className={`${
              activeTab === "profile" ? "primary-button" : "secondary-button"
            } gap-2`}
            type="button"
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          <button
            className={`${
              activeTab === "reset-password"
                ? "primary-button"
                : "secondary-button"
            } gap-2`}
            type="button"
            onClick={() => setActiveTab("reset-password")}
          >
            Reset Password
          </button>
        </div>

        {activeTab === "profile" ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <article className="app-panel-muted p-5">
              <p className="metric-label">Display Name</p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                {displayName || "-"}
              </p>
            </article>
            <article className="app-panel-muted p-5">
              <p className="metric-label">Username</p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                {username || "-"}
              </p>
            </article>
            <article className="app-panel-muted p-5">
              <p className="metric-label">Email</p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                {email || "-"}
              </p>
            </article>
            <article className="app-panel-muted p-5">
              <p className="metric-label">Phone</p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                {phone || "-"}
              </p>
            </article>
          </div>
        ) : null}

        {activeTab === "reset-password" ? (
          <form
            className="mt-6 grid gap-4 max-w-xl"
            onSubmit={handleResetPassword}
          >
            <label className="field-label" htmlFor="current-password">
              Current Password
              <input
                className="field-input"
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="Enter current password"
              />
            </label>

            <label className="field-label" htmlFor="new-password">
              New Password
              <input
                className="field-input"
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Enter new password"
              />
            </label>

            <label className="field-label" htmlFor="confirm-password">
              Confirm Password
              <input
                className="field-input"
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm new password"
              />
            </label>

            {formError ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </p>
            ) : null}

            {resetPasswordError ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {resetPasswordError}
              </p>
            ) : null}

            {resetPasswordMessage ? (
              <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {resetPasswordMessage}
              </p>
            ) : null}

            <button
              className="primary-button mt-2 w-full gap-2"
              type="submit"
              disabled={isResetLoading}
            >
              {isResetLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        ) : null}
      </section>
    </div>
  );
}

export default ProfilePage;
