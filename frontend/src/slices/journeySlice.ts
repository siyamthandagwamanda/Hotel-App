import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

<<<<<<< HEAD
interface DeckState{
=======
interface JourneyState{
>>>>>>> feat/redux-store
    landingScreen: boolean;
    currentPage: number;
    rowScrollPositions: Record<string, number>;
}

<<<<<<< HEAD
const initialState: DeckState = {
=======
const initialState: JourneyState = {
>>>>>>> feat/redux-store
    landingScreen: false,
    currentPage: 0,
    rowScrollPositions: {},
};

<<<<<<< HEAD
const deckSlice = createSlice({
    name: 'deck', initialState,
=======
const journeySlice = createSlice({
    name: 'userJourney', initialState,
>>>>>>> feat/redux-store
    reducers: {
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

<<<<<<< HEAD
export const {markLandingSeen, setCurrentPage, setRowScrollPosition} = deckSlice.actions;
export default deckSlice.reducer;
=======
export const {markLandingSeen, setCurrentPage, setRowScrollPosition} = journeySlice.actions;
export default journeySlice.reducer;
>>>>>>> feat/redux-store
