import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { HotelCardData } from './hotelSlices';
import { signOut } from './authSlice';
import { callAsUser } from './callAsUser';

interface FavouritesState {
  hotelIds: number[];
  hotels: HotelCardData[];
}

const initialState: FavouritesState = {
  hotelIds: [],
  hotels: [],
};

// Which hotels the signed-in guest has saved (used for the hearts)
export const loadFavouriteIds = createAsyncThunk('favourites/loadIds', async (_arg: void, tools) => {
  const data = await callAsUser<{ hotelIds: number[] }>(tools, '/favourites/ids');
  return data.hotelIds;
});

// The saved hotels as cards (used on the profile page)
export const loadFavouriteHotels = createAsyncThunk('favourites/loadHotels', async (_arg: void, tools) => {
  const data = await callAsUser<{ hotels: HotelCardData[] }>(tools, '/favourites');
  return data.hotels;
});

// Saves or un-saves a hotel. The heart changes at once; if the server says no, it changes back.
export const saveFavourite = createAsyncThunk('favourites/save', async (args: { hotelId: number; save: boolean }, tools) => {
  await callAsUser<unknown>(tools, `/favourites/${args.hotelId}`, args.save ? 'PUT' : 'DELETE');
});

function addId(state: FavouritesState, hotelId: number): void {
  if (!state.hotelIds.includes(hotelId)) {
    state.hotelIds.push(hotelId);
  }
}

function removeId(state: FavouritesState, hotelId: number): void {
  state.hotelIds = state.hotelIds.filter((id) => id !== hotelId);
  state.hotels = state.hotels.filter((hotel) => hotel.id !== hotelId);
}

const favouritesSlice = createSlice({
  name: 'favourites',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadFavouriteIds.fulfilled, (state, action) => {
        state.hotelIds = action.payload;
      })
      .addCase(loadFavouriteHotels.fulfilled, (state, action) => {
        state.hotels = action.payload;
      })
      .addCase(saveFavourite.pending, (state, action) => {
        const { hotelId, save } = action.meta.arg;
        if (save) addId(state, hotelId);
        else removeId(state, hotelId);
      })
      .addCase(saveFavourite.rejected, (state, action) => {
        const { hotelId, save } = action.meta.arg;
        if (save) removeId(state, hotelId);
        else addId(state, hotelId);
      })
      .addCase(signOut.fulfilled, () => initialState);
  },
});

export default favouritesSlice.reducer;