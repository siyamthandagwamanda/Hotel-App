import { configureStore } from "@reduxjs/toolkit";
import authReducer from './slices/authSlice';
import searchReducer from './slices/searchSlice';
import journeyReducer from './slices/journeySlice'


export const store = configureStore({
    reducer: {
        auth: authReducer,
        search: searchReducer,
        journey: journeyReducer,
       
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;