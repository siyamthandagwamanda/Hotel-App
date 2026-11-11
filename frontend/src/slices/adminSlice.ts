import { createAsyncThunk, createSlice, isFulfilled, isPending, isRejected } from '@reduxjs/toolkit';
import type { Booking } from './bookingSlice';
import { signOut } from './authSlice';
import { callAsUser } from './callAsUser';

export interface AdminBooking extends Booking {
  guestName: string;
  guestEmail: string;
}

export interface AdminHotel {
  id: number;
  name: string;
  city: string;
  province: string;
  address: string;
  description: string;
  starRating: number;
  setting: string;
  status: string;
  roomTypes: number;
}

export interface AdminRoom {
  id: number;
  hotelId: number;
  name: string;
  description: string | null;
  adults: number;
  children: number;
  bedType: string | null;
  basePriceCents: number;
  totalUnits: number;
}

export interface NewHotel {
  name: string;
  description: string;
  city: string;
  province: string;
  address: string;
  latitude: number;
  longitude: number;
  starRating: number;
  setting: string;
}

export interface NewRoom {
  hotelId: number;
  name: string;
  adults: number;
  children: number;
  bedType: string;
  basePriceCents: number;
  totalUnits: number;
}

export interface AvailabilityArgs {
  roomId: number;
  from: string;
  to: string;
  units?: number;
  priceCents?: number | null;
}

interface AdminState {
  reservations: AdminBooking[];
  hotels: AdminHotel[];
  rooms: AdminRoom[];
  roomsHotelId: number | null;
  status: 'idle' | 'loading' | 'error';
  error: string | null;
  message: string | null;
}

const initialState: AdminState = {
  reservations: [],
  hotels: [],
  rooms: [],
  roomsHotelId: null,
  status: 'idle',
  error: null,
  message: null,
};

// ---------- Reservations ----------

export const loadReservations = createAsyncThunk('admin/loadReservations', async (status: string, tools) => {
  const query = status === '' ? '' : `?status=${status}`;
  const data = await callAsUser<{ reservations: AdminBooking[] }>(tools, `/admin/reservations${query}`);
  return data.reservations;
});

export const changeReservation = createAsyncThunk(
  'admin/changeReservation',
  async (args: { reference: string; action: 'approve' | 'reject' | 'cancel' }, tools) => {
    const path = `/admin/reservations/${args.reference}/${args.action}`;
    const data = await callAsUser<{ reservation: AdminBooking }>(tools, path, 'POST');
    return data.reservation;
  },
);

export const moveReservation = createAsyncThunk(
  'admin/moveReservation',
  async (args: { reference: string; checkIn: string; checkOut: string }, tools) => {
    const body = { checkIn: args.checkIn, checkOut: args.checkOut };
    const data = await callAsUser<{ reservation: AdminBooking }>(tools, `/admin/reservations/${args.reference}/dates`, 'POST', body);
    return data.reservation;
  },
);

// ---------- Hotels, rooms and availability ----------

export const loadAdminHotels = createAsyncThunk('admin/loadHotels', async (_arg: void, tools) => {
  const data = await callAsUser<{ hotels: AdminHotel[] }>(tools, '/admin/hotels');
  return data.hotels;
});

export const addHotel = createAsyncThunk('admin/addHotel', async (hotel: NewHotel, tools) => {
  const data = await callAsUser<{ hotel: AdminHotel }>(tools, '/admin/hotels', 'POST', hotel);
  return data.hotel;
});

export const changeHotelStatus = createAsyncThunk(
  'admin/changeHotelStatus',
  async (args: { hotelId: number; status: string }, tools) => {
    const data = await callAsUser<{ hotel: AdminHotel }>(tools, `/admin/hotels/${args.hotelId}`, 'PATCH', { status: args.status });
    return data.hotel;
  },
);

export const loadAdminRooms = createAsyncThunk('admin/loadRooms', async (hotelId: number, tools) => {
  const data = await callAsUser<{ rooms: AdminRoom[] }>(tools, `/admin/hotels/${hotelId}/rooms`);
  return { hotelId: hotelId, rooms: data.rooms };
});

export const addRoom = createAsyncThunk('admin/addRoom', async (room: NewRoom, tools) => {
  const { hotelId, ...body } = room;
  const data = await callAsUser<{ room: AdminRoom }>(tools, `/admin/hotels/${hotelId}/rooms`, 'POST', body);
  return data.room;
});

export const saveAvailability = createAsyncThunk('admin/saveAvailability', async (args: AvailabilityArgs, tools) => {
  const { roomId, ...body } = args;
  const data = await callAsUser<{ nights: number }>(tools, `/admin/rooms/${roomId}/availability`, 'PUT', body);
  return data.nights;
});

// Every admin request shares the same loading and error handling
const adminRequests = [
  loadReservations, changeReservation, moveReservation,
  loadAdminHotels, addHotel, changeHotelStatus, loadAdminRooms, addRoom, saveAvailability,
] as const;

function replaceByReference(list: AdminBooking[], updated: AdminBooking): AdminBooking[] {
  return list.map((item) => (item.reference === updated.reference ? updated : item));
}

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminMessages(state) {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadReservations.fulfilled, (state, action) => {
        state.reservations = action.payload;
      })
      .addCase(changeReservation.fulfilled, (state, action) => {
        state.reservations = replaceByReference(state.reservations, action.payload);
        state.message = `Booking ${action.payload.reference} is now ${action.payload.status.replace(/_/g, ' ')}.`;
      })
      .addCase(moveReservation.fulfilled, (state, action) => {
        state.reservations = replaceByReference(state.reservations, action.payload);
        state.message = `Booking ${action.payload.reference} moved to ${action.payload.checkIn} - ${action.payload.checkOut}.`;
      })
      .addCase(loadAdminHotels.fulfilled, (state, action) => {
        state.hotels = action.payload;
      })
      .addCase(addHotel.fulfilled, (state, action) => {
        state.hotels.unshift(action.payload);
        state.message = `${action.payload.name} was added as a draft.`;
      })
      .addCase(changeHotelStatus.fulfilled, (state, action) => {
        state.hotels = state.hotels.map((hotel) => (hotel.id === action.payload.id ? action.payload : hotel));
        state.message = `${action.payload.name} is now ${action.payload.status}.`;
      })
      .addCase(loadAdminRooms.fulfilled, (state, action) => {
        state.rooms = action.payload.rooms;
        state.roomsHotelId = action.payload.hotelId;
      })
      .addCase(addRoom.fulfilled, (state, action) => {
        state.rooms.push(action.payload);
        state.message = `${action.payload.name} was added.`;
      })
      .addCase(saveAvailability.fulfilled, (state, action) => {
        state.message = `Updated ${action.payload} nights.`;
      })
      .addCase(signOut.fulfilled, () => initialState)
      .addMatcher(isPending(...adminRequests), (state) => {
        state.status = 'loading';
        state.error = null;
        state.message = null;
      })
      .addMatcher(isFulfilled(...adminRequests), (state) => {
        state.status = 'idle';
      })
      .addMatcher(isRejected(...adminRequests), (state, action) => {
        state.status = 'error';
        state.error = action.error.message ?? 'Something went wrong.';
      });
  },
});

export const { clearAdminMessages } = adminSlice.actions;
export default adminSlice.reducer;