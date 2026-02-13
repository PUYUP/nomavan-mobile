import { baseApi } from '../base-api';

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

export const connectivityApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
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
    }),
});

export const {
    useCreateConnectivityMutation,
} = connectivityApi;
