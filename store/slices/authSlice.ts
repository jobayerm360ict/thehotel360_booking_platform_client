import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { User, UserRole, RawApiUser, PayoutMethod } from "@/types";
import { imageHostLink } from "@/constants/request";

export const emptyUser: User = {
  id: "",
  name: "",
  firstName: "",
  lastName: "",
  email: "",
  avatar: "",
  role: "guest",
  phone: "",
  dialCode: "",
  e164Phone: "",
  status: "active",
  gender: "",
  dateOfBirth: "",
  location: "",
  address: "",
  bio: "",
  joinedDate: "",
  hostedListingIds: [],
  languages: [],
  superhostStatus: false,
  identityVerified: false,
  roleIsActive: true,
};

/**
 * Safely converts any value to a trimmed string, treating null/undefined/blank as empty string
 */
const toCleanStr = (val: unknown): string => {
  if (val === null || val === undefined) return "";
  const s = String(val).trim();
  return s === "null" || s === "undefined" ? "" : s;
};

/**
 * Automatically resolves avatar image to an absolute URL if stored as a relative path
 */
const resolveAvatar = (rawAvatar: unknown): string => {
  const str = toCleanStr(rawAvatar);
  if (!str) return "";
  if (
    str.startsWith("http://") ||
    str.startsWith("https://") ||
    str.startsWith("data:") ||
    str.startsWith("blob:") ||
    str.startsWith("/")
  ) {
    return str;
  }
  return `${imageHostLink}/${str}`;
};

/**
 * Highly optimized user normalization pipeline.
 * Extracts, sanitizes, and standardizes user payloads from backend responses,
 * JWT tokens, and localStorage.
 */
