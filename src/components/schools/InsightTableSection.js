import { useEffect, useMemo, useState } from "react";
import { ArrowDownUp, Search } from "lucide-react";

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
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
          Rows: {sortedRows.length}
        </span>
      </div>

      {rows.length > 0 ? (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-[24px] border border-slate-200/80 bg-white/85 p-3">
          <label className="relative min-w-[220px] flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className="control-input w-full pl-10"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search in table..."
            />
          </label>

          <select
            className="control-select"
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
            className="control-button gap-2"
            type="button"
            onClick={() =>
              setSortDirection((previousDirection) =>
                previousDirection === "asc" ? "desc" : "asc",
              )
            }
          >
            <ArrowDownUp size={15} />
            {sortDirection === "asc" ? "Asc" : "Desc"}
          </button>

          <select
            className="control-select"
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
        <p className="app-panel-muted p-5 text-sm text-slate-600">
          {emptyMessage}
        </p>
      ) : (
        <div className="table-shell overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className="table-th">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full px-2 py-1 transition hover:bg-white/10"
                      onClick={() => handleHeaderSort(column.key)}
                    >
                      <span>{column.label}</span>
                      <span className="text-[0.65rem] text-slate-300">
                        {sortIndicator(column.key)}
                      </span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row, rowIndex) => (
                <tr
                  key={`${rowIndex}-${columns[0]?.key || "row"}`}
                  className="table-row"
                >
                  {columns.map((column) => (
                    <td key={`${rowIndex}-${column.key}`} className="table-td">
                      {row?.[column.key] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                className="control-button"
                type="button"
                disabled={currentPage <= 1}
                onClick={() =>
                  setPage((previousPage) => Math.max(1, previousPage - 1))
                }
              >
                Prev
              </button>
              <button
                className="control-button"
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
