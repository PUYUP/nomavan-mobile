import { baseApi } from '../base-api';

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

export const storyApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
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
	useCreateStoryMutation,
	useUpdateStoryMutation,
	useDeleteStoryMutation,
} = storyApi;
