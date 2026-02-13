import { getAuth } from '@/services/auth-storage';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type StoryStatus = 'publish' | 'draft' | 'private';

export interface StoryPayload {
	title: string;
	content: string;
	status: StoryStatus;
	meta?: Record<string, unknown>;
}

export interface StoryResponse {
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

export interface StoryFilterArgs {
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

export type UpdateStoryArgs = {
	id: number;
	payload: StoryPayload;
};

export type DeleteStoryArgs = {
	id: number;
	force?: boolean;
};

const rawBaseUrl = process.env.EXPO_PUBLIC_BP_API_BASE ?? '';
const baseUrl = rawBaseUrl.replace(/\/$/, '');

export const storyApi = createApi({
	reducerPath: 'storyApi',
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
	tagTypes: ['Story', 'Activity'],
	endpoints: (builder) => ({
		getStories: builder.query<StoryResponse[], StoryFilterArgs | void>({
			query: (args) => ({
				url: '/wp/v2/stories',
				method: 'GET',
				params: args ?? {},
			}),
			providesTags: (result) =>
				result
					? [
						{ type: 'Story' as const, id: 'LIST' },
						...result.map((item) => ({ type: 'Story' as const, id: item.id })),
					]
					: [{ type: 'Story' as const, id: 'LIST' }],
		}),
		getStoryById: builder.query<StoryResponse, number>({
			query: (id) => ({
				url: `/wp/v2/stories/${id}`,
				method: 'GET',
			}),
			providesTags: (_result, _error, id) => [{ type: 'Story', id }],
		}),
		createStory: builder.mutation<StoryResponse, StoryPayload>({
			query: (body) => ({
				url: '/wp/v2/stories',
				method: 'POST',
				body,
			}),
			invalidatesTags: [
				{ type: 'Story', id: 'LIST' },
				{ type: 'Activity', id: 'LIST' },
			],
		}),
		updateStory: builder.mutation<StoryResponse, UpdateStoryArgs>({
			query: ({ id, payload }) => ({
				url: `/wp/v2/stories/${id}`,
				method: 'PUT',
				body: payload,
			}),
			invalidatesTags: (_result, _error, arg) => [
				{ type: 'Story', id: arg.id },
				{ type: 'Story', id: 'LIST' },
				{ type: 'Activity', id: 'LIST' },
			],
		}),
		deleteStory: builder.mutation<{ deleted: boolean; previous?: StoryResponse }, DeleteStoryArgs>({
			query: ({ id, force }) => ({
				url: `/wp/v2/stories/${id}`,
				method: 'DELETE',
				params: force ? { force: true } : undefined,
			}),
			invalidatesTags: (_result, _error, arg) => [
				{ type: 'Story', id: arg.id },
				{ type: 'Story', id: 'LIST' },
				{ type: 'Activity', id: 'LIST' },
			],
		}),
	}),
});

export const {
	useGetStoriesQuery,
	useGetStoryByIdQuery,
	useCreateStoryMutation,
	useUpdateStoryMutation,
	useDeleteStoryMutation,
} = storyApi;
