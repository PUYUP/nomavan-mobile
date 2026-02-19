import { getAuth, logout } from '@/services/auth-storage';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
const rawBaseUrl = process.env.EXPO_PUBLIC_BP_API_BASE ?? '';
const baseUrl = rawBaseUrl.replace(/\/$/, '');

const baseQuery = fetchBaseQuery({
	baseUrl,
	prepareHeaders: async (headers) => {
		const auth = await getAuth();
		if (auth?.token) {
			headers.set('Authorization', `Bearer ${auth.token}`);
		}
		return headers;
	},
});

const baseQueryWithAuthCheck = async (args: any, api: any, extraOptions: any) => {
	const result = await baseQuery(args, api, extraOptions);
	
	// Check if response status is 403 (Forbidden - invalid token)
	if (result.error && result.error.status === 403) {
		// Token is invalid, logout user
		await logout();
	}
	
	return result;
};

export const baseApi = createApi({
	reducerPath: 'baseApi',
	baseQuery: baseQueryWithAuthCheck,
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