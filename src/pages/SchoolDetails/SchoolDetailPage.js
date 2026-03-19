import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Building2, GraduationCap, ShieldCheck, Users } from "lucide-react";
import {
  fetchSchools,
  selectSchools,
  selectSchoolsStatus,
} from "../../features/schools/schoolsSlice";
import {
  fetchSchoolInsightSection,
  fetchSchoolInsights,
  selectSchoolInsights,
} from "../../features/schoolInsights/schoolInsightsSlice";
import {
  schoolCodeValue,
  schoolDisplayCode,
  schoolDisplayName,
  schoolDisplayStatus,
} from "../../utils/schoolHelpers";
import InsightTableSection from "../../components/schools/InsightTableSection";

function SchoolDetailPage({ token }) {
  const dispatch = useDispatch();
  const { schoolCode } = useParams();
  const schools = useSelector(selectSchools);
  const schoolsStatus = useSelector(selectSchoolsStatus);
  const schoolInsights = useSelector(selectSchoolInsights);

  useEffect(() => {
    if (token && schoolsStatus === "idle") {
      dispatch(fetchSchools());
    }
  }, [dispatch, token, schoolsStatus]);

  useEffect(() => {
    const decodedSchoolCode = decodeURIComponent(schoolCode || "");

    if (
      token &&
      decodedSchoolCode &&
      schoolInsights.schoolCode !== decodedSchoolCode
    ) {
      dispatch(fetchSchoolInsights(decodedSchoolCode));
    }
  }, [dispatch, token, schoolCode, schoolInsights.schoolCode]);

  const decodedSchoolCode = decodeURIComponent(schoolCode || "");
  const selectedSchool = schools.find(
    (school) => String(schoolCodeValue(school)) === decodedSchoolCode,
  );
  const isInsightsLoading = schoolInsights.status === "loading";

  const summaryCards = [
    {
      label: "Classes",
      value: schoolInsights.classwiseStudents.length,
      icon: GraduationCap,
    },
    { label: "Teachers", value: schoolInsights.teachers.length, icon: Users },
    { label: "Parents", value: schoolInsights.parents.length, icon: Users },
    {
      label: "Owners/IT Admin",
      value: schoolInsights.ownersItadmin.length,
      icon: ShieldCheck,
    },
  ];

  const renderSectionRetry = (sectionKey) => (
    <button
      className="ml-2 rounded border border-red-300 px-2 py-0.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
      type="button"
      disabled={schoolInsights.sectionLoading?.[sectionKey]}
      onClick={() =>
        dispatch(
          fetchSchoolInsightSection({
            schoolCode: decodedSchoolCode,
            section: sectionKey,
          }),
        )
      }
    >
      {schoolInsights.sectionLoading?.[sectionKey] ? "Retrying..." : "Retry"}
    </button>
  );

  return (
    <section className="mx-auto max-w-7xl space-y-5">
      <div className="app-panel p-6 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="page-kicker">School Insight View</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-950 md:text-4xl">
              School Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Review enrollment structure, staff, parents, and ownership data
              for the selected school.
            </p>
          </div>
        </div>
      </div>

      <div className="app-panel p-6 md:p-8">
        {selectedSchool ? (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-teal-800">
                <Building2 size={14} />
                Active Record
              </div>
              <h2 className="mt-4 text-3xl font-bold text-slate-950">
                {schoolDisplayName(selectedSchool)}
              </h2>
            </div>

            <div className="app-panel-muted p-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                Detail Snapshot
              </p>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <p>
                  <span className="font-semibold text-slate-900">
                    School Code:
                  </span>{" "}
                  {schoolDisplayCode(selectedSchool)}
                </p>
                <p>
                  <span className="font-semibold text-slate-900">Status:</span>{" "}
                  {schoolDisplayStatus(selectedSchool)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            School not found for code: {decodedSchoolCode}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <article key={card.label} className="metric-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="metric-label">{card.label}</p>
                <p className="metric-value text-4xl">{card.value}</p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-700">
                <card.icon size={20} />
              </div>
            </div>
          </article>
        ))}
      </div>

      {isInsightsLoading ? (
        <p className="app-panel-muted p-5 text-sm text-slate-600">
          Loading school dashboard data...
        </p>
      ) : null}

      {schoolInsights.error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {schoolInsights.error}
        </p>
      ) : null}

      {!isInsightsLoading ? (
        <div className="space-y-6">
          <InsightTableSection
            title="Class-wise Students"
            rows={schoolInsights.classwiseStudents}
            columns={[
              { key: "class_name", label: "Class" },
              { key: "section", label: "Section" },
              { key: "student_count", label: "Student Count" },
            ]}
            emptyMessage="No class-wise students found."
          />
          {schoolInsights.sectionErrors?.classwiseStudents ? (
            <p className="-mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              {schoolInsights.sectionErrors.classwiseStudents}
              {renderSectionRetry("classwiseStudents")}
            </p>
          ) : null}

          <InsightTableSection
            title="Teachers"
            rows={schoolInsights.teachers}
            columns={[
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Phone" },
            ]}
            emptyMessage="No teachers found."
          />
          {schoolInsights.sectionErrors?.teachers ? (
            <p className="-mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              {schoolInsights.sectionErrors.teachers}
              {renderSectionRetry("teachers")}
            </p>
          ) : null}

          <InsightTableSection
            title="Parents"
            rows={schoolInsights.parents}
            columns={[
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Phone" },
            ]}
            emptyMessage="No parents found."
          />
          {schoolInsights.sectionErrors?.parents ? (
            <p className="-mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              {schoolInsights.sectionErrors.parents}
              {renderSectionRetry("parents")}
            </p>
          ) : null}

          <InsightTableSection
            title="Owner / IT Admin"
            rows={schoolInsights.ownersItadmin}
            columns={[
              { key: "name", label: "Name" },
              { key: "role", label: "Role" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Phone" },
            ]}
            emptyMessage="No owner or IT admin details found."
          />
          {schoolInsights.sectionErrors?.ownersItadmin ? (
            <p className="-mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              {schoolInsights.sectionErrors.ownersItadmin}
              {renderSectionRetry("ownersItadmin")}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export default SchoolDetailPage;
