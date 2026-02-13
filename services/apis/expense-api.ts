import { baseApi } from '../base-api';

export interface ExpensePayload {
    content: string
    status: 'publish'
    meta: {
        latitude: number
        longitude: number
        place_name: string
        store_name: string
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
        place_name?: string
        store_name: string
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

export const expenseApi = baseApi.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        createExpense: builder.mutation<ExpenseResponse, ExpensePayload>({
            query: (body) => ({
                url: '/wp/v2/expenses',
                method: 'POST',
                body,
            }),
            invalidatesTags: [
                { type: 'Expense', id: 'LIST' },
                { type: 'Activity', id: 'LIST' },
            ],
        }),
        updateExpense: builder.mutation<ExpenseResponse, UpdateExpenseArgs>({
            query: ({ id, payload }) => ({
                url: `/wp/v2/expenses/${id}`,
                method: 'PUT',
                body: payload,
            }),
            invalidatesTags: (_result, _error, arg) => [
                { type: 'Expense', id: arg.id },
                { type: 'Activity', id: 'LIST' },
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
                { type: 'Activity', id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useCreateExpenseMutation,
    useUpdateExpenseMutation,
    useDeleteExpenseMutation,
} = expenseApi;