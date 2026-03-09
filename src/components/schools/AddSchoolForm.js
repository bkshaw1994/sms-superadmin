import { useState } from "react";
import { generateSchoolCodeFromName } from "../../utils/schoolHelpers";

const initialFormValues = {
  schoolName: "",
  schoolCode: "",
  address: "",
  number: "",
  website: "",
  city: "",
  state: "",
  schoolEmail: "",
  logoFile: null,
};

function AddSchoolForm({ onSubmit, isSubmitting, submitError, submitSuccess }) {
  const [formValues, setFormValues] = useState(initialFormValues);

  const handleChange = (field) => (event) => {
    setFormValues((previousValues) => ({
      ...previousValues,
      [field]: event.target.value,
    }));
  };

  const handleLogoChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;

    setFormValues((previousValues) => ({
      ...previousValues,
      logoFile: selectedFile,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const computedCode =
      formValues.schoolCode.trim() ||
      generateSchoolCodeFromName(formValues.schoolName);

    try {
      await onSubmit({
        ...formValues,
        schoolCode: computedCode,
      });

      setFormValues(initialFormValues);
    } catch {
      // Error UI is shown by parent-provided submitError.
    }
  };

  return (
    <section className="mx-auto max-w-4xl rounded-xl border border-cyan-200 bg-white/90 p-6 shadow-xl shadow-cyan-100/60 md:p-8">
      <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
        Add School
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        If school code is empty, initials from school name are used in
        uppercase.
      </p>

      <form
        className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"
        onSubmit={handleSubmit}
      >
        <label className="flex flex-col gap-1 text-sm text-slate-700 md:col-span-2">
          School Name
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-cyan-500"
            type="text"
            value={formValues.schoolName}
            onChange={handleChange("schoolName")}
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-700">
          School Code (optional)
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 uppercase outline-none focus:border-cyan-500"
            type="text"
            value={formValues.schoolCode}
            onChange={handleChange("schoolCode")}
            placeholder="Auto-generated if empty"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Number
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-cyan-500"
            type="tel"
            value={formValues.number}
            onChange={handleChange("number")}
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-700 md:col-span-2">
          Address
          <textarea
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-cyan-500"
            value={formValues.address}
            onChange={handleChange("address")}
            rows={3}
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Website
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-cyan-500"
            type="url"
            value={formValues.website}
            onChange={handleChange("website")}
            placeholder="https://example.edu"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-700">
          School Email ID
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-cyan-500"
            type="email"
            value={formValues.schoolEmail}
            onChange={handleChange("schoolEmail")}
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-700">
          City
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-cyan-500"
            type="text"
            value={formValues.city}
            onChange={handleChange("city")}
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-700">
          State
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-cyan-500"
            type="text"
            value={formValues.state}
            onChange={handleChange("state")}
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-700 md:col-span-2">
          Logo Image Upload
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-cyan-500"
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
          />
          {formValues.logoFile ? (
            <span className="text-xs text-slate-500">
              Selected: {formValues.logoFile.name}
            </span>
          ) : null}
        </label>

        {submitError ? (
          <p className="md:col-span-2 text-sm text-red-600">{submitError}</p>
        ) : null}

        {submitSuccess ? (
          <p className="md:col-span-2 text-sm text-emerald-700">
            School created successfully.
          </p>
        ) : null}

        <div className="md:col-span-2">
          <button
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Create School"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default AddSchoolForm;
