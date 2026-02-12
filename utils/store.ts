import { activityApi } from '@/services/activity';
import { connectivityApi } from '@/services/connectivity';
import { expenseApi } from '@/services/expense';
import { mediaApi } from '@/services/media';
import { meetupApi } from '@/services/meetup';
import { membersApi } from '@/services/members-api';
import { profileApi } from '@/services/profile-api';
import { receiptApi } from '@/services/receipt-extractor';
import { routeContextApi } from '@/services/route-context';
import { routePointApi } from '@/services/route-point';
import { signinApi } from '@/services/signin';
import { signupApi } from '@/services/signup';
import { spothuntApi } from '@/services/spothunt';
import { storyApi } from '@/services/story';
import { configureStore } from '@reduxjs/toolkit';

export const AppStore = configureStore({
    reducer: {
        [receiptApi.reducerPath]: receiptApi.reducer,
        [signinApi.reducerPath]: signinApi.reducer,
        [signupApi.reducerPath]: signupApi.reducer,
        [meetupApi.reducerPath]: meetupApi.reducer,
        [activityApi.reducerPath]: activityApi.reducer,
        [expenseApi.reducerPath]: expenseApi.reducer,
        [mediaApi.reducerPath]: mediaApi.reducer,
        [connectivityApi.reducerPath]: connectivityApi.reducer,
        [storyApi.reducerPath]: storyApi.reducer,
        [spothuntApi.reducerPath]: spothuntApi.reducer,
        [routePointApi.reducerPath]: routePointApi.reducer,
        [routeContextApi.reducerPath]: routeContextApi.reducer,
        [profileApi.reducerPath]: profileApi.reducer,
        [membersApi.reducerPath]: membersApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            receiptApi.middleware, 
            signinApi.middleware, 
            signupApi.middleware,
            meetupApi.middleware,
            activityApi.middleware,
            expenseApi.middleware,
            mediaApi.middleware,
            connectivityApi.middleware,
            storyApi.middleware,
            spothuntApi.middleware,
            routePointApi.middleware,
            routeContextApi.middleware,
            profileApi.middleware,
            membersApi.middleware,
        ),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof AppStore.getState>

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof AppStore.dispatch