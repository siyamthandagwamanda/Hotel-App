import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

<<<<<<< HEAD
export interface Visitors{
=======
export interface Guests{
>>>>>>> feat/redux-store
    adults: number;
    children: number;
    rooms: number;
}

export interface Filters{
    minPrice: number | null;
    maxPrice: number | null;
    stars: number | null;
    amenityIds: number[];
    propertyType: string | null;
}

interface SearchState {
    city: string;
    checkIn: string | null;
    checkOut: string | null;
<<<<<<< HEAD
    visitors: Visitors;
=======
    guests: Guests;
>>>>>>> feat/redux-store
    filters: Filters;
    sort: 'recommended' | 'price_asc' | 'price_desc' | 'rating';
}

const initialState: SearchState = {
    city: '',
    checkIn: null,
    checkOut: null,
<<<<<<< HEAD
    visitors: {adults: 2, children: 0, rooms: 1},
=======
    guests: {adults: 2, children: 0, rooms: 1},
>>>>>>> feat/redux-store
    filters:{
        minPrice: null,
        maxPrice: null,
        stars: null,
        amenityIds: [],
        propertyType: null,
    },
    sort: 'recommended',
};

const searchSlice = createSlice({
    name: 'search', initialState,
    reducers: {
        setCity(state, action: PayloadAction<string>){
            state.city = action.payload;
        },

        setDates(state, action: PayloadAction<{checkIn: string | null; checkOut: string | null}>){
            state.checkIn = action.payload.checkIn;
            state.checkOut = action.payload.checkOut;
        },

<<<<<<< HEAD
        setVisitors(state, action: PayloadAction<Visitors>){
            state.visitors = action.payload;
=======
        setGuests(state, action: PayloadAction<Guests>){
            state.guests = action.payload;
>>>>>>> feat/redux-store
        },

        setFilters(state, action: PayloadAction<Filters>){
            state.filters = action.payload;
        },

        clearFilters(state){
            state.filters = {...initialState.filters};
        },

        setSort(state, action: PayloadAction<SearchState['sort']>){
            state.sort = action.payload;
        },
        setAgainSearch(){
            return initialState;
        },
    },
});

<<<<<<< HEAD
export const {setCity, setDates, setVisitors, setFilters, clearFilters, setSort, setAgainSearch,} = searchSlice.actions;
=======
export const {setCity, setDates, setGuests, setFilters, clearFilters, setSort, setAgainSearch,} = searchSlice.actions;
>>>>>>> feat/redux-store

export default searchSlice.reducer;