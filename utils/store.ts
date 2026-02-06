import { receiptApi } from '@/services/receipt-extractor-service';
import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
    reducer: {
        [receiptApi.reducerPath]: receiptApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(receiptApi.middleware),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch