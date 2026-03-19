import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Building2,
  CheckCircle2,
  School,
  UserRoundPlus,
} from "lucide-react";
import {
  fetchSchools,
  selectSchools,
  selectSchoolsError,
  selectSchoolsStatus,
} from "../../features/schools/schoolsSlice";
import { fetchSchoolInsights } from "../../features/schoolInsights/schoolInsightsSlice";
import SchoolsTable from "../../components/schools/SchoolsTable";
import { schoolDisplayStatus } from "../../utils/schoolHelpers";

function DashboardPage({ username, token }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const schools = useSelector(selectSchools);
  const schoolsStatus = useSelector(selectSchoolsStatus);
  const schoolsError = useSelector(selectSchoolsError);
  const isSchoolsLoading = schoolsStatus === "loading";
  const activeSchools = useMemo(
    () =>
      schools.filter(
        (school) => schoolDisplayStatus(school).toUpperCase() === "ACTIVE",
      ).length,
    [schools],
  );
  const needsAttention = Math.max(schools.length - activeSchools, 0);
  const dashboardMetrics = [
    {
      label: "Registered Schools",
      value: schools.length,
      note: isSchoolsLoading
        ? "Refreshing school directory"
        : "Institutions in the workspace",
      icon: School,
    },
    {
      label: "Active Status",
      value: activeSchools,
      note: "Schools currently marked active",
      icon: CheckCircle2,
    },
    {
      label: "Needs Attention",
      value: needsAttention,
      note: "Records with a non-active status",
      icon: Activity,
    },
    {
      label: "Ownership Setup",
      value: schools.length > 0 ? "Open" : "Pending",
      note:
        schools.length > 0
          ? "Assign owners as new schools arrive"
          : "Add the first school to begin",
      icon: UserRoundPlus,
    },
  ];

  useEffect(() => {
    if (token) {
      dispatch(fetchSchools());
    }
  }, [dispatch, token]);

  const handleMenuSelect = (menuLabel) => {
    if (menuLabel === "Add School") {
      navigate("/dashboard/add-school");
      return;
    }

    if (menuLabel === "Add Owner") {
      navigate("/dashboard/add-owner");
      return;
    }

    navigate("/dashboard");
  };

  return (
    <div className="space-y-5">
      <section className="app-panel overflow-hidden p-6 md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="page-kicker">Administrative Workspace</p>
            <h1 className="page-title mt-3">School management dashboard</h1>
            <p className="page-subtitle mt-3 max-w-2xl">
              Welcome, {username}. Use this workspace to onboard schools, assign
              owners, and inspect school-level insight data with a cleaner
              operational view.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="secondary-button gap-2"
              type="button"
              onClick={() => handleMenuSelect("Add Owner")}
            >
              <UserRoundPlus size={16} />
              Add Owner
            </button>
            <button
              className="primary-button gap-2"
              type="button"
              onClick={() => handleMenuSelect("Add School")}
            >
              <Building2 size={16} />
              Add School
            </button>
          </div>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardMetrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <article key={metric.label} className="metric-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="metric-label">{metric.label}</p>
                  <p className="metric-value">{metric.value}</p>
                  <p className="metric-note">{metric.note}</p>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-700">
                  <Icon size={20} />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="app-panel p-6 md:p-8">
        <div className="flex flex-col gap-5 border-b border-slate-200/80 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="page-kicker">Directory</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950">
              Schools overview
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Review registered schools and open a record to inspect class,
              teacher, parent, and ownership insight data.
            </p>
          </div>

          <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Double-click any school row to open its full insight view.
          </div>
        </div>

        <div className="mt-6">
          {schoolsError ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {schoolsError}
            </p>
          ) : null}

          {isSchoolsLoading ? (
            <div className="app-panel-muted p-6 text-sm text-slate-600">
              Loading school directory...
            </div>
          ) : null}

          {!isSchoolsLoading && !schoolsError && schools.length === 0 ? (
            <div className="app-panel-muted flex flex-col items-start gap-4 p-6 text-sm text-slate-600">
              <p>No schools have been added yet.</p>
              <button
                className="primary-button gap-2"
                type="button"
                onClick={() => handleMenuSelect("Add School")}
              >
                <Building2 size={16} />
                Create First School
              </button>
            </div>
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
  );
}

export default DashboardPage;
