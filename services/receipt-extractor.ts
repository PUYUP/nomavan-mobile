import { supabase } from '@/utils/supabase';
import { Block } from '@infinitered/react-native-mlkit-text-recognition';
import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';

export const receiptApi = createApi({
    baseQuery: fakeBaseQuery(),
    tagTypes: ['receipt'],
    endpoints: (builder) => ({
        getItems: builder.mutation<any, { blocks: Block[] }>({
            invalidatesTags: ['receipt'],
            async queryFn({ blocks }) {
                const { data, error } = await supabase.functions.invoke('receipt-extractor-gpt4', {
                    body: {
                        blocks: blocks,
                    }
                });

                if (error) {
                    return { error };
                }

                return { data };
            }
        }),
    })
});

// Export the auto-generated hooks
export const { useGetItemsMutation } = receiptApi;