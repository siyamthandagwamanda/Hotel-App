import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface HotelImage {
  url: string;
  alt: string;
}

export interface HotelCardData {
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

export interface Shelf {
  id: string;
  title: string;
  hotels: HotelCardData[];
}

export interface ShelvesResponse {
  shelves: Shelf[];
}

export const hotelApi = createApi({
  reducerPath: 'hotelApi',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL }),
  endpoints: (builder) => ({
    getShelves: builder.query<ShelvesResponse, string>({
      query: (city) => `/hotels/shelves?city=${encodeURIComponent(city)}`,
    }),
  }),
});

export const { useGetShelvesQuery } = hotelApi;