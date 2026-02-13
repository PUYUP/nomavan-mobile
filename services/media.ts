import { getAuth } from '@/services/auth-storage';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface MediaUploadPayload {
	file: Blob | { uri: string; name?: string; type?: string } | string;
	post?: number;
	filename?: string;
	mimeType?: string;
}

export interface MediaResponse {
	id: number;
	date: string;
	date_gmt: string;
	slug: string;
	status: string;
	type: string;
	link: string;
	title: {
		raw: string;
		rendered: string;
	};
	source_url: string;
	media_type: string;
	mime_type: string;
}

export interface MediaFilterArgs {
	context?: 'view' | 'edit';
	page?: number;
	per_page?: number;
	search?: string;
	include?: number[];
	exclude?: number[];
	order?: 'asc' | 'desc';
	orderby?: 'date' | 'id' | 'include';
	parent?: number;
	media_type?: string;
	mime_type?: string;
}

export type UpdateMediaArgs = {
	id: number;
	payload: Record<string, unknown>;
};

export type DeleteMediaArgs = {
	id: number;
	force?: boolean;
};

const rawBaseUrl = process.env.EXPO_PUBLIC_BP_API_BASE ?? '';
const baseUrl = rawBaseUrl.replace(/\/$/, '');

export const mediaApi = createApi({
	reducerPath: 'mediaApi',
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
	tagTypes: ['Media'],
	endpoints: (builder) => ({
		getMedia: builder.query<MediaResponse[], MediaFilterArgs | void>({
			query: (args) => ({
				url: '/wp/v2/media',
				method: 'GET',
				params: args ?? {},
			}),
			providesTags: (result) =>
				result
					? [
						{ type: 'Media' as const, id: 'LIST' },
						...result.map((item) => ({ type: 'Media' as const, id: item.id })),
					]
					: [{ type: 'Media' as const, id: 'LIST' }],
		}),
		getMediaById: builder.query<MediaResponse, number>({
			query: (id) => ({
				url: `/wp/v2/media/${id}`,
				method: 'GET',
			}),
			providesTags: (_result, _error, id) => [{ type: 'Media', id }],
		}),
		uploadMedia: builder.mutation<MediaResponse, MediaUploadPayload>({
			query: ({ file, post, filename, mimeType }) => {
				const formData = new FormData();
				const resolveName = (uri: string) => {
					const last = uri.split('/').pop();
					return last && last.length > 0 ? last : 'upload';
				};
				const fallbackType = mimeType ?? 'application/octet-stream';

				if (typeof file === 'string') {
					formData.append('file', {
						uri: file,
						name: filename ?? resolveName(file),
						type: fallbackType,
					} as any);
				} else if ('uri' in (file as any)) {
					const resolved = file as { uri: string; name?: string; type?: string };
					formData.append('file', {
						uri: resolved.uri,
						name: resolved.name ?? filename ?? resolveName(resolved.uri),
						type: resolved.type ?? fallbackType,
					} as any);
				} else {
					formData.append('file', file as any, filename ?? 'upload');
				}
				if (post !== undefined) {
					formData.append('post', String(post));
				}

				return {
					url: '/wp/v2/media',
					method: 'POST',
					body: formData,
					// Let fetch set the multipart boundary automatically.
				};
			},
			invalidatesTags: [{ type: 'Media', id: 'LIST' }],
		}),
		updateMedia: builder.mutation<MediaResponse, UpdateMediaArgs>({
			query: ({ id, payload }) => ({
				url: `/wp/v2/media/${id}`,
				method: 'PUT',
				body: payload,
			}),
			invalidatesTags: (_result, _error, arg) => [
				{ type: 'Media', id: arg.id },
				{ type: 'Media', id: 'LIST' },
			],
		}),
		deleteMedia: builder.mutation<{ deleted: boolean; previous?: MediaResponse }, DeleteMediaArgs>({
			query: ({ id, force }) => ({
				url: `/wp/v2/media/${id}`,
				method: 'DELETE',
				params: force ? { force: true } : undefined,
			}),
			invalidatesTags: (_result, _error, arg) => [
				{ type: 'Media', id: arg.id },
				{ type: 'Media', id: 'LIST' },
			],
		}),
	}),
});

export const {
	useGetMediaQuery,
	useGetMediaByIdQuery,
	useUploadMediaMutation,
	useUpdateMediaMutation,
	useDeleteMediaMutation,
} = mediaApi;
