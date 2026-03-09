import {
  schoolCodeValue,
  schoolDisplayCode,
  schoolDisplayName,
  schoolDisplayStatus,
} from "../../utils/schoolHelpers";

function SchoolsTable({ schools, onRowDoubleClick }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <p className="px-3 py-2 text-xs text-slate-500">
        Double-click any row to open school details.
      </p>
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">
              School Name
            </th>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">
              School Code
            </th>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {schools.map((school, index) => {
            const schoolCode = schoolCodeValue(school);
            const key = schoolCode || `${schoolDisplayName(school)}-${index}`;
            const isClickable = Boolean(schoolCode);

            return (
              <tr
                key={key}
                className={`transition hover:bg-cyan-50 ${isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
                onDoubleClick={() => {
                  if (schoolCode) {
                    onRowDoubleClick(String(schoolCode));
                  }
                }}
              >
                <td className="px-3 py-2 text-slate-800 font-medium">
                  {schoolDisplayName(school)}
                </td>
                <td className="px-3 py-2 text-slate-700">
                  {schoolDisplayCode(school)}
                </td>
                <td className="px-3 py-2">
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                    {schoolDisplayStatus(school)}
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
