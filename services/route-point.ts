import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuth } from './auth-storage';

export interface RoutePointMeta {
  [key: string]: any;
}

export interface RoutePointPayload {
  title: string;
  content: string;
  status: 'publish';
  meta: RoutePointMeta;
}

export interface RoutePoint extends RoutePointPayload {
  id: number;
  createdAt?: string;
  updatedAt?: string;
}

const rawBaseUrl = process.env.EXPO_PUBLIC_BP_API_BASE ?? '';
const baseUrl = rawBaseUrl.replace(/\/$/, '');

export const routePointApi = createApi({
  reducerPath: 'routePointApi',
  baseQuery: fetchBaseQuery({
      baseUrl,
      prepareHeaders: async (headers) => {
          const auth = await getAuth();
          if (auth?.token) {
              headers.set('Authorization', `Bearer ${auth.token}`);
          }
          return headers;
      },
  }),
  tagTypes: ['RoutePoint'],
  endpoints: (builder) => ({
    getRoutePoints: builder.query<RoutePoint[], void>({
      query: () => '/wp/v2/route-points',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'RoutePoint' as const, id })),
              { type: 'RoutePoint', id: 'LIST' },
            ]
          : [{ type: 'RoutePoint', id: 'LIST' }],
    }),
    getRoutePoint: builder.query<RoutePoint, number>({
      query: (id) => `/wp/v2/route-points/${id}`,
      providesTags: (result, error, id) => [{ type: 'RoutePoint', id }],
    }),
    createRoutePoint: builder.mutation<RoutePoint, RoutePointPayload>({
      query: (body) => ({
        url: '/wp/v2/route-points',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'RoutePoint', id: 'LIST' }],
    }),
    updateRoutePoint: builder.mutation<RoutePoint, { id: number; data: RoutePointPayload }>({
      query: ({ id, data }) => ({
        url: `/wp/v2/route-points/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'RoutePoint', id },
        { type: 'RoutePoint', id: 'LIST' },
      ],
    }),
    deleteRoutePoint: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/wp/v2/route-points/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'RoutePoint', id },
        { type: 'RoutePoint', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetRoutePointsQuery,
  useGetRoutePointQuery,
  useCreateRoutePointMutation,
  useUpdateRoutePointMutation,
  useDeleteRoutePointMutation,
} = routePointApi;
