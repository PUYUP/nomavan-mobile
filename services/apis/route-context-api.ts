import { baseApi } from '../base-api';

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

export const routeContextApi = baseApi.injectEndpoints({
    overrideExisting: false,
    endpoints: (builder) => ({
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
  useCreateRouteContextMutation,
  useUpdateRouteContextMutation,
  useDeleteRouteContextMutation,
} = routeContextApi;
