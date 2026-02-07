import { receiptApi } from '@/services/receipt-extractor';
import { signinApi } from '@/services/signin';
import { signupApi } from '@/services/signup';
import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
    reducer: {
        [receiptApi.reducerPath]: receiptApi.reducer,
        [signinApi.reducerPath]: signinApi.reducer,
        [signupApi.reducerPath]: signupApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(receiptApi.middleware, signinApi.middleware, signupApi.middleware),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch