import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
const AUTH_STORAGE_KEY = "superadmin_auth";

function getStoredAuth() {
  if (typeof window === "undefined") {
    return { token: "", username: "" };
  }

  const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawValue) {
    return { token: "", username: "" };
  }

  try {
    const parsed = JSON.parse(rawValue);

    return {
      token: parsed?.token || "",
      username: parsed?.username || "",
    };
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return { token: "", username: "" };
  }
}

function setStoredAuth({ token, username }) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({ token, username }),
  );
}

function clearStoredAuth() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

function buildApiUrl(path) {
  if (!API_BASE_URL) {
    return path;
  }

  return `${API_BASE_URL.replace(/\/$/, "")}${path}`;
}

function parseToken(responseBody) {
  return (
    responseBody?.token ||
    responseBody?.accessToken ||
    responseBody?.data?.token ||
    ""
  );
}

function parseLoginName(responseBody, fallbackUsername) {
  return (
    responseBody?.user?.name ||
    responseBody?.user?.username ||
    responseBody?.data?.user?.name ||
    responseBody?.data?.user?.username ||
    fallbackUsername
  );
}

export const loginSuperadmin = createAsyncThunk(
  "auth/loginSuperadmin",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(buildApiUrl("/auth/superadmin/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          userName: username,
          email: username,
          password,
        }),
      });

      const responseBody = await response.json().catch(() => ({}));

      if (!response.ok) {
        return rejectWithValue(responseBody?.message || "Login failed.");
      }

      const token = parseToken(responseBody);

      if (!token) {
        return rejectWithValue("Login response did not include an auth token.");
      }

      return {
        token,
        username: parseLoginName(responseBody, username),
      };
    } catch {
      return rejectWithValue("Unable to connect to login API.");
    }
  },
);

const persistedAuth = getStoredAuth();

const initialState = {
  username: persistedAuth.username,
  token: persistedAuth.token,
  status: "idle",
  error: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: () => {
      clearStoredAuth();
      return {
        ...initialState,
        username: "",
        token: "",
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginSuperadmin.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(loginSuperadmin.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        state.username = action.payload.username;
        state.error = "";
        setStoredAuth({
          token: action.payload.token,
          username: action.payload.username,
        });
      })
      .addCase(loginSuperadmin.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Login failed.";
      });
  },
});

export const { logout } = authSlice.actions;

export const selectIsAuthenticated = (state) => Boolean(state.auth.token);
export const selectAuthUsername = (state) => state.auth.username;
export const selectAuthToken = (state) => state.auth.token;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
