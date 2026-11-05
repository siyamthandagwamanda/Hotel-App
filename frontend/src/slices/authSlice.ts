import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export interface User {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  role: 'guest' | 'admin';
}

export interface RegisterArgs {
  name: string;
  email: string;
  password: string;
  phone: string;
  consent: boolean;
}

export interface SignInArgs {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface AuthState {
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'authenticated' | 'error';
  error: string | null;
}

const BASE_URL = import.meta.env.VITE_API_URL;

const SESSION_KEY = 'auth_session';

// Reads the sign-in saved by an earlier visit, so a refresh keeps the visitor signed in
function loadSavedSession(): AuthResponse | null {
  try {
    const saved = window.localStorage.getItem(SESSION_KEY);
    return saved === null ? null : (JSON.parse(saved) as AuthResponse);
  } catch {
    return null;
  }
}

const savedSession = loadSavedSession();

const initialState: AuthState = {
  user: savedSession === null ? null : savedSession.user,
  token: savedSession === null ? null : savedSession.token,
  status: savedSession === null ? 'idle' : 'authenticated',
  error: null,
};

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data.error.message as string;
  } catch {
    return 'Something went wrong. Please try again.';
  }
}

async function sendAuthRequest(path: string, body: object): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
  return (await response.json()) as AuthResponse;
}

export const registerAccount = createAsyncThunk('auth/register', async (args: RegisterArgs) => {
  const result = await sendAuthRequest('/auth/register', args);
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(result));
  return result;
});

export const signIn = createAsyncThunk('auth/signIn', async (args: SignInArgs) => {
  const result = await sendAuthRequest('/auth/login', args);
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(result));
  return result;
});

export const signOut = createAsyncThunk('auth/signOut', async () => {
  window.localStorage.removeItem(SESSION_KEY);
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
      if (state.status === 'error') {
        state.status = 'idle';
      }
    },
  },
// Register and sign in share the same lifecycle
  extraReducers: (builder) => {
    builder
     
      .addCase(registerAccount.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerAccount.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.status = 'authenticated';
      })
      .addCase(registerAccount.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message ?? 'Could not create your account.';
      })
      .addCase(signIn.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.status = 'authenticated';
      })
      .addCase(signIn.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message ?? 'Could not sign you in.';
      })
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.status = 'idle';
        state.error = null;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;