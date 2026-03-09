import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { logout } from "../auth/authSlice";

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

const initialState = {
  items: [],
  status: "idle",
  error: "",
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
      .addCase(logout, () => initialState);
  },
});

export const selectSchools = (state) => state.schools.items;
export const selectSchoolsStatus = (state) => state.schools.status;
export const selectSchoolsError = (state) => state.schools.error;

export default schoolsSlice.reducer;
