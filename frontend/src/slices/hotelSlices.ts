import {createSlice, createAsyncThunk,} from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface HotelImage{
    url: string;
    alt: string;
}

export interface HotelCardData{
    id: number;
    name: string;
    city: string;
    province: string;
    starsRating: number;
    ratingAvg: number;
    reviewCount: number;
    setting: string;
    fromPriceCents: number;
    images: HotelImage[];
}

export interface shelf{
    id: string;
    title: string;
    hotels: HotelCardData[];
}

export interface ShelvesResponse{
    shelves: shelf[];
}

interface HotelState{
    shelves: shelf[];
    isLoading: boolean;
    error: string | null;
}

const initialState: HotelState = {
    shelves: [],
    isLoading: false,
    error: null,
};

//Asynchronous Thunk for fetching localized dashboard shelves

export const fetchShelvesByCity = createAsyncThunk<
    ShelvesResponse,
    string,
    {rejectValue: string}
>(
    'hotels/fetchShelvesByCity',
    async (city, { rejectWithValue }) => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL;
            const response = await fetch(`${baseUrl}/hotels/shelves?city=${encodeURIComponent(city)}`);

            if (!response.ok){
                throw new Error(`Server responded with status: ${response.status}`);
            }

            return (await response.json()) as ShelvesResponse;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to communicate with server');
        }
    }
);

const hotelSlice = createSlice({
    name: 'hotels',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchShelvesByCity.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchShelvesByCity.fulfilled, (state, action: PayloadAction<ShelvesResponse>) => {
                state.shelves = action.payload.shelves;
                state.isLoading = false;
            })
            .addCase(fetchShelvesByCity.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload ?? 'Something went wrong';
            });
   },
});


export default hotelSlice.reducer;