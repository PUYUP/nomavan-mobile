import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type SigninPayload = {
	username: string;
	password: string;
};

export type SigninResponse = {
	token: string;
    user_id: string;
	user_email: string;
	user_nicename: string;
	user_display_name: string;
};

const rawBaseUrl = process.env.EXPO_PUBLIC_BP_API_BASE ?? '';
const baseUrl = rawBaseUrl.replace(/\/$/, '');

export const signinApi = createApi({
	reducerPath: 'signinApi',
	baseQuery: fetchBaseQuery({ baseUrl }),
	endpoints: (builder) => ({
		createSignin: builder.mutation<SigninResponse, SigninPayload>({
			query: (body) => ({
				url: '/jwt-auth/v1/token',
				method: 'POST',
				body,
			}),
		}),
	}),
});

export const { useCreateSigninMutation } = signinApi;
