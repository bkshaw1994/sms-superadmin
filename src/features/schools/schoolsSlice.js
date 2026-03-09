import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { logout } from "../auth/authSlice";
import { generateSchoolCodeFromName } from "../../utils/schoolHelpers";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function buildApiUrl(path) {
  if (!API_BASE_URL) {
    return path;
  }

  return `${API_BASE_URL.replace(/\/$/, "")}${path}`;
}

function parseSchools(responseBody) {
  if (Array.isArray(responseBody)) {
    return responseBody;
  }

  if (Array.isArray(responseBody?.schools)) {
    return responseBody.schools;
  }

  if (Array.isArray(responseBody?.data)) {
    return responseBody.data;
  }

  if (Array.isArray(responseBody?.data?.schools)) {
    return responseBody.data.schools;
  }

  return [];
}

export const fetchSchools = createAsyncThunk(
  "schools/fetchSchools",
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.token;

    if (!token) {
      return rejectWithValue("Not authenticated.");
    }

    try {
      const response = await fetch(buildApiUrl("/superadmin/schools"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseBody = await response.json().catch(() => ({}));

      if (!response.ok) {
        return rejectWithValue(
          responseBody?.message || "Failed to load schools.",
        );
      }

      return parseSchools(responseBody);
    } catch {
      return rejectWithValue("Unable to connect to schools API.");
    }
  },
);

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      resolve(typeof reader.result === "string" ? reader.result : "");
    };

    reader.onerror = () => reject(new Error("Failed to read logo image."));
    reader.readAsDataURL(file);
  });
}

export const createSchool = createAsyncThunk(
  "schools/createSchool",
  async (payload, { getState, rejectWithValue }) => {
    const token = getState().auth.token;

    if (!token) {
      return rejectWithValue("Not authenticated.");
    }

    const computedSchoolCode = (
      payload.schoolCode?.trim() ||
      generateSchoolCodeFromName(payload.schoolName || "")
    ).toUpperCase();

    if (!computedSchoolCode) {
      return rejectWithValue("School code could not be generated.");
    }

    try {
      const logoDataUrl = await readFileAsDataUrl(payload.logoFile);
      const requestBody = {
        schoolName: payload.schoolName,
        schoolCode: computedSchoolCode,
        address: payload.address,
        number: payload.number,
        website: payload.website,
        city: payload.city,
        state: payload.state,
        schoolEmail: payload.schoolEmail,
        schoolEmailId: payload.schoolEmail,
        schhoolEmail: payload.schoolEmail,
        schhoolEmailId: payload.schoolEmail,
        logoImage: logoDataUrl,
        status: "ACTIVE",
      };

      const response = await fetch(buildApiUrl("/superadmin/schools"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const responseBody = await response.json().catch(() => ({}));

      if (!response.ok) {
        return rejectWithValue(
          responseBody?.message || "Failed to create school.",
        );
      }

      return (
        responseBody?.school ||
        responseBody?.data?.school ||
        responseBody || {
          ...requestBody,
          status: "ACTIVE",
        }
      );
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create school.");
    }
  },
);

export const createOwnerOrDirector = createAsyncThunk(
  "schools/createOwnerOrDirector",
  async (payload, { getState, rejectWithValue }) => {
    const token = getState().auth.token;

    if (!token) {
      return rejectWithValue("Not authenticated.");
    }

    if (!payload.schoolCode) {
      return rejectWithValue("Please select a school.");
    }

    try {
      const requestBody = {
        schoolCode: payload.schoolCode,
        name: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        status: "ACTIVE",
      };

      const response = await fetch(buildApiUrl("/superadmin/schools/owner"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const responseBody = await response.json().catch(() => ({}));

      if (!response.ok) {
        return rejectWithValue(
          responseBody?.message || "Failed to save owner details.",
        );
      }

      return responseBody?.owner || responseBody?.data?.owner || responseBody;
    } catch {
      return rejectWithValue("Unable to connect to owner API.");
    }
  },
);

const initialState = {
  items: [],
  status: "idle",
  error: "",
  createStatus: "idle",
  createError: "",
  createOwnerStatus: "idle",
  createOwnerError: "",
};

const schoolsSlice = createSlice({
  name: "schools",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSchools.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(fetchSchools.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
        state.error = "";
      })
      .addCase(fetchSchools.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to load schools.";
      })
      .addCase(createSchool.pending, (state) => {
        state.createStatus = "loading";
        state.createError = "";
      })
      .addCase(createSchool.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.createError = "";
        state.items = [action.payload, ...state.items];
      })
      .addCase(createSchool.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError = action.payload || "Failed to create school.";
      })
      .addCase(createOwnerOrDirector.pending, (state) => {
        state.createOwnerStatus = "loading";
        state.createOwnerError = "";
      })
      .addCase(createOwnerOrDirector.fulfilled, (state) => {
        state.createOwnerStatus = "succeeded";
        state.createOwnerError = "";
      })
      .addCase(createOwnerOrDirector.rejected, (state, action) => {
        state.createOwnerStatus = "failed";
        state.createOwnerError =
          action.payload || "Failed to save owner details.";
      })
      .addCase(logout, () => initialState);
  },
});

export const selectSchools = (state) => state.schools.items;
export const selectSchoolsStatus = (state) => state.schools.status;
export const selectSchoolsError = (state) => state.schools.error;
export const selectCreateSchoolStatus = (state) => state.schools.createStatus;
export const selectCreateSchoolError = (state) => state.schools.createError;
export const selectCreateOwnerStatus = (state) =>
  state.schools.createOwnerStatus;
export const selectCreateOwnerError = (state) => state.schools.createOwnerError;

export default schoolsSlice.reducer;
