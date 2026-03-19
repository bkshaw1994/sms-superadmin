import { useState } from "react";
import { BadgePlus, Building2, Upload } from "lucide-react";
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
    <section className="app-panel mx-auto max-w-5xl p-6 md:p-8">
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="page-kicker">Institution Setup</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950 md:text-4xl">
            Add School
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Register a school with its operational details. If the school code
            is left empty, it will be generated automatically from the school
            name.
          </p>
        </div>

        <div className="app-panel-muted flex items-center gap-3 px-4 py-3 text-sm text-slate-700">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-50 text-teal-700">
            <Building2 size={18} />
          </div>
          <div>
            <p className="font-semibold text-slate-900">School profile</p>
            <p>Prepare contact, location, and logo details before saving.</p>
          </div>
        </div>
      </div>

      <form
        className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2"
        onSubmit={handleSubmit}
      >
        <label className="field-label md:col-span-2">
          School Name
          <input
            className="field-input"
            type="text"
            value={formValues.schoolName}
            onChange={handleChange("schoolName")}
            required
          />
        </label>

        <label className="field-label">
          School Code (optional)
          <input
            className="field-input uppercase"
            type="text"
            value={formValues.schoolCode}
            onChange={handleChange("schoolCode")}
            placeholder="Auto-generated if empty"
          />
        </label>

        <label className="field-label">
          Number
          <input
            className="field-input"
            type="tel"
            value={formValues.number}
            onChange={handleChange("number")}
            required
          />
        </label>

        <label className="field-label md:col-span-2">
          Address
          <textarea
            className="field-textarea"
            value={formValues.address}
            onChange={handleChange("address")}
            rows={3}
            required
          />
        </label>

        <label className="field-label">
          Website
          <input
            className="field-input"
            type="url"
            value={formValues.website}
            onChange={handleChange("website")}
            placeholder="https://example.edu"
          />
        </label>

        <label className="field-label">
          School Email ID
          <input
            className="field-input"
            type="email"
            value={formValues.schoolEmail}
            onChange={handleChange("schoolEmail")}
            required
          />
        </label>

        <label className="field-label">
          City
          <input
            className="field-input"
            type="text"
            value={formValues.city}
            onChange={handleChange("city")}
            required
          />
        </label>

        <label className="field-label">
          State
          <input
            className="field-input"
            type="text"
            value={formValues.state}
            onChange={handleChange("state")}
            required
          />
        </label>

        <label className="field-label md:col-span-2">
          Logo Image Upload
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3 text-slate-700">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-teal-700 shadow-sm">
                  <Upload size={18} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    Upload school logo
                  </p>
                  <p className="text-sm text-slate-500">
                    PNG, JPG, or any image format supported by your browser.
                  </p>
                </div>
              </div>
              <input
                className="field-input max-w-sm"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
              />
            </div>
          </div>
          {formValues.logoFile ? (
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
              <BadgePlus size={14} />
              Selected: {formValues.logoFile.name}
            </span>
          ) : null}
        </label>

        {submitError ? (
          <p className="md:col-span-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </p>
        ) : null}

        {submitSuccess ? (
          <p className="md:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            School created successfully.
          </p>
        ) : null}

        <div className="md:col-span-2 flex flex-wrap items-center gap-3 pt-2">
          <button
            className="primary-button gap-2"
            type="submit"
            disabled={isSubmitting}
          >
            <Building2 size={16} />
            {isSubmitting ? "Saving..." : "Create School"}
          </button>
          <span className="text-sm text-slate-500">
            Review the school code and contact information before submission.
          </span>
        </div>
      </form>
    </section>
  );
}

export default AddSchoolForm;