export const normalizeUser = (
  data: RawApiUser | Partial<User> | Record<string, unknown> | null | undefined
): User => {
  if (!data || typeof data !== "object") return emptyUser;

  // Unwrap payload if nested inside { user }, { data }, or { profile }
  const rawRecord = data as Record<string, unknown>;
  const raw: Record<string, unknown> =
    rawRecord.user && typeof rawRecord.user === "object"
      ? (rawRecord.user as Record<string, unknown>)
      : rawRecord.data &&
        typeof rawRecord.data === "object" &&
        !("data" in rawRecord.data)
      ? (rawRecord.data as Record<string, unknown>)
      : rawRecord;

  if (!raw || typeof raw !== "object") return emptyUser;

  // 1. Identity & Credentials
  const id = toCleanStr(raw.id || raw._id || raw.user_id || raw.userId);

  let firstName = toCleanStr(raw.firstName || raw.first_name || raw.given_name);
  let lastName = toCleanStr(raw.lastName || raw.last_name || raw.family_name);

  // Strip legacy mock/placeholder tokens
  if (firstName.toLowerCase() === "guest") firstName = "";
  if (lastName.toLowerCase() === "user") lastName = "";

  let name = toCleanStr(raw.name || raw.fullName || raw.full_name);
  if (name.toLowerCase() === "guest user" || name.toLowerCase() === "guest") {
    name = "";
  }

  const email = toCleanStr(raw.email);

  // 2. Phone resolution
  const phone = toCleanStr(
    raw.phone || raw.phone_number || raw.mobile || raw.e164_phone || raw.e164Phone
  );
  const dialCode = toCleanStr(raw.dial_code || raw.dialCode);
  const e164Phone = toCleanStr(
    raw.e164_phone ||
    raw.e164Phone ||
    (dialCode && phone ? `+${dialCode}${phone.replace(/^0/, "")}` : phone)
  );

  // 3. Name resolution (synthesize missing fields)
  if (!name) {
    if (firstName && lastName) {
      name = `${firstName} ${lastName}`;
    } else if (firstName || lastName) {
      name = firstName || lastName;
    } else if (email) {
      name = email.split("@")[0];
    } else if (phone) {
      name = phone;
    }
  }

  if (!firstName && name) {
    const parts = name.split(" ").filter(Boolean);
    firstName = parts[0] || name;
    if (!lastName && parts.length > 1) {
      lastName = parts.slice(1).join(" ");
    }
  }

  // 4. Avatar (auto-resolved to full CDN/S3 URL if relative path)
  const avatar = resolveAvatar(
    raw.avatar ||
    raw.photo ||
    raw.image ||
    raw.profile_pic ||
    raw.picture ||
    raw.profile_image
  );

  // 5. Role & Status
  const rawRole = toCleanStr(raw.role || raw.user_role || raw.type || "guest").toLowerCase();
  const role: UserRole = rawRole.includes("host")
    ? "host"
    : rawRole.includes("admin")
    ? "admin"
    : "guest";

  const rawRoleId = raw.role_id ?? raw.roleId;
  const roleId =
    typeof rawRoleId === "number"
      ? rawRoleId
      : rawRoleId && !isNaN(Number(rawRoleId))
      ? Number(rawRoleId)
      : undefined;

  const roleIsActive = Boolean(raw.role_is_active ?? raw.roleIsActive ?? true);
  const status = toCleanStr(raw.status) || "active";

  // 6. Profile attributes
  const location = toCleanStr(raw.location || raw.address || raw.city);
  const address = toCleanStr(raw.address || raw.location);
  const gender = toCleanStr(raw.gender);
  const dateOfBirth = toCleanStr(raw.dateOfBirth || raw.date_of_birth || raw.dob);
  const bio = toCleanStr(raw.bio || raw.about);

  const joinedDate = toCleanStr(
    raw.joinedDate ||
    raw.joined_date ||
    raw.createdAt ||
    raw.created_at ||
    raw.last_logged_in
  );

  // 7. Array attributes (ensure strict arrays without nulls)
  const hostedListingIds: string[] = Array.isArray(raw.hostedListingIds)
    ? (raw.hostedListingIds as unknown[]).map(String).filter(Boolean)
    : Array.isArray(raw.listings)
    ? (raw.listings as unknown[])
        .map((l: unknown) => {
          if (typeof l === "string") return l;
          if (l && typeof l === "object") {
            const item = l as { id?: string | number; _id?: string | number };
            return toCleanStr(item.id || item._id);
          }
          return "";
        })
        .filter(Boolean)
    : [];

  const languages: string[] = Array.isArray(raw.languages)
    ? raw.languages.map(String).filter(Boolean)
    : [];

  // 8. Badges & Verifications
  const superhostStatus = Boolean(raw.superhostStatus ?? raw.is_superhost ?? false);
  const identityVerified = Boolean(raw.identityVerified ?? raw.is_verified ?? false);

  return {
    id,
    name,
    firstName,
    lastName,
    email,
    phone,
    dialCode,
    e164Phone,
    avatar,
    role,
    status,
    roleId,
    roleIsActive,
    gender,
    dateOfBirth,
    location,
    address,
    bio,
    joinedDate,
    hostedListingIds,
    languages,
    superhostStatus,
    responseRate: toCleanStr(raw.responseRate),
    responseTime: toCleanStr(raw.responseTime),
    identityVerified,
    payoutMethod:
      raw.payoutMethod &&
      typeof raw.payoutMethod === "object" &&
      "type" in raw.payoutMethod
        ? (raw.payoutMethod as PayoutMethod)
        : undefined,
    taxId: toCleanStr(raw.taxId),
    welcomeMessage: toCleanStr(raw.welcomeMessage),
  };
};

/**
 * Async Thunk to fetch current user profile directly from API
 */
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const { authService } = await import("@/services/authService");
      const res = await authService.getMe();
      return res;
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to fetch user from API";
      return rejectWithValue(message);
    }
  }
);

/**
 * Async Thunk to toggle user role between guest and host via backend API
 */
export const toggleUserRole = createAsyncThunk(
  "auth/toggleUserRole",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const { authService } = await import("@/services/authService");
      const res = await authService.toggleRole();
      if (res?.data) {
        dispatch(setUser(res.data));
      }
      return res;
    } catch (err: unknown) {
      dispatch(switchRole());
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to toggle role via API";
      return rejectWithValue(message);
    }
  }
);

interface AuthState {
  user: User;
  isAuthenticated: boolean;
  currentRole: UserRole;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: emptyUser,
  isAuthenticated: false,
  currentRole: "guest",
  isLoading: false,
  error: null,
};

