import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface User{
    id: number;
    email: string;
    name: string;
    phone: string | null;
    avatar: string | null;
<<<<<<< HEAD
    role: 'visitor' | 'admin';
=======
    role: 'guest' | 'admin';
>>>>>>> feat/redux-store
}

interface AuthState{ user: User | null; 
    status: 'idle' | 'loading' | 'authenticated' | 'error';
};

<<<<<<< HEAD
const initialState: AuthState = { user: null, status: 'idle', };
=======
const initialState: AuthState = { user: null,status: 'idle', };
>>>>>>> feat/redux-store

const authSlice = createSlice({

    name: 'auth', initialState,
    reducers: {
        loginStarted(state){
            state.status = 'loading';
        },

        authSucceeded(state, action: PayloadAction<User>){
            state.user = action.payload;
            state.status = 'authenticated';
        },

        loginFailed(state){
            state.user = null;
            state.status = 'error';
        },

        logout(state){
            state.user = null;
            state.status = 'idle'
        }
    },
});

export const {loginStarted, authSucceeded, loginFailed, logout} = authSlice.actions;
export default authSlice.reducer;