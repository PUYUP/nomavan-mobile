import { membersApi } from '@/services/apis/members-api';
import { profileApi } from '@/services/apis/profile-api';
import { baseApi } from '@/services/base-api';
import { mediaApi } from '@/services/media';
import { receiptApi } from '@/services/receipt-extractor';
import { signinApi } from '@/services/signin';
import { signupApi } from '@/services/signup';
import { configureStore } from '@reduxjs/toolkit';

export const AppStore = configureStore({
    reducer: {
        [receiptApi.reducerPath]: receiptApi.reducer,
        [signinApi.reducerPath]: signinApi.reducer,
        [signupApi.reducerPath]: signupApi.reducer,
        [mediaApi.reducerPath]: mediaApi.reducer,
        [profileApi.reducerPath]: profileApi.reducer,
        [membersApi.reducerPath]: membersApi.reducer,
        [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            receiptApi.middleware, 
            signinApi.middleware, 
            signupApi.middleware,
            mediaApi.middleware,
            profileApi.middleware,
            membersApi.middleware,
            baseApi.middleware,
        ),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof AppStore.getState>

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof AppStore.dispatch