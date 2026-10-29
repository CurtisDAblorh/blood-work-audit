import { apiConfig } from "@/api/config";
import { useConfiguredQuery } from "@/api/useRemoteData";
import gatewayRoutes from "@/consts/gatewayRoutes";
import queryCacheKeys from "@/consts/queryCacheKeys";
import { formatAxiosError } from "@/lib/format";
import { QueryApiHook, ReviewResult } from "@/types";

type ResponseType = ReviewResult;

const errorCodeMap: Record<string, string> = {
    DEFAULT: "Could not load the review"
};

const useGetReview = (opts?: { enabled?: boolean }): QueryApiHook<ResponseType> => {
    const { enabled = true } = opts ?? {};

    const query = useConfiguredQuery<ResponseType>({
        getRequestConfig: () => ({
            url: gatewayRoutes.review.get
        }),
        queryOptions: {
            queryKey: [queryCacheKeys.review],
            // The saved review is loaded once at server startup, so it never changes while the app is open.
            staleTime: apiConfig.queryStaleTimes.default,
            enabled
        }
    });

    return {
        ...query,
        requestError: formatAxiosError(errorCodeMap, query.requestError)
    };
};

export { useGetReview };
