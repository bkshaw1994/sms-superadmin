import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchSchools,
  selectSchools,
  selectSchoolsError,
  selectSchoolsStatus,
} from "../../features/schools/schoolsSlice";
import { fetchSchoolInsights } from "../../features/schoolInsights/schoolInsightsSlice";
import Sidebar from "../../components/layout/Sidebar";
import SchoolsTable from "../../components/schools/SchoolsTable";

function DashboardPage({ username, token, onLogout }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const schools = useSelector(selectSchools);
  const schoolsStatus = useSelector(selectSchoolsStatus);
  const schoolsError = useSelector(selectSchoolsError);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isSchoolsLoading = schoolsStatus === "loading";

  useEffect(() => {
    if (token) {
      dispatch(fetchSchools());
    }
  }, [dispatch, token]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-cyan-50 to-indigo-100">
      <section className="flex min-h-screen">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() =>
            setIsSidebarCollapsed((previousState) => !previousState)
          }
          onLogout={onLogout}
        />

        <div className="flex-1 p-4 md:p-8">
          <section className="mx-auto max-w-4xl rounded-xl border border-cyan-200 bg-white/90 p-6 shadow-xl shadow-cyan-100/60 md:p-8">
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Dashboard
            </h1>
            <p className="mt-2 text-slate-700">Welcome, {username}.</p>
            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  Schools
                </h2>
                {!isSchoolsLoading && !schoolsError ? (
                  <span className="text-sm text-slate-500">
                    Total: {schools.length}
                  </span>
                ) : null}
                {isSchoolsLoading ? (
                  <span className="text-sm text-slate-500">Loading...</span>
                ) : null}
              </div>

              {schoolsError ? (
                <p className="text-sm text-red-600">{schoolsError}</p>
              ) : null}

              {!isSchoolsLoading && !schoolsError && schools.length === 0 ? (
                <p className="text-sm text-slate-600">No schools found.</p>
              ) : null}

              {!isSchoolsLoading && !schoolsError && schools.length > 0 ? (
                <SchoolsTable
                  schools={schools}
                  onRowDoubleClick={(schoolCode) => {
                    dispatch(fetchSchoolInsights(schoolCode));
                    navigate(
                      `/dashboard/schools/${encodeURIComponent(schoolCode)}`,
                    );
                  }}
                />
              ) : null}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default DashboardPage;
