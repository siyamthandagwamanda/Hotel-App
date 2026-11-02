import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { HotelImage, Amenity } from './hotelSlices';

export interface Policy {
  type: string;
  text: string;
}

export interface HotelDetail {
  id: number;
  name: string;
  description: string;
  city: string;
  province: string;
  address: string;
  latitude: number;
  longitude: number;
  starRating: number;
  ratingAvg: number;
  reviewCount: number;
  setting: string;
  checkInTime: string;
  checkOutTime: string;
  images: HotelImage[];
  amenities: Amenity[];
  policies: Policy[];
}

export interface RoomOption {
  id: number;
  name: string;
  description: string | null;
  adults: number;
  children: number;
  bedType: string | null;
  nightlyCents: number;
  totalCents: number | null;
  unitsLeft: number | null;
  fitsParty: boolean;
  available: boolean | null;
}

export interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  name: string;
}

export interface RoomsArgs {
  hotelId: number;
  checkIn: string | null;
  checkOut: string | null;
  adults: number;
  children: number;
  rooms: number;
}

interface RoomsResponse {
  nights: number | null;
  rooms: RoomOption[];
  bestRoomId: number | null;
}

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

interface HotelDetailState {
  hotel: HotelDetail | null;
  hotelStatus: LoadStatus;
  rooms: RoomOption[];
  nights: number | null;
  bestRoomId: number | null;
  roomsStatus: LoadStatus;
  reviews: Review[];
}

const initialState: HotelDetailState = {
  hotel: null,
  hotelStatus: 'idle',
  rooms: [],
  nights: null,
  bestRoomId: null,
  roomsStatus: 'idle',
  reviews: [],
};

const BASE_URL = import.meta.env.VITE_API_URL;

function buildRoomsQuery(args: RoomsArgs): string {
  const query = new URLSearchParams();

  if (args.checkIn !== null && args.checkOut !== null) {
    query.set('checkIn', args.checkIn);
    query.set('checkOut', args.checkOut);
  }
  query.set('adults', String(args.adults));
  query.set('children', String(args.children));
  query.set('rooms', String(args.rooms));

  return query.toString();
}

export const fetchHotelDetail = createAsyncThunk(
  'detail/fetchHotel',

  async (hotelId: number) => {
    const response = await fetch(`${BASE_URL}/hotels/${hotelId}`);
    if (!response.ok) throw new Error('Could not load this hotel');
    return (await response.json()) as HotelDetail;
  }
);

export const fetchHotelRooms = createAsyncThunk(
  'detail/fetchRooms',

  async (args: RoomsArgs) => {
    const response = await fetch(`${BASE_URL}/hotels/${args.hotelId}/rooms?${buildRoomsQuery(args)}`);
    if (!response.ok) throw new Error('Could not check room availability');
    return (await response.json()) as RoomsResponse;
  }
);

export const fetchHotelReviews = createAsyncThunk(
  'detail/fetchReviews',

  async (hotelId: number) => {
    const response = await fetch(`${BASE_URL}/hotels/${hotelId}/reviews`);
    if (!response.ok) throw new Error('Could not load reviews');
    const data = await response.json();
    return data.reviews as Review[];
  }
);

const hotelDetailSlice = createSlice({
  name: 'hotelDetail',
  initialState,
  reducers: {
    
    clearDetail() {
      return initialState;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchHotelDetail.pending, (state) => {
        state.hotelStatus = 'loading';
      })
      .addCase(fetchHotelDetail.fulfilled, (state, action) => {
        state.hotelStatus = 'ready';
        state.hotel = action.payload;
      })
      .addCase(fetchHotelDetail.rejected, (state) => {
        state.hotelStatus = 'error';
      })

      .addCase(fetchHotelRooms.pending, (state) => {
        state.roomsStatus = 'loading';
      })
      .addCase(fetchHotelRooms.fulfilled, (state, action) => {
        state.roomsStatus = 'ready';
        state.rooms = action.payload.rooms;
        state.nights = action.payload.nights;
        state.bestRoomId = action.payload.bestRoomId;
      })
      .addCase(fetchHotelRooms.rejected, (state) => {
        state.roomsStatus = 'error';
      })

      .addCase(fetchHotelReviews.fulfilled, (state, action) => {
        state.reviews = action.payload;
      });
  },
});

export const { clearDetail } = hotelDetailSlice.actions;
export default hotelDetailSlice.reducer;