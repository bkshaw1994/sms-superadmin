import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { logout } from "../auth/authSlice";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function buildApiUrl(path) {
  return `${API_BASE_URL.replace(/\/$/, "")}${path}`;
}

function parseList(responseBody, preferredKeys) {
  if (Array.isArray(responseBody)) {
    return responseBody;
  }

  for (const key of preferredKeys) {
    if (Array.isArray(responseBody?.[key])) {
      return responseBody[key];
    }

    if (Array.isArray(responseBody?.data?.[key])) {
      return responseBody.data[key];
    }
  }

  if (Array.isArray(responseBody?.data)) {
    return responseBody.data;
  }

  return [];
}

function normalizeClasswiseStudents(items) {
  return items.map((item) => ({
    class_name: item?.class_name || item?.className || item?.class || "-",
    section: item?.section || item?.division || "-",
    student_count:
      item?.student_count || item?.studentCount || item?.count || 0,
  }));
}

function normalizePeople(items, roleFallback = "") {
  return items.map((item) => ({
    name: item?.name || item?.full_name || item?.fullName || "-",
    role: item?.role || item?.user_role || roleFallback || "-",
    email: item?.email || item?.mail || "-",
    phone: item?.phone || item?.mobile || item?.phone_number || "-",
  }));
}

async function fetchList({ token, path, preferredKeys, defaultErrorMessage }) {
  const response = await fetch(buildApiUrl(path), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const responseBody = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(responseBody?.message || defaultErrorMessage);
  }

  return parseList(responseBody, preferredKeys);
}

