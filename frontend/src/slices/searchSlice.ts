import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface Visitors{
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
    visitors: Visitors;
    filters: Filters;
    sort: 'recommended' | 'price_asc' | 'price_desc' | 'rating';
}

const initialState: SearchState = {
    city: '',
    checkIn: null,
    checkOut: null,
    visitors: {adults: 2, children: 0, rooms: 1},
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

        setVisitors(state, action: PayloadAction<Visitors>){
            state.visitors = action.payload;
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

export const {setCity, setDates, setVisitors, setFilters, clearFilters, setSort, setAgainSearch,} = searchSlice.actions;

export default searchSlice.reducer;