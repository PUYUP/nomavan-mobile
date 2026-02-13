import { getAuth } from '@/services/auth-storage';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface ConnectivityPayload {
	content: string;
	status: 'publish' | 'draft' | 'private';
	meta: {
		latitude: number;
		longitude: number;
		place_name: string;
		carrier: string;
		generation: string;
		type: string;
		internet_available: boolean;
		strength: number;
	};
}

export interface ConnectivityResponse {
	id: number;
	date: string;
	date_gmt: string;
	guid: {
		rendered: string;
		raw: string;
	};
	modified: string;
	modified_gmt: string;
	password: string;
	slug: string;
	status: string;
	type: string;
	link: string;
	title: {
		raw: string;
		rendered: string;
	};
	content: {
		raw: string;
		rendered: string;
		protected: boolean;
		block_version: number;
	};
	author: number;
	featured_media: number;
	comment_status: string;
	ping_status: string;
	template: string;
	meta: {
		footnotes: string;
		latitude: number;
		longitude: number;
		place_name: string;
		carrier: string;
		generation: string;
		type: string;
		internet_available: number;
		strength: number;
	};
	tags: number[];
	permalink_template: string;
	generated_slug: string;
	class_list: string[];
	_links: Record<string, Array<{ href: string; embeddable?: boolean; targetHints?: { allow: string[] } }>>;
}

export interface ConnectivityFilterArgs {
	context?: 'view' | 'edit';
	page?: number;
	per_page?: number;
	search?: string;
	include?: number[];
	exclude?: number[];
	order?: 'asc' | 'desc';
	orderby?: 'date' | 'id' | 'include';
	user_id?: number;
}

export type UpdateConnectivityArgs = {
	id: number;
	payload: ConnectivityPayload;
};

export type DeleteConnectivityArgs = {
	id: number;
	force?: boolean;
};

const rawBaseUrl = process.env.EXPO_PUBLIC_BP_API_BASE ?? '';
const baseUrl = rawBaseUrl.replace(/\/$/, '');

export const connectivityApi = createApi({
	reducerPath: 'connectivityApi',
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
	tagTypes: ['Connectivity', 'Activity'],
	endpoints: (builder) => ({
		getConnectivity: builder.query<ConnectivityResponse[], ConnectivityFilterArgs | void>({
			query: (args) => ({
				url: '/wp/v2/connectivities',
				method: 'GET',
				params: args ?? {},
			}),
			providesTags: (result) =>
				result
					? [
						{ type: 'Connectivity' as const, id: 'LIST' },
						...result.map((item) => ({ type: 'Connectivity' as const, id: item.id })),
					]
					: [{ type: 'Connectivity' as const, id: 'LIST' }],
		}),
		getConnectivityById: builder.query<ConnectivityResponse, number>({
			query: (id) => ({
				url: `/wp/v2/connectivities/${id}`,
				method: 'GET',
			}),
			providesTags: (_result, _error, id) => [{ type: 'Connectivity', id }],
		}),
		createConnectivity: builder.mutation<ConnectivityResponse, ConnectivityPayload>({
			query: (body) => ({
				url: '/wp/v2/connectivities',
				method: 'POST',
				body,
			}),
			invalidatesTags: [
				{ type: 'Connectivity', id: 'LIST' },
				{ type: 'Activity', id: 'LIST' },
			],
		}),
		updateConnectivity: builder.mutation<ConnectivityResponse, UpdateConnectivityArgs>({
			query: ({ id, payload }) => ({
				url: `/wp/v2/connectivities/${id}`,
				method: 'PUT',
				body: payload,
			}),
			invalidatesTags: (_result, _error, arg) => [
				{ type: 'Connectivity', id: arg.id },
				{ type: 'Connectivity', id: 'LIST' },
				{ type: 'Activity', id: 'LIST' },
			],
		}),
		deleteConnectivity: builder.mutation<{ deleted: boolean; previous?: ConnectivityResponse }, DeleteConnectivityArgs>({
			query: ({ id, force }) => ({
				url: `/wp/v2/connectivities/${id}`,
				method: 'DELETE',
				params: force ? { force: true } : undefined,
			}),
			invalidatesTags: (_result, _error, arg) => [
				{ type: 'Connectivity', id: arg.id },
				{ type: 'Connectivity', id: 'LIST' },
				{ type: 'Activity', id: 'LIST' },
			],
		}),
	}),
});

export const {
	useGetConnectivityQuery,
	useGetConnectivityByIdQuery,
	useCreateConnectivityMutation,
	useUpdateConnectivityMutation,
	useDeleteConnectivityMutation,
} = connectivityApi;
