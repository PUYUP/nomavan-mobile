import { baseApi } from '../base-api';

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

export const spothuntApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
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
	useCreateSpothuntMutation,
	useUpdateSpothuntMutation,
	useDeleteSpothuntMutation,
} = spothuntApi;
