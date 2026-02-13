import { getAuth } from '@/services/auth-storage';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type SpothuntStatus = 'publish' | 'draft' | 'private';

export interface SpothuntPayload {
	title: string;
	content: string;
	status: SpothuntStatus;
	meta?: Record<string, unknown>;
}

export interface SpothuntResponse {
	id: number;
	date: string;
	date_gmt: string;
	modified: string;
	modified_gmt: string;
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
	meta?: Record<string, unknown>;
	tags?: number[];
	_links?: Record<string, Array<{ href: string; embeddable?: boolean; targetHints?: { allow: string[] } }>>;
}

export interface SpothuntFilterArgs {
	context?: 'view' | 'edit';
	page?: number;
	per_page?: number;
	search?: string;
	include?: number[];
	exclude?: number[];
	order?: 'asc' | 'desc';
	orderby?: 'date' | 'id' | 'include';
	author?: number;
}

export type UpdateSpothuntArgs = {
	id: number;
	payload: SpothuntPayload;
};

export type DeleteSpothuntArgs = {
	id: number;
	force?: boolean;
};

const rawBaseUrl = process.env.EXPO_PUBLIC_BP_API_BASE ?? '';
const baseUrl = rawBaseUrl.replace(/\/$/, '');

export const spothuntApi = createApi({
	reducerPath: 'spothuntApi',
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
	tagTypes: ['Spothunt', 'Activity'],
	endpoints: (builder) => ({
		getSpothunts: builder.query<SpothuntResponse[], SpothuntFilterArgs | void>({
			query: (args) => ({
				url: '/wp/v2/spothunts',
				method: 'GET',
				params: args ?? {},
			}),
			providesTags: (result) =>
				result
					? [
						{ type: 'Spothunt' as const, id: 'LIST' },
						...result.map((item) => ({ type: 'Spothunt' as const, id: item.id })),
					]
					: [{ type: 'Spothunt' as const, id: 'LIST' }],
		}),
		getSpothuntById: builder.query<SpothuntResponse, number>({
			query: (id) => ({
				url: `/wp/v2/spothunts/${id}`,
				method: 'GET',
			}),
			providesTags: (_result, _error, id) => [{ type: 'Spothunt', id }],
		}),
		createSpothunt: builder.mutation<SpothuntResponse, SpothuntPayload>({
			query: (body) => ({
				url: '/wp/v2/spothunts',
				method: 'POST',
				body,
			}),
			invalidatesTags: [
				{ type: 'Spothunt', id: 'LIST' },
				{ type: 'Activity', id: 'LIST' },
			],
		}),
		updateSpothunt: builder.mutation<SpothuntResponse, UpdateSpothuntArgs>({
			query: ({ id, payload }) => ({
				url: `/wp/v2/spothunts/${id}`,
				method: 'PUT',
				body: payload,
			}),
			invalidatesTags: (_result, _error, arg) => [
				{ type: 'Spothunt', id: arg.id },
				{ type: 'Spothunt', id: 'LIST' },
				{ type: 'Activity', id: 'LIST' },
			],
		}),
		deleteSpothunt: builder.mutation<{ deleted: boolean; previous?: SpothuntResponse }, DeleteSpothuntArgs>({
			query: ({ id, force }) => ({
				url: `/wp/v2/spothunts/${id}`,
				method: 'DELETE',
				params: force ? { force: true } : undefined,
			}),
			invalidatesTags: (_result, _error, arg) => [
				{ type: 'Spothunt', id: arg.id },
				{ type: 'Spothunt', id: 'LIST' },
				{ type: 'Activity', id: 'LIST' },
			],
		}),
	}),
});

export const {
	useGetSpothuntsQuery,
	useGetSpothuntByIdQuery,
	useCreateSpothuntMutation,
	useUpdateSpothuntMutation,
	useDeleteSpothuntMutation,
} = spothuntApi;
