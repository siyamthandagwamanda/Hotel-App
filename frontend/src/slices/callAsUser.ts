import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { ApiError, apiRequest } from '../utils/apiRequest';
import { signOut } from './authSlice';

// The parts of a thunk that we need: reading the token and dispatching
interface ThunkTools {
  getState: () => unknown;
  dispatch: ThunkDispatch<unknown, unknown, UnknownAction>;
}

// Calls the API as the signed-in visitor. A 401 means the token has expired, so sign them out.
export async function callAsUser<T>(
  tools: ThunkTools,
  path: string,
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' = 'GET',
  body?: object,
): Promise<T> {
  const token = (tools.getState() as RootState).auth.token;
  try {
    return await apiRequest<T>(path, token, method, body);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      tools.dispatch(signOut());
    }
    throw error;
  }
}