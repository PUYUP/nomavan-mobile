import { getAuth } from '@/services/auth-storage';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import qs from "qs";
import { ReactNode } from 'react';

export interface BPActivityPayload {
    primary_item_id?: number;
    secondary_item_id?: number;
    user_id?: number;
    link?: string;
    component: BPActivityComponent;
    type: BPActivityType;
    content?: string;
    date?: string;
    hidden?: boolean;
}

export type BPActivityComponent =
    | "activity"
    | "groups"
    | "members"
    | "friends"
    | "messages"
    | string;

export type BPActivityType =
    | "activity_update"
    | "activity_comment"
    | "created_group"
    | "joined_group"
    | "new_member"
    | "friendship_created"
    | string;

export interface BPActivityResponse {
    favorited_count: ReactNode;
    user_id: number;
    component: string;
    content: BPActivityContent;
    date: string;
    date_gmt: string;
    id: number;
    link: string;
    primary_item_id: number;
    secondary_item_id: number;
    status: string;
    title: string;
    type: string;
    hidden: boolean;
    favorited: boolean;
    user_avatar: BPUserAvatar;
    _links: BPActivityLinks;

    // custom fields
    user_profile: BPUserProfile;
    primary_item: any;
    secondary_item: any;
}

export interface BPActivityContent {
    raw: string;
    rendered: string;
}

export interface BPUserAvatar {
    full: string;
    thumb: string;
}

export interface BPUserProfile {
    name: string;
}

export interface BPActivityLinks {
    self: BPLink[];
    collection: BPLink[];
    user: BPEmbeddableLink[];
    favorite: BPActivityFavoriteLink[];
    "bp-action-favorite": BPActivityFavoriteLink[];
}

export interface BPLink {
    href: string;
    targetHints?: {
        allow: string[];
    };
}

export interface BPEmbeddableLink {
    embeddable: boolean;
    href: string;
}

export interface BPActivityFavoriteLink {
    activity_id: number;
    href: string;
}

export interface BPMetaQuery {
    key: string;
    value: string;
}

export interface BPActivityFilterArgs {
    context?: "view" | "edit";
    page?: number;
    per_page?: number;
    search?: string;
    exclude?: number[];
    include?: number[];
    order?: "asc" | "desc";
    after?: string;
    user_id?: number;
    status?: "ham_only" | "spam_only" | "all";
    scope?: BPActivityScope[];
    group_id?: number;
    site_id?: number;
    primary_id?: number;
    secondary_id?: number;
    component?: BPActivityComponent;
    type?: BPActivityType[];
    display_comments?: "" | "stream" | "threaded";
    secondary_item_meta_query?: BPMetaQuery[];
}

export type BPActivityScope =
    | "just-me"
    | "friends"
    | "groups"
    | "favorites"
    | "mentions";

const rawBaseUrl = process.env.EXPO_PUBLIC_BP_API_BASE ?? '';
const baseUrl = rawBaseUrl.replace(/\/$/, '');

export const activityApi = createApi({
    reducerPath: 'activityApi',
    keepUnusedDataFor: 0,
    tagTypes: ['Activity'],
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
    endpoints: (builder) => ({
        getActivities: builder.query<BPActivityResponse[], BPActivityFilterArgs | void>({
            query: (args) => {
                return {
                    url: '/buddypress/v1/activity?' + qs.stringify(args, {
                        encode: false,
                        arrayFormat: "indices"
                    }),
                    method: 'GET',
                }
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: 'Activity' as const, id })),
                        { type: 'Activity', id: 'LIST' },
                    ]
                    : [{ type: 'Activity', id: 'LIST' }],
        }),
        getActivity: builder.query<BPActivityResponse, number>({
            query: (activityId) => ({
                url: `/buddypress/v1/activity/${activityId}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{ type: 'Activity', id }],
        }),
        createActivity: builder.mutation<BPActivityResponse, BPActivityPayload>({
            query: (body) => ({
                url: '/buddypress/v1/activity',
                method: 'POST',
                body: {
                    ...body,
                    types: 'activity',
                }
            }),
            invalidatesTags: [{ type: 'Activity', id: 'LIST' }],
        }),
        favoriteActivity: builder.mutation<BPActivityResponse, number>({
            query: (activityId) => ({
                url: `/buddypress/v1/activity/${activityId}/favorite`,
                method: 'POST',
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: 'Activity', id },
                { type: 'Activity', id: 'LIST' },
            ],
        }),
    }),
});

export const { useGetActivitiesQuery, useGetActivityQuery, useCreateActivityMutation, useFavoriteActivityMutation } = activityApi;
