import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface JourneyState {
  landingScreen: boolean;
  currentPage: number;
  rowScrollPositions: Record<string, number>;
}

const initialState: JourneyState = {
  landingScreen: false, 
  currentPage: 0,
  rowScrollPositions: {},
};

const journeySlice = createSlice({
  name: 'userJourney',
  initialState,
  reducers: {
   
    setLandingScreen(state, action: PayloadAction<boolean>) {
      state.landingScreen = action.payload;
    },
    setCurrentPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },
    setRowScrollPosition(state, action: PayloadAction<{ rowId: string; position: number }>) {
      state.rowScrollPositions[action.payload.rowId] = action.payload.position;
    },
  },
});


export const { setLandingScreen, setCurrentPage, setRowScrollPosition } = journeySlice.actions;
export default journeySlice.reducer;
