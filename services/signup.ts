import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

type SignupProfileField = {
	field_id: number | string;
	value: string;
};

export type SignupPayload = {
	user_login: string;
	user_email: string;
	user_name?: string;
	password?: string;
	signup_field_data?: SignupProfileField[];
};

export type SignupResponse = {
	id: number;
	user_login: string;
	user_email: string;
	user_name?: string;
	activation_key?: string;
	registered?: string;
};

const rawBaseUrl = process.env.EXPO_PUBLIC_BP_API_BASE ?? '';
const baseUrl = rawBaseUrl.replace(/\/$/, '');

export const signupApi = createApi({
	reducerPath: 'signupApi',
	baseQuery: fetchBaseQuery({ baseUrl }),
	endpoints: (builder) => ({
		createSignup: builder.mutation<SignupResponse, SignupPayload>({
			query: (body) => ({
				url: '/buddypress/v1/signup',
				method: 'POST',
				body,
			}),
		}),
	}),
});

export const { useCreateSignupMutation } = signupApi;
