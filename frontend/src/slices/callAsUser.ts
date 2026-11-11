import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { ApiError, apiRequest } from '../utils/apiRequest';
import { signOut } from './authSlice';

interface ThunkTools {
  getState: () => unknown;
  dispatch: ThunkDispatch<unknown, unknown, UnknownAction>;
}


export async function callAsUser<T>(
  tools: ThunkTools,
  path: string,
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' = 'GET',
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