const saveAuthStateToStorage = (user: User, isAuthenticated: boolean) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("isAuthenticated", String(isAuthenticated));
    } catch (e) {
      console.error("Failed to save auth state to localStorage", e);
    }
  }
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    initializeAuth: (state) => {
      if (typeof window !== "undefined") {
        try {
          const savedUser = localStorage.getItem("user");
          const savedIsAuth = localStorage.getItem("isAuthenticated");
          const token =
            localStorage.getItem("token") || sessionStorage.getItem("token");

          if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            state.user = normalizeUser(parsedUser);
            state.isAuthenticated = savedIsAuth === "true" || !!token;
            state.currentRole = state.user.role || "guest";
            // Re-save normalized user to clear any legacy demo artifacts
            saveAuthStateToStorage(state.user, state.isAuthenticated);
          } else if (token) {
            state.isAuthenticated = true;
          }
        } catch (e) {
          console.error("Failed to load auth state from localStorage", e);
        }
      }
    },
    setUser: (
      state,
      action: PayloadAction<RawApiUser | User | Record<string, unknown> | null | undefined>
    ) => {
      state.user = normalizeUser(action.payload);
      state.isAuthenticated = true;
      state.currentRole = state.user.role || state.currentRole || "guest";
      saveAuthStateToStorage(state.user, true);
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      const updatedUser = {
        ...state.user,
        ...action.payload,
        firstName: action.payload.firstName ?? state.user.firstName,
        lastName: action.payload.lastName ?? state.user.lastName,
        name:
          action.payload.firstName || action.payload.lastName
            ? `${action.payload.firstName ?? state.user.firstName ?? ""} ${
                action.payload.lastName ?? state.user.lastName ?? ""
              }`.trim()
            : (action.payload.name ?? state.user.name),
      };
      state.user = normalizeUser(updatedUser);
      saveAuthStateToStorage(state.user, state.isAuthenticated);
    },
    switchRole: (state, action: PayloadAction<UserRole | undefined>) => {
      const targetRole =
        action.payload || (state.currentRole === "guest" ? "host" : "guest");
      state.currentRole = targetRole;
      state.user = {
        ...state.user,
        role: targetRole,
      };
      saveAuthStateToStorage(state.user, state.isAuthenticated);
    },
    login: (
      state,
      action: PayloadAction<{
        name?: string;
        email?: string;
        phone?: string;
        role?: UserRole;
        user?: RawApiUser | User | Record<string, unknown>;
      }>
    ) => {
      if (action.payload.user) {
        state.user = normalizeUser(action.payload.user);
        state.currentRole = state.user.role || action.payload.role || "guest";
      } else {
        const emailVal = action.payload.email || state.user.email;
        const phoneVal = action.payload.phone || state.user.phone;
        const roleVal = action.payload.role || state.currentRole || "guest";
        const nameVal =
          action.payload.name ||
          (emailVal ? emailVal.split("@")[0] : state.user.name || "");

        state.user = normalizeUser({
          id: state.user.id || "",
          name: nameVal,
          email: emailVal,
          phone: phoneVal,
          role: roleVal,
          avatar: state.user.avatar,
          location: state.user.location,
          bio: state.user.bio,
          dateOfBirth: state.user.dateOfBirth,
        });
        state.currentRole = roleVal;
      }
      state.isAuthenticated = true;
      saveAuthStateToStorage(state.user, true);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.currentRole = "guest";
      state.user = emptyUser;
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("refreshToken");
      }
    },
    addHostedListingId: (state, action: PayloadAction<string>) => {
      if (!state.user.hostedListingIds.includes(action.payload)) {
        state.user.hostedListingIds.push(action.payload);
      }
      state.user.role = "host";
      state.currentRole = "host";
      saveAuthStateToStorage(state.user, true);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = normalizeUser(action.payload);
          state.isAuthenticated = true;
          state.currentRole = state.user.role || state.currentRole || "guest";
          saveAuthStateToStorage(state.user, true);
        }
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Failed to fetch user";
      })
      .addCase(toggleUserRole.fulfilled, (state, action) => {
        if (action.payload?.data) {
          state.user = normalizeUser(action.payload.data);
          state.currentRole = state.user.role || (state.currentRole === "guest" ? "host" : "guest");
          saveAuthStateToStorage(state.user, state.isAuthenticated);
        }
      });
  },
});

export const {
  initializeAuth,
  setUser,
  updateProfile,
  switchRole,
  login,
  logout,
  addHostedListingId,
} = authSlice.actions;

export default authSlice.reducer;
