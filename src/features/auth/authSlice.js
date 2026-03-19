import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
const AUTH_STORAGE_KEY = "superadmin_auth";
const EMPTY_AUTH = {
  token: "",
  username: "",
  displayName: "",
  email: "",
  userId: "",
  role: "",
  phone: "",
  valid: false,
};
const EMPTY_AUTH_STATE = {
  ...EMPTY_AUTH,
  status: "idle",
  error: "",
};

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function firstNonEmpty(values, fallback = "") {
  for (const value of values) {
    const normalized = normalizeText(value);
    if (normalized) {
      return normalized;
    }
  }

  return normalizeText(fallback);
}

function normalizeAuthData(data = {}, fallbackUsername = "") {
  return {
    token: firstNonEmpty([data?.token, data?.accessToken, data?.data?.token]),
    username: firstNonEmpty([data?.username, data?.email], fallbackUsername),
    displayName: firstNonEmpty([data?.displayName, data?.name]),
    email: firstNonEmpty([data?.email]),
    userId: firstNonEmpty([data?.userId]),
    role: firstNonEmpty([data?.role]),
    phone: firstNonEmpty([data?.phone]),
    valid: Boolean(data?.valid),
  };
}

function getStoredAuth() {
  if (typeof window === "undefined") {
    return EMPTY_AUTH;
  }

  const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawValue) {
    return EMPTY_AUTH;
  }

  try {
    const parsed = JSON.parse(rawValue);

    return normalizeAuthData(parsed);
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return EMPTY_AUTH;
  }
}

function setStoredAuth({
  token,
  username,
  displayName,
  email,
  userId,
  role,
  phone,
  valid,
}) {
  if (typeof window === "undefined") {
    return;
  }

  const resolvedDisplayName = normalizeText(displayName);
  const resolvedUsername = normalizeText(username);
  const resolvedToken = normalizeText(token);
  const resolvedEmail = normalizeText(email);
  const resolvedUserId = normalizeText(userId);
  const resolvedRole = normalizeText(role);
  const resolvedPhone = normalizeText(phone);

  window.localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      token: resolvedToken,
      username: resolvedUsername,
      displayName: resolvedDisplayName,
      email: resolvedEmail,
      userId: resolvedUserId,
      role: resolvedRole,
      phone: resolvedPhone,
      valid: Boolean(valid),
    }),
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

function parseAuthPayload(responseBody, fallbackUsername) {
  return normalizeAuthData(responseBody, fallbackUsername);
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

      const authPayload = parseAuthPayload(responseBody, username);

      if (responseBody?.valid === false) {
        return rejectWithValue(responseBody?.message || "Invalid credentials.");
      }

      const token = authPayload.token;

      if (!token) {
        return rejectWithValue("Login response did not include an auth token.");
      }

      return authPayload;
    } catch {
      return rejectWithValue("Unable to connect to login API.");
    }
  },
);

const persistedAuth = getStoredAuth();

const initialState = {
  ...EMPTY_AUTH_STATE,
  ...persistedAuth,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: () => {
      clearStoredAuth();
      return { ...EMPTY_AUTH_STATE };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginSuperadmin.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(loginSuperadmin.fulfilled, (state, action) => {
        const normalizedPayload = normalizeAuthData(action.payload);
        Object.assign(state, normalizedPayload, {
          status: "succeeded",
          error: "",
        });
        setStoredAuth(normalizedPayload);
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
export const selectAuthDisplayName = (state) => state.auth.displayName;
export const selectAuthEmail = (state) => state.auth.email;
export const selectAuthUserId = (state) => state.auth.userId;
export const selectAuthRole = (state) => state.auth.role;
export const selectAuthPhone = (state) => state.auth.phone;
export const selectAuthValid = (state) => state.auth.valid;
export const selectAuthToken = (state) => state.auth.token;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
