import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
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

function SchoolDetailPage({ token, onLogout }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
      label: "Class-wise Students",
      value: schoolInsights.classwiseStudents.length,
    },
    { label: "Teachers", value: schoolInsights.teachers.length },
    { label: "Parents", value: schoolInsights.parents.length },
    { label: "Owners/IT Admin", value: schoolInsights.ownersItadmin.length },
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
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-cyan-50 to-indigo-100 p-4 md:p-8">
      <section className="mx-auto max-w-6xl rounded-xl border border-cyan-200 bg-white/90 p-6 shadow-xl shadow-cyan-100/60 md:p-8">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-900">
            School Dashboard
          </h1>
          <button
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            type="button"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          {selectedSchool ? (
            <div className="space-y-2 text-sm text-slate-700">
              <p>
                <span className="font-semibold text-slate-900">
                  School Code:
                </span>{" "}
                {decodedSchoolCode}
              </p>
              <p>
                <span className="font-semibold text-slate-900">
                  School Name:
                </span>{" "}
                {schoolDisplayName(selectedSchool)}
              </p>
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
          ) : (
            <p className="text-sm text-red-600">
              School not found for code: {decodedSchoolCode}
            </p>
          )}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {summaryCards.map((card) => (
            <article
              key={card.label}
              className="rounded-lg border border-slate-200 bg-slate-50 p-3"
            >
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {card.label}
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {card.value}
              </p>
            </article>
          ))}
        </div>

        {isInsightsLoading ? (
          <p className="mt-5 text-sm text-slate-500">
            Loading school dashboard data...
          </p>
        ) : null}

        {schoolInsights.error ? (
          <p className="mt-5 text-sm text-red-600">{schoolInsights.error}</p>
        ) : null}

        {!isInsightsLoading ? (
          <div className="mt-5 space-y-5">
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
              <p className="-mt-3 text-xs text-red-600">
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
              <p className="-mt-3 text-xs text-red-600">
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
              <p className="-mt-3 text-xs text-red-600">
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
              <p className="-mt-3 text-xs text-red-600">
                {schoolInsights.sectionErrors.ownersItadmin}
                {renderSectionRetry("ownersItadmin")}
              </p>
            ) : null}
          </div>
        ) : null}

        <button
          className="mt-5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          type="button"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </section>
    </main>
  );
}

export default SchoolDetailPage;
