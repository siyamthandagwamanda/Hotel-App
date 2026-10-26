import {createSlice, createAsyncThunk,} from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { buildSearchQuery } from '../utils/searchQueryUtils';


export interface HotelImage{
    url: string;
    alt: string;
}

export interface HotelCardData{
    id: number;
    name: string;
    city: string;
    province: string;
    starRating: number;
    ratingAvg: number;
    reviewCount: number;
    setting: string;
    fromPriceCents: number;
    images: HotelImage[];
}

export interface Shelf{
    id: string;
    title: string;
    hotels: HotelCardData[];
}

export interface Amenity{
    id: number;
    name: string;
}

export interface SearchArgs{
    city: string;
    checkIn: string | null;
    checkOut: string | null;
    adults: number;
    children: number;
    rooms: number;
    minPrice: number | null;
    maxPrice: number | null;
    stars: number | null;
    amenityIds: number[];
    propertyType: string | null;
    sort: string;
    cursor: string | null;
}

export interface ShelvesResponse{
    shelves: Shelf[];
}

interface HotelState{
    shelves: Shelf[];
    amenities: Amenity[];
    searchResults: HotelCardData[]
    nextCursor: string | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: HotelState = {
    shelves: [],
    amenities: [],
    searchResults: [],
    nextCursor: null,
    isLoading: false,
    error: null,
};

//Asynchronous Thunk for fetching localized dashboard shelves

const BASE_URL = import.meta.env.VITE_API_URL;

export const fetchShelvesByCity = createAsyncThunk(
    'hotel/fetchShelves',

    async (city: string) => {
        const response = await fetch(`${BASE_URL}/hotels/shelves?city=${encodeURIComponent(city)}`);

        if (!response.ok) throw new Error('Could not pull hotel collection shelves');
        const data = await response.json();
        return data.shelves as Shelf[];
    }
);

export const fetchAllAmenities = createAsyncThunk(
    'hotel/fectchAmenities',

    async () => {
        const response = await fetch(`${BASE_URL}/hotels/amenities`);
        if (!response.ok) throw new Error('Failed to fetch  features and amenities list');
        const data = await response.json();
        return data.amenities as Amenity[];
    }
);

export const searchHotelInventory = createAsyncThunk(
    'hotel/searchInventory',

    async (args: SearchArgs) => {
        const response = await fetch(`${BASE_URL}/hotels?${buildSearchQuery(args)}`);
        if (!response.ok) throw new Error(`Failed to fetch hotel inventory based on search criteria`);
        return await response.json() as { hotels: HotelCardData[]; nextCursor: string | null };
    }
);

const hotelSlice = createSlice({
    name: 'hotel',
    initialState,
    reducers: {
        clearSearchResults(state){
            state.searchResults = [];
            state.nextCursor = null;
            state.error = null;
        }
    },

     
  extraReducers: (builder) => {
    builder

      .addCase(fetchShelvesByCity.fulfilled, (state, action: PayloadAction<Shelf[]>) => {
        state.isLoading = false;
        state.shelves = action.payload;
      })
      .addCase(fetchAllAmenities.fulfilled, (state, action: PayloadAction<Amenity[]>) => {
        state.isLoading = false;
        state.amenities = action.payload;
      })
      .addCase(searchHotelInventory.fulfilled, (state, action: PayloadAction<{ hotels: HotelCardData[]; nextCursor: string | null }>) => {
        state.isLoading = false;
        state.searchResults = action.payload.hotels;
        state.nextCursor = action.payload.nextCursor;
      })
      
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action: any) => {
          state.isLoading = false;
          state.error = action.error?.message || 'An unexpected operational breakdown occurred';
        }
      );
  },

});

export const { clearSearchResults } = hotelSlice.actions;
export default hotelSlice.reducer;