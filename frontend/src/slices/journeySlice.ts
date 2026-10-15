import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface JourneyState{
    landingScreen: boolean;
    currentPage: number;
    rowScrollPositions: Record<string, number>;
}

// Automatically loads from localStorage on app boot
const initialState: JourneyState = {
    landingScreen: true,
    currentPage: 0,
    rowScrollPositions: {},
};

const journeySlice = createSlice({
    name: 'userJourney', initialState,
    reducers: {
// Automatically persists to localStorage on state change        
        markLandingSeen(state){
            state.landingScreen = true;
            
        },
        
        setCurrentPage(state, action: PayloadAction<number>){
            state.currentPage = action.payload;
        },

        setRowScrollPosition(state, action: PayloadAction<{rowId: string; position: number}>){
            state.rowScrollPositions[action.payload.rowId] = action.payload.position;
        },
    },
});

export const {markLandingSeen, setCurrentPage, setRowScrollPosition} = journeySlice.actions;
export default journeySlice.reducer;
