import { useMemo, useState } from "react";
import {
  schoolDisplayCode,
  schoolCodeValue,
  schoolDisplayName,
  schoolRouteId,
} from "../../utils/schoolHelpers";

const initialValues = {
  schoolCode: "",
  fullName: "",
  email: "",
  phone: "",
};

function AddOwnerForm({
  schools,
  onSubmit,
  isSubmitting,
  submitError,
  submitSuccess,
}) {
  const [formValues, setFormValues] = useState(initialValues);

  const schoolOptions = useMemo(() => {
    return (schools || []).map((school) => ({
      id: schoolRouteId(school),
      code: schoolCodeValue(school),
      label: schoolDisplayName(school),
      displayCode: schoolDisplayCode(school),
    }));
  }, [schools]);

  const handleChange = (field) => (event) => {
    setFormValues((previousValues) => ({
      ...previousValues,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await onSubmit(formValues);
      setFormValues(initialValues);
    } catch {
      // Error UI is handled by submitError from parent.
    }
  };

  return (
    <section className="mx-auto max-w-4xl rounded-xl border border-cyan-200 bg-white/90 p-6 shadow-xl shadow-cyan-100/60 md:p-8">
      <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
        Add Owner
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Select school first, then provide owner details.
      </p>

      <form
        className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"
        onSubmit={handleSubmit}
      >
        <label className="flex flex-col gap-1 text-sm text-slate-700 md:col-span-2">
          School
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-cyan-500"
            value={formValues.schoolCode}
            onChange={handleChange("schoolCode")}
            required
          >
            <option value="">Select a school</option>
            {schoolOptions.map((school) => (
              <option
                key={school.id || `${school.label}-${school.displayCode}`}
                value={school.code}
                disabled={!school.code}
              >
                {school.label} ({school.displayCode})
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Phone Number
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-cyan-500"
            type="tel"
            value={formValues.phone}
            onChange={handleChange("phone")}
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Owner Name
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-cyan-500"
            type="text"
            value={formValues.fullName}
            onChange={handleChange("fullName")}
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Owner Email ID
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-cyan-500"
            type="email"
            value={formValues.email}
            onChange={handleChange("email")}
            required
          />
        </label>

        {submitError ? (
          <p className="md:col-span-2 text-sm text-red-600">{submitError}</p>
        ) : null}

        {submitSuccess ? (
          <p className="md:col-span-2 text-sm text-emerald-700">
            Owner details saved successfully.
          </p>
        ) : null}

        <div className="md:col-span-2">
          <button
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            type="submit"
            disabled={isSubmitting || schoolOptions.length === 0}
          >
            {isSubmitting ? "Saving..." : "Save Details"}
          </button>
          {schoolOptions.length === 0 ? (
            <p className="mt-2 text-xs text-amber-700">
              No schools available. Please add a school first.
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}

export default AddOwnerForm;
