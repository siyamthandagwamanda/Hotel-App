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

