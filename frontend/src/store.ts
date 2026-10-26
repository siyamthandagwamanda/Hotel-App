import { configureStore } from "@reduxjs/toolkit";
import authReducer from './slices/authSlice';
import searchReducer from './slices/searchSlice';
import journeyReducer from './slices/journeySlice'
import hotelReducer from './slices/hotelSlices'
import favouriteReducer from './slices/favouriteSlice'


export const store = configureStore({
    reducer: {
        auth: authReducer,
        search: searchReducer,
        journey: journeyReducer,
        hotels: hotelReducer,
        favourites: favouriteReducer
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;