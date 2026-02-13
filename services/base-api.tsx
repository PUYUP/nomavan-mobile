import { getAuth } from '@/services/auth-storage';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
const rawBaseUrl = process.env.EXPO_PUBLIC_BP_API_BASE ?? '';
const baseUrl = rawBaseUrl.replace(/\/$/, '');

export const baseApi = createApi({
	reducerPath: 'baseApi',
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
	tagTypes: [
		'Activity', 
		'Expense', 
		'Connectivity', 
		'Meetup', 
		'Spothunt', 
		'Story', 
		'RouteContext',
		'RoutePoint',
	],
    endpoints: (builder) => ({}),
});