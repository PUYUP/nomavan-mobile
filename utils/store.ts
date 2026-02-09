import { activityApi } from '@/services/activity';
import { connectivityApi } from '@/services/connectivity';
import { expenseApi } from '@/services/expense';
import { meetupApi } from '@/services/meetup';
import { receiptApi } from '@/services/receipt-extractor';
import { signinApi } from '@/services/signin';
import { signupApi } from '@/services/signup';
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
        [connectivityApi.reducerPath]: connectivityApi.reducer,
        [storyApi.reducerPath]: storyApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            receiptApi.middleware, 
            signinApi.middleware, 
            signupApi.middleware,
            meetupApi.middleware,
            activityApi.middleware,
            expenseApi.middleware,
            connectivityApi.middleware,
            storyApi.middleware,
        ),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof AppStore.getState>

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof AppStore.dispatch