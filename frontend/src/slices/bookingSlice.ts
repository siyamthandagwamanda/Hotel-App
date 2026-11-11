import { createAsyncThunk, createSlice, isFulfilled, isPending, isRejected } from '@reduxjs/toolkit';
import { signOut } from './authSlice';
import { callAsUser } from './callAsUser';

export interface BookedRoom {
  roomName: string;
  quantity: number;
}

export interface Booking {
  reference: string;
  status: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  totalCents: number;
  discountCents: number;
  currency: string;
  holdExpiresAt: string | null;
  hotelId: number;
  hotelName: string;
  hotelCity: string;
  hotelImage: string | null;
  rooms: BookedRoom[];
}

export interface Loyalty {
  trips: number;
  tripsNeeded: number;
  percent: number;
  unlocked: boolean;
}

export interface ReserveArgs {
  roomTypeId: number;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
}

interface BookingState {
  current: Booking | null;
  trips: Booking[];
  loyalty: Loyalty | null;
  status: 'idle' | 'loading' | 'error';
  error: string | null;
}

const initialState: BookingState = {
  current: null,
  trips: [],
  loyalty: null,
  status: 'idle',
  error: null,
};

export const reserveRoom = createAsyncThunk('booking/reserve', async (args: ReserveArgs, tools) => {
  const data = await callAsUser<{ booking: Booking }>(tools, '/bookings', 'POST', args);
  return data.booking;
});

export const loadBooking = createAsyncThunk('booking/load', async (reference: string, tools) => {
  const data = await callAsUser<{ booking: Booking }>(tools, `/bookings/${reference}`);
  return data.booking;
});

// Asks the server to check with Paystack whether the payment went through
export const verifyBooking = createAsyncThunk('booking/verify', async (reference: string, tools) => {
  const data = await callAsUser<{ booking: Booking }>(tools, `/bookings/${reference}/verify`, 'POST');
  return data.booking;
});

// Returns the Paystack checkout address; the page sends the visitor there
export const payForBooking = createAsyncThunk('booking/pay', async (reference: string, tools) => {
  const data = await callAsUser<{ paymentUrl: string }>(tools, `/bookings/${reference}/pay`, 'POST');
  return data.paymentUrl;
});

export const cancelBooking = createAsyncThunk('booking/cancel', async (reference: string, tools) => {
  const data = await callAsUser<{ booking: Booking }>(tools, `/bookings/${reference}/cancel`, 'POST');
  return data.booking;
});

export const loadTrips = createAsyncThunk('booking/loadTrips', async (_arg: void, tools) => {
  const data = await callAsUser<{ bookings: Booking[] }>(tools, '/bookings');
  return data.bookings;
});

export const loadLoyalty = createAsyncThunk('booking/loadLoyalty', async (_arg: void, tools) => {
  const data = await callAsUser<{ loyalty: Loyalty }>(tools, '/bookings/loyalty');
  return data.loyalty;
});

// The requests the booking pages wait on (the promo lookup runs quietly in the background)
const pageRequests = [reserveRoom, loadBooking, verifyBooking, payForBooking, cancelBooking, loadTrips] as const;

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearCurrent(state) {
      state.current = null;
      state.error = null;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(reserveRoom.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(loadBooking.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(verifyBooking.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(loadTrips.fulfilled, (state, action) => {
        state.trips = action.payload;
      })
      .addCase(loadLoyalty.fulfilled, (state, action) => {
        state.loyalty = action.payload;
      })
      .addCase(signOut.fulfilled, () => initialState)
      // Every booking request shares the same loading and error handling
      .addMatcher(isPending(...pageRequests), (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addMatcher(isFulfilled(...pageRequests), (state) => {
        state.status = 'idle';
      })
      .addMatcher(isRejected(...pageRequests), (state, action) => {
        state.status = 'error';
        state.error = action.error.message ?? 'Something went wrong.';
      });
  },
});

export const { clearCurrent } = bookingSlice.actions;
export default bookingSlice.reducer;