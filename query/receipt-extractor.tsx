import { supabase } from "@/utils/supabase";
import { useQuery } from "@tanstack/react-query";

export const receiptExtractorKey = ['receipt-extractor'] as const;

export const fetchReceiptFn = async (blocks: any) => {
    if (!blocks || blocks.length === 0) {
        return null;
    }

    const { data, error } = await supabase.functions.invoke('receipt-extractor-gpt4', {
        body: { blocks },
    });

    if (error) {
        throw error;
    }

    return data?.result ?? null;
};

export const useReceiptExtractorData = (blocks?: any) => {
    return useQuery({
        queryKey: receiptExtractorKey,
        queryFn: () => fetchReceiptFn(blocks),
        enabled: false,
        gcTime: 0,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });
};