import {
  schoolCodeValue,
  schoolDisplayCode,
  schoolDisplayName,
  schoolDisplayStatus,
} from "../../utils/schoolHelpers";
import { ArrowUpRight } from "lucide-react";

function SchoolsTable({ schools, onRowDoubleClick }) {
  const statusClasses = (status) => {
    const normalizedStatus = String(status || "").toUpperCase();
    if (normalizedStatus === "ACTIVE") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }
    return "border-amber-200 bg-amber-50 text-amber-700";
  };

  return (
    <div className="table-shell overflow-x-auto">
      <div className="table-header-strip">
        <span>Schools</span>
        <span>{schools.length} Records</span>
      </div>
      <table className="table-base">
        <thead>
          <tr>
            <th className="table-th">School Name</th>
            <th className="table-th">School Code</th>
            <th className="table-th">Status</th>
          </tr>
        </thead>
        <tbody>
          {schools.map((school, index) => {
            const schoolCode = schoolCodeValue(school);
            const key = schoolCode || `${schoolDisplayName(school)}-${index}`;
            const isClickable = Boolean(schoolCode);
            const status = schoolDisplayStatus(school);

            return (
              <tr
                key={key}
                className={`table-row ${
                  isClickable
                    ? "cursor-pointer"
                    : "cursor-not-allowed opacity-60"
                }`}
                onDoubleClick={() => {
                  if (schoolCode) {
                    onRowDoubleClick(String(schoolCode));
                  }
                }}
              >
                <td className="table-td">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {schoolDisplayName(school)}
                      </p>
                    </div>
                    {isClickable ? (
                      <ArrowUpRight
                        size={16}
                        className="shrink-0 text-slate-400"
                      />
                    ) : null}
                  </div>
                </td>
                <td className="table-td font-semibold text-slate-700">
                  {schoolDisplayCode(school)}
                </td>
                <td className="table-td">
                  <span className={`status-pill ${statusClasses(status)}`}>
                    {status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default SchoolsTable;
