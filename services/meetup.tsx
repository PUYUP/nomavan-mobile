import { getAuth } from '@/services/auth-storage';
import { BPGroup } from '@/utils/interfaces';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type MeetupType = 'meetup';
export type MeetupStatus = 'public' | 'private';
export type InviteStatus = 'members' | 'mods' | 'admins';

export type MeetupPayload = {
	name: string;
    description: string;
    types: MeetupType;
    status: MeetupStatus;
    invite_status: InviteStatus;
    latitude: number;
    longitude: number;
    address: string;
    capacity: number;
    coverage_radius: number;
    start_at: string;
    end_at: string;
};

export interface MeetupResponse extends BPGroup {
	latitude: string;
    longitude: string;
    address: string;
    start_at: string;
    end_at: string;
    capacity: string;
    coverage_radius: string;
};

export interface JoinPayload {
    context: 'edit';
    group_id: number;
}

export interface LeavePayload {
    context: 'edit';
    group_id: number;
    user_id: number;
}

const rawBaseUrl = process.env.EXPO_PUBLIC_BP_API_BASE ?? '';
const baseUrl = rawBaseUrl.replace(/\/$/, '');

export const meetupApi = createApi({
	reducerPath: 'meetupApi',
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
		createMeetup: builder.mutation<MeetupResponse, MeetupPayload>({
			query: (body) => ({
				url: '/buddypress/v1/groups',
				method: 'POST',
				body: {
                    ...body,
                    types: 'meetup',
                }
			}),
		}),
        // for public meetup
        joinMeetup: builder.mutation<MeetupResponse, JoinPayload>({
			query: (body) => ({
				url: '/buddypress/v1/groups/' + body.group_id + '/members',
				method: 'POST',
				body: {
                    ...body,
                }
			}),
		}),
        leaveMeetup: builder.mutation<MeetupResponse, LeavePayload>({
			query: (body) => {
                return {
                    url: '/buddypress/v1/groups/' + body.group_id + '/members/' + body.user_id,
                    method: 'DELETE',
                    body: {
                        ...body,
                    }
                }
			},
		}),
	}),
});

export const { useCreateMeetupMutation, useJoinMeetupMutation, useLeaveMeetupMutation } = meetupApi;
