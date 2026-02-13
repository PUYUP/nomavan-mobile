import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuth } from './auth-storage';

export interface RouteContextMeta {
  [key: string]: any;
}

export interface RouteContextPayload {
  title: string;
  content: string;
  status: 'publish';
  meta: RouteContextMeta;
}

export interface RouteContext extends RouteContextPayload {
  id: number;
  createdAt?: string;
  updatedAt?: string;
}

const rawBaseUrl = process.env.EXPO_PUBLIC_BP_API_BASE ?? '';
const baseUrl = rawBaseUrl.replace(/\/$/, '');

export const routeContextApi = createApi({
    reducerPath: 'routeContextApi',
    keepUnusedDataFor: 0,
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
    tagTypes: ['RouteContext', 'Activity'],
    endpoints: (builder) => ({
        getRouteContexts: builder.query<RouteContext[], void>({
            query: () => '/wp/v2/route-contexts',
            providesTags: (result) =>
                result
                ? [
                    ...result.map(({ id }) => ({ type: 'RouteContext' as const, id })),
                    { type: 'RouteContext', id: 'LIST' },
                    ]
                : [{ type: 'RouteContext', id: 'LIST' }],
        }),
        getRouteContext: builder.query<RouteContext, number>({
            query: (id) => `/wp/v2/route-contexts/${id}`,
            providesTags: (result, error, id) => [{ type: 'RouteContext', id }],
        }),
        createRouteContext: builder.mutation<RouteContext, RouteContextPayload>({
            query: (body) => ({
                url: '/wp/v2/route-contexts',
                method: 'POST',
                body,
            }),
            invalidatesTags: [
                { type: 'RouteContext', id: 'LIST' },
                { type: 'Activity', id: 'LIST' },
            ],
        }),
        updateRouteContext: builder.mutation<RouteContext, { id: number; data: RouteContextPayload }>({
            query: ({ id, data }) => ({
                url: `/wp/v2/route-contexts/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'RouteContext', id },
                { type: 'RouteContext', id: 'LIST' },
                { type: 'Activity', id: 'LIST' },
            ],
        }),
        deleteRouteContext: builder.mutation<{ success: boolean }, number>({
            query: (id) => ({
                url: `/wp/v2/route-contexts/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'RouteContext', id },
                { type: 'RouteContext', id: 'LIST' },
                { type: 'Activity', id: 'LIST' },
            ],
        }),
     }),
});

export const {
  useGetRouteContextsQuery,
  useGetRouteContextQuery,
  useCreateRouteContextMutation,
  useUpdateRouteContextMutation,
  useDeleteRouteContextMutation,
} = routeContextApi;
