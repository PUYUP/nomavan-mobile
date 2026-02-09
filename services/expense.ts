import { getAuth } from '@/services/auth-storage';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface ExpensePayload {
    content: string
    status: 'publish'
    meta: {
        latitude: string
        longitude: string
        address: string
        store: string
        expense_items_inline: ExpenseItem[]
    }
}

export interface ExpenseItem {
    name: string
    quantity: string
    price: string
}

export interface ExpenseResponse {
    id: number
    content: string
    meta: {
        latitude?: string
        longitude?: string
        address?: string
        expense_items_inline?: ExpenseItem[]
    }
    date?: string
    user_id?: number
}

export interface ExpenseFilterArgs {
    context?: 'view' | 'edit'
    page?: number
    per_page?: number
    search?: string
    include?: number[]
    exclude?: number[]
    order?: 'asc' | 'desc'
    orderby?: 'date' | 'id' | 'include'
    user_id?: number
}

export type UpdateExpenseArgs = {
    id: number
    payload: ExpensePayload
}

export type DeleteExpenseArgs = {
    id: number
    force?: boolean
}

const rawBaseUrl = process.env.EXPO_PUBLIC_BP_API_BASE ?? '';
const baseUrl = rawBaseUrl.replace(/\/$/, '');

export const expenseApi = createApi({
    reducerPath: 'expenseApi',
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
    tagTypes: ['Expense'],
    endpoints: (builder) => ({
        getExpenses: builder.query<ExpenseResponse[], ExpenseFilterArgs | void>({
            query: (args) => ({
                url: '/wp/v2/expenses',
                method: 'GET',
                params: args ?? {},
            }),
            providesTags: (result) =>
                result
                    ? [
                        { type: 'Expense' as const, id: 'LIST' },
                        ...result.map((item) => ({ type: 'Expense' as const, id: item.id })),
                    ]
                    : [{ type: 'Expense' as const, id: 'LIST' }],
        }),
        getExpense: builder.query<ExpenseResponse, number>({
            query: (id) => ({
                url: `/wp/v2/expenses/${id}`,
                method: 'GET',
            }),
            providesTags: (_result, _error, id) => [{ type: 'Expense', id }],
        }),
        createExpense: builder.mutation<ExpenseResponse, ExpensePayload>({
            query: (body) => ({
                url: '/wp/v2/expenses',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'Expense', id: 'LIST' }],
        }),
        updateExpense: builder.mutation<ExpenseResponse, UpdateExpenseArgs>({
            query: ({ id, payload }) => ({
                url: `/wp/v2/expenses/${id}`,
                method: 'PUT',
                body: payload,
            }),
            invalidatesTags: (_result, _error, arg) => [
                { type: 'Expense', id: arg.id },
                { type: 'Expense', id: 'LIST' },
            ],
        }),
        deleteExpense: builder.mutation<{ deleted: boolean; previous?: ExpenseResponse }, DeleteExpenseArgs>({
            query: ({ id, force }) => ({
                url: `/wp/v2/expenses/${id}`,
                method: 'DELETE',
                params: force ? { force: true } : undefined,
            }),
            invalidatesTags: (_result, _error, arg) => [
                { type: 'Expense', id: arg.id },
                { type: 'Expense', id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useGetExpensesQuery,
    useGetExpenseQuery,
    useCreateExpenseMutation,
    useUpdateExpenseMutation,
    useDeleteExpenseMutation,
} = expenseApi;