import { useMemo, useState } from "react";
import { Building2, UserRoundPlus } from "lucide-react";
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
    <section className="app-panel mx-auto max-w-5xl p-6 md:p-8">
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="page-kicker">Ownership Management</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950 md:text-4xl">
            Add Owner
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Select a school and attach the primary owner details so account
            responsibility is clear from the start.
          </p>
        </div>

        <div className="app-panel-muted flex items-center gap-3 px-4 py-3 text-sm text-slate-700">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-50 text-amber-700">
            <Building2 size={18} />
          </div>
          <div>
            <p className="font-semibold text-slate-900">School required</p>
            <p>Owners can only be assigned after a school exists.</p>
          </div>
        </div>
      </div>

      <form
        className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2"
        onSubmit={handleSubmit}
      >
        <label className="field-label md:col-span-2">
          School
          <select
            className="field-select"
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

        <label className="field-label">
          Phone Number
          <input
            className="field-input"
            type="tel"
            value={formValues.phone}
            onChange={handleChange("phone")}
            required
          />
        </label>

        <label className="field-label">
          Owner Name
          <input
            className="field-input"
            type="text"
            value={formValues.fullName}
            onChange={handleChange("fullName")}
            required
          />
        </label>

        <label className="field-label">
          Owner Email ID
          <input
            className="field-input"
            type="email"
            value={formValues.email}
            onChange={handleChange("email")}
            required
          />
        </label>

        {submitError ? (
          <p className="md:col-span-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </p>
        ) : null}

        {submitSuccess ? (
          <p className="md:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Owner details saved successfully.
          </p>
        ) : null}

        <div className="md:col-span-2 flex flex-wrap items-center gap-3 pt-2">
          <button
            className="primary-button gap-2"
            type="submit"
            disabled={isSubmitting || schoolOptions.length === 0}
          >
            <UserRoundPlus size={16} />
            {isSubmitting ? "Saving..." : "Save Details"}
          </button>
          {schoolOptions.length === 0 ? (
            <p className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
              No schools available. Please add a school first.
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}

export default AddOwnerForm;
