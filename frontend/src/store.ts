import { configureStore } from "@reduxjs/toolkit";
import authReducer from './slices/authSlice';
import searchReducer from './slices/searchSlice';
import journeyReducer from './slices/journeySlice';
import hotelReducer from './slices/hotelSlices';
import  favouriteReducer from './slices/favouriteSlice';
import hotelDetailReducer from './slices/hotelDetailSlices';
<<<<<<< HEAD
=======
import bookingReducer from './slices/bookingSlice';
>>>>>>> feat/redux-store


export const store = configureStore({
    reducer: {
        auth: authReducer,
        search: searchReducer,
        journey: journeyReducer,
        hotels: hotelReducer,
        favourites: favouriteReducer,
        hotelDetail: hotelDetailReducer,
<<<<<<< HEAD
=======
        booking: bookingReducer,
>>>>>>> feat/redux-store
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;