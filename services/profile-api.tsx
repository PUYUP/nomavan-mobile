import { getAuth } from '@/services/auth-storage';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface BPMemberResponse {
    id: number;
    name: string;
    user_login: string;
    friendship_status: boolean;
    friendship_status_slug: string;
    link: string;
    member_types: string[];
    xprofile: XProfile;
    mention_name: string;
    avatar_urls: AvatarUrls;
    _links: Links;
}

interface XProfile {
    groups: XProfileGroup[];
}

interface XProfileGroup {
    name: string;
    id: number;
    fields: XProfileField[];
}

interface XProfileField {
    name: string;
    id: number;
    value: XProfileValue;
}

interface XProfileValue {
    raw: string;
    unserialized: string[];
    rendered: string;
}

interface AvatarUrls {
    full: string;
    thumb: string;
}

interface Links {
    self: LinkItem[];
    collection: LinkItem[];
    }

interface LinkItem {
    href: string;
    targetHints?: {
        allow: string[];
    };
}

const rawBaseUrl = process.env.EXPO_PUBLIC_BP_API_BASE ?? '';
const baseUrl = rawBaseUrl.replace(/\/$/, '');

export const profileApi = createApi({
    reducerPath: 'profileApi',
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
    tagTypes: ['Profile'],
    endpoints: (builder) => ({
        getProfile: builder.query<BPMemberResponse, number>({
            query: (id) => ({
                url: `/buddypress/v1/members/${id}`,
                method: 'GET',
            }),
            providesTags: (_result, _error, id) => [{ type: 'Profile', id }],
        }),
    }),
});

export const {
    useGetProfileQuery,
} = profileApi;