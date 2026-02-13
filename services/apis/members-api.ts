import { getAuth } from '@/services/auth-storage';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import qs from 'qs';

export type MemberContext = 'view' | 'embed' | 'edit';
export type MemberType = 'active' | 'newest' | 'alphabetical' | 'random' | 'online' | 'popular';
export type FriendshipStatus = 'is_friend' | 'not_friends' | 'pending' | 'awaiting_response';

export interface BPMemberFilterArgs {
    context?: MemberContext;
    page?: number;
    per_page?: number;
    search?: string;
    exclude?: number[];
    include?: number[];
    type?: MemberType;
    user_id?: number;
    user_ids?: number[];
    populate_extras?: boolean;
    member_type?: string[];
    xprofile?: any[];
}

export interface BPMemberXProfile {
    group_id: number;
    fields: any[];
}

export interface BPMemberLastActivity {
    timediff: string;
    date: string;
    date_gmt: string;
}

export interface BPMemberLatestUpdate {
    id: number;
    raw: string;
    rendered: string;
}

export interface BPMemberAvatarUrls {
    full: string;
    thumb: string;
}

export interface BPMemberResponse {
    id: number;
    name: string;
    mention_name: string;
    link: string;
    user_login: string;
    member_types: string[];
    registered_date: string | null;
    registered_date_gmt: string | null;
    roles?: string[];
    capabilities?: Record<string, boolean>;
    extra_capabilities?: Record<string, boolean>;
    xprofile?: BPMemberXProfile[];
    friendship_status?: boolean;
    friendship_status_slug?: FriendshipStatus;
    last_activity?: BPMemberLastActivity;
    latest_update?: BPMemberLatestUpdate;
    total_friend_count?: number;
    avatar_urls: BPMemberAvatarUrls;
}

const rawBaseUrl = process.env.EXPO_PUBLIC_BP_API_BASE ?? '';
const baseUrl = rawBaseUrl.replace(/\/$/, '');

export const membersApi = createApi({
    reducerPath: 'membersApi',
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
    endpoints: (builder) => ({
        getMembers: builder.query<BPMemberResponse[], BPMemberFilterArgs | void>({
            query: (args) => {
                return {
                    url: '/buddypress/v1/members?' + qs.stringify(args, {
                        encode: false,
                        arrayFormat: 'indices'
                    }),
                    method: 'GET',
                };
            },
        }),
        getMember: builder.query<BPMemberResponse, number>({
            query: (memberId) => ({
                url: `/buddypress/v1/members/${memberId}`,
                method: 'GET',
            }),
        }),
    }),
});

export const { 
    useGetMembersQuery, 
    useGetMemberQuery 
} = membersApi;
