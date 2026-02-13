import { baseApi } from "../base-api";

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

export const routePointApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createRoutePoint: builder.mutation<RoutePoint, RoutePointPayload>({
      query: (body) => ({
        url: '/wp/v2/route-points',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'RoutePoint', id: 'LIST' },
        { type: 'Activity', id: 'LIST' },
      ],
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
        { type: 'Activity', id: 'LIST' },
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
        { type: 'Activity', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useCreateRoutePointMutation,
  useUpdateRoutePointMutation,
  useDeleteRoutePointMutation,
} = routePointApi;
