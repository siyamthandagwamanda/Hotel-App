import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { Review } from './hotelDetailSlices';
import { signOut } from './authSlice';
import { callAsUser } from './callAsUser';

interface ReviewStatus {
  canReview: boolean;
  reason: 'ok' | 'no_stay' | 'already_reviewed';
}

interface ReviewState {
  canReview: boolean;
  reason: ReviewStatus['reason'] | null;
  saving: boolean;
  error: string | null;
}

const initialState: ReviewState = {
  canReview: false,
  reason: null,
  saving: false,
  error: null,
};

// Asks the server whether this guest may review the hotel
export const loadReviewStatus = createAsyncThunk('reviews/status', async (hotelId: number, tools) => {
  return callAsUser<ReviewStatus>(tools, `/hotels/${hotelId}/review-status`);
});

// Posts the review and returns the hotel's latest reviews
export const submitReview = createAsyncThunk(
  'reviews/submit',
  async (args: { hotelId: number; rating: number; comment: string }, tools) => {
    const body = { rating: args.rating, comment: args.comment };
    const data = await callAsUser<{ reviews: Review[] }>(tools, `/hotels/${args.hotelId}/reviews`, 'POST', body);
    return data.reviews;
  },
);

const reviewSlice = createSlice({
  name: 'reviewForm',
  initialState,
  reducers: {
    clearReviewForm() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadReviewStatus.fulfilled, (state, action) => {
        state.canReview = action.payload.canReview;
        state.reason = action.payload.reason;
      })
      .addCase(submitReview.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(submitReview.fulfilled, (state) => {
        state.saving = false;
        state.canReview = false;
        state.reason = 'already_reviewed';
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message ?? 'We could not save your review.';
      })
      .addCase(signOut.fulfilled, () => initialState);
  },
});

export const { clearReviewForm } = reviewSlice.actions;
export default reviewSlice.reducer;