async function fetchListWithFallback({
  token,
  paths,
  preferredKeys,
  defaultErrorMessage,
}) {
  let lastError = null;

  for (const path of paths) {
    try {
      const list = await fetchList({
        token,
        path,
        preferredKeys,
        defaultErrorMessage,
      });
      return list;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error(defaultErrorMessage);
}

const sectionConfig = {
  classwiseStudents: {
    paths: (schoolCode) => [
      `/superadmin/schools/${schoolCode}/students/classwise`,
      `/superadmin/schools/${schoolCode}/students/class-wise`,
    ],
    preferredKeys: [
      "classes",
      "students",
      "classwiseStudents",
      "classWiseStudents",
    ],
    defaultErrorMessage: "Failed to load class-wise students.",
    normalize: normalizeClasswiseStudents,
  },
  teachers: {
    paths: (schoolCode) => [`/superadmin/schools/${schoolCode}/teachers`],
    preferredKeys: ["teachers", "users"],
    defaultErrorMessage: "Failed to load teachers.",
    normalize: (items) => normalizePeople(items, "TEACHER"),
  },
  parents: {
    paths: (schoolCode) => [`/superadmin/schools/${schoolCode}/parents`],
    preferredKeys: ["parents", "users"],
    defaultErrorMessage: "Failed to load parents.",
    normalize: (items) => normalizePeople(items, "PARENT"),
  },
  ownersItadmin: {
    paths: (schoolCode) => [`/superadmin/schools/${schoolCode}/owners-itadmin`],
    preferredKeys: [
      "ownersItadmin",
      "owners_itadmin",
      "owners",
      "admins",
      "users",
    ],
    defaultErrorMessage: "Failed to load owner and IT admin details.",
    normalize: (items) => normalizePeople(items, "OWNER/ITADMIN"),
  },
};

export const fetchSchoolInsightSection = createAsyncThunk(
  "schoolInsights/fetchSchoolInsightSection",
  async ({ schoolCode, section }, { getState, rejectWithValue }) => {
    const token = getState().auth.token;

    if (!token) {
      return rejectWithValue({ section, message: "Not authenticated." });
    }

    if (!schoolCode || !sectionConfig[section]) {
      return rejectWithValue({
        section,
        message: "Invalid school section request.",
      });
    }

    const encodedSchoolCode = encodeURIComponent(schoolCode);
    const config = sectionConfig[section];

    try {
      const list = await fetchListWithFallback({
        token,
        paths: config.paths(encodedSchoolCode),
        preferredKeys: config.preferredKeys,
        defaultErrorMessage: config.defaultErrorMessage,
      });

      return {
        section,
        schoolCode,
        data: config.normalize(list),
      };
    } catch (error) {
      return rejectWithValue({
        section,
        message: error.message || config.defaultErrorMessage,
      });
    }
  },
);

export const fetchSchoolInsights = createAsyncThunk(
  "schoolInsights/fetchSchoolInsights",
  async (schoolCode, { getState, rejectWithValue }) => {
    const token = getState().auth.token;

    if (!token) {
      return rejectWithValue("Not authenticated.");
    }

    if (!schoolCode) {
      return rejectWithValue("School code is required.");
    }

    try {
      const encodedSchoolCode = encodeURIComponent(schoolCode);

      const [
        classwiseStudentsResult,
        teachersResult,
        parentsResult,
        ownersItadminResult,
      ] = await Promise.allSettled([
        fetchListWithFallback({
          token,
          paths: sectionConfig.classwiseStudents.paths(encodedSchoolCode),
          preferredKeys: sectionConfig.classwiseStudents.preferredKeys,
          defaultErrorMessage:
            sectionConfig.classwiseStudents.defaultErrorMessage,
        }),
        fetchList({
          token,
          path: sectionConfig.teachers.paths(encodedSchoolCode)[0],
          preferredKeys: sectionConfig.teachers.preferredKeys,
          defaultErrorMessage: sectionConfig.teachers.defaultErrorMessage,
        }),
        fetchList({
          token,
          path: sectionConfig.parents.paths(encodedSchoolCode)[0],
          preferredKeys: sectionConfig.parents.preferredKeys,
          defaultErrorMessage: sectionConfig.parents.defaultErrorMessage,
        }),
        fetchList({
          token,
          path: sectionConfig.ownersItadmin.paths(encodedSchoolCode)[0],
          preferredKeys: sectionConfig.ownersItadmin.preferredKeys,
          defaultErrorMessage: sectionConfig.ownersItadmin.defaultErrorMessage,
        }),
      ]);

      const sectionErrors = {
        classwiseStudents:
          classwiseStudentsResult.status === "rejected"
            ? classwiseStudentsResult.reason?.message ||
              "Failed to load class-wise students."
            : "",
        teachers:
          teachersResult.status === "rejected"
            ? teachersResult.reason?.message || "Failed to load teachers."
            : "",
        parents:
          parentsResult.status === "rejected"
            ? parentsResult.reason?.message || "Failed to load parents."
            : "",
        ownersItadmin:
          ownersItadminResult.status === "rejected"
            ? ownersItadminResult.reason?.message ||
              "Failed to load owner and IT admin details."
            : "",
      };

      const classwiseStudents =
        classwiseStudentsResult.status === "fulfilled"
          ? classwiseStudentsResult.value
          : [];
      const teachers =
        teachersResult.status === "fulfilled" ? teachersResult.value : [];
      const parents =
        parentsResult.status === "fulfilled" ? parentsResult.value : [];
      const ownersItadmin =
        ownersItadminResult.status === "fulfilled"
          ? ownersItadminResult.value
          : [];

      const hasAnySuccess = [
        classwiseStudentsResult,
        teachersResult,
        parentsResult,
        ownersItadminResult,
      ].some((result) => result.status === "fulfilled");

      if (!hasAnySuccess) {
        return rejectWithValue("Failed to load school dashboard details.");
      }

      return {
        schoolCode,
        classwiseStudents: normalizeClasswiseStudents(classwiseStudents),
        teachers: normalizePeople(teachers, "TEACHER"),
        parents: normalizePeople(parents, "PARENT"),
        ownersItadmin: normalizePeople(ownersItadmin, "OWNER/ITADMIN"),
        sectionErrors,
      };
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to load school dashboard details.",
      );
    }
  },
);

const initialState = {
  schoolCode: "",
  classwiseStudents: [],
  teachers: [],
  parents: [],
  ownersItadmin: [],
  sectionLoading: {
    classwiseStudents: false,
    teachers: false,
    parents: false,
    ownersItadmin: false,
  },
  sectionErrors: {
    classwiseStudents: "",
    teachers: "",
    parents: "",
    ownersItadmin: "",
  },
  status: "idle",
  error: "",
};

const schoolInsightsSlice = createSlice({
  name: "schoolInsights",
  initialState,
  reducers: {
    clearSchoolInsights: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSchoolInsights.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(fetchSchoolInsights.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = "";
        state.schoolCode = action.payload.schoolCode;
        state.classwiseStudents = action.payload.classwiseStudents;
        state.teachers = action.payload.teachers;
        state.parents = action.payload.parents;
        state.ownersItadmin = action.payload.ownersItadmin;
        state.sectionErrors = action.payload.sectionErrors;
      })
      .addCase(fetchSchoolInsights.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload || "Failed to load school dashboard details.";
      })
      .addCase(fetchSchoolInsightSection.pending, (state, action) => {
        const section = action.meta.arg.section;

        if (state.sectionLoading[section] !== undefined) {
          state.sectionLoading[section] = true;
          state.sectionErrors[section] = "";
        }
      })
      .addCase(fetchSchoolInsightSection.fulfilled, (state, action) => {
        const { section, schoolCode, data } = action.payload;

        if (state[section] !== undefined) {
          state[section] = data;
          state.schoolCode = schoolCode;
          state.sectionLoading[section] = false;
          state.sectionErrors[section] = "";
        }
      })
      .addCase(fetchSchoolInsightSection.rejected, (state, action) => {
        const section = action.payload?.section || action.meta.arg.section;

        if (state.sectionLoading[section] !== undefined) {
          state.sectionLoading[section] = false;
          state.sectionErrors[section] =
            action.payload?.message || "Failed to refresh this section.";
        }
      })
      .addCase(logout, () => initialState);
  },
});

export const { clearSchoolInsights } = schoolInsightsSlice.actions;

export const selectSchoolInsights = (state) => state.schoolInsights;

export default schoolInsightsSlice.reducer;
