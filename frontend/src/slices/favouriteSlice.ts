import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface FavouritesState {
  hotelIds: number[];
}

const initialState: FavouritesState = {
  hotelIds: [],
};

export const favouritesSlice = createSlice({
  name: 'favourites',
  initialState,
  reducers: {
    // Pure toggle reducer. Appends the ID if missing, or filters it out if already bookmarked
    toggleFavourite(state, action: PayloadAction<number>) {
      const id = action.payload;
      const index = state.hotelIds.indexOf(id);
      
      if (index === -1) {
        state.hotelIds.push(id);
      } else {
        state.hotelIds.splice(index, 1);
      }
    },
    clearAllFavourites(state) {
      state.hotelIds = [];
    }
  }
});

export const { toggleFavourite, clearAllFavourites } = favouritesSlice.actions;
export default favouritesSlice.reducer;
