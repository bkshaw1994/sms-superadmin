import { useEffect, useMemo, useState } from "react";

function InsightTableSection({ title, rows, columns, emptyMessage }) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState(columns[0]?.key || "");
  const [sortDirection, setSortDirection] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    setPage(1);
  }, [query, sortKey, sortDirection, pageSize]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return rows;
    }

    return rows.filter((row) =>
      columns.some((column) => {
        const value = row?.[column.key];
        return String(value ?? "")
          .toLowerCase()
          .includes(normalizedQuery);
      }),
    );
  }, [rows, columns, query]);

  const sortedRows = useMemo(() => {
    if (!sortKey) {
      return filteredRows;
    }

    const sorted = [...filteredRows].sort((a, b) => {
      const valueA = String(a?.[sortKey] ?? "").toLowerCase();
      const valueB = String(b?.[sortKey] ?? "").toLowerCase();

      if (valueA < valueB) {
        return sortDirection === "asc" ? -1 : 1;
      }

      if (valueA > valueB) {
        return sortDirection === "asc" ? 1 : -1;
      }

      return 0;
    });

    return sorted;
  }, [filteredRows, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRows = sortedRows.slice(startIndex, startIndex + pageSize);

  const handleHeaderSort = (columnKey) => {
    if (sortKey === columnKey) {
      setSortDirection((previousDirection) =>
        previousDirection === "asc" ? "desc" : "asc",
      );
      return;
    }

    setSortKey(columnKey);
    setSortDirection("asc");
  };

  const sortIndicator = (columnKey) => {
    if (sortKey !== columnKey) {
      return "";
    }

    return sortDirection === "asc" ? "(Asc)" : "(Desc)";
  };

  return (
    <section>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <span className="text-xs text-slate-500">
          Rows: {sortedRows.length}
        </span>
      </div>

      {rows.length > 0 ? (
        <div className="mb-2 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-2">
          <input
            className="min-w-[180px] flex-1 rounded border border-slate-300 px-2 py-1 text-sm"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search in table..."
          />

          <select
            className="rounded border border-slate-300 px-2 py-1 text-sm"
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value)}
          >
            {columns.map((column) => (
              <option key={column.key} value={column.key}>
                Sort by {column.label}
              </option>
            ))}
          </select>

          <button
            className="rounded border border-slate-300 px-2 py-1 text-sm"
            type="button"
            onClick={() =>
              setSortDirection((previousDirection) =>
                previousDirection === "asc" ? "desc" : "asc",
              )
            }
          >
            {sortDirection === "asc" ? "Asc" : "Desc"}
          </button>

          <select
            className="rounded border border-slate-300 px-2 py-1 text-sm"
            value={pageSize}
            onChange={(event) => setPageSize(Number(event.target.value))}
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
          </select>
        </div>
      ) : null}

      {rows.length === 0 ? (
        <p className="text-sm text-slate-600">{emptyMessage}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-100">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-3 py-2 text-left font-semibold text-slate-700"
                  >
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded px-1 py-0.5 hover:bg-slate-200"
                      onClick={() => handleHeaderSort(column.key)}
                    >
                      <span>{column.label}</span>
                      <span className="text-xs text-slate-500">
                        {sortIndicator(column.key)}
                      </span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRows.map((row, rowIndex) => (
                <tr
                  key={`${rowIndex}-${columns[0]?.key || "row"}`}
                  className="hover:bg-slate-50"
                >
                  {columns.map((column) => (
                    <td
                      key={`${rowIndex}-${column.key}`}
                      className="px-3 py-2 text-slate-700"
                    >
                      {row?.[column.key] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between border-t border-slate-200 px-3 py-2 text-xs text-slate-600">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                className="rounded border border-slate-300 px-2 py-1 disabled:opacity-40"
                type="button"
                disabled={currentPage <= 1}
                onClick={() =>
                  setPage((previousPage) => Math.max(1, previousPage - 1))
                }
              >
                Prev
              </button>
              <button
                className="rounded border border-slate-300 px-2 py-1 disabled:opacity-40"
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setPage((previousPage) =>
                    Math.min(totalPages, previousPage + 1),
                  )
                }
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default InsightTableSection;
