import { configureStore } from "@reduxjs/toolkit";
import authReducer from './slices/authSlice';
import searchReducer from './slices/searchSlice';
import journeyReducer from './slices/journeySlice'
import { hotelApi } from "./hotel/hotelApi";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        search: searchReducer,
        journey: journeyReducer,

        //unlocks RTK Query's built-in support
        [hotelApi.reducerPath]: hotelApi.reducer,
    },
    
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(hotelApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;