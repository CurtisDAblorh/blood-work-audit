import { keepPreviousData } from "@tanstack/react-query";

import { apiConfig } from "@/api/config";
import { useConfiguredQuery } from "@/api/useRemoteData";
import gatewayRoutes from "@/consts/gatewayRoutes";
import queryCacheKeys from "@/consts/queryCacheKeys";
import { formatAxiosError } from "@/lib/format";
import { GetPanelsParams, PanelSummaryPage, QueryApiHook } from "@/types";

type RequestType = GetPanelsParams;
type ResponseType = PanelSummaryPage;

const errorCodeMap: Record<string, string> = {
    422: "That date range is not valid",
    DEFAULT: "Could not load panels"
};

const useGetPanels = (params: RequestType, opts?: { enabled?: boolean }): QueryApiHook<ResponseType> => {
    const { enabled = true } = opts ?? {};

    const query = useConfiguredQuery<ResponseType>({
        getRequestConfig: () => ({
            url: gatewayRoutes.panel.list,
            params: {
                site_id: params.siteId,
                start: params.start,
                end: params.end,
                offset: params.offset,
                limit: params.limit
            }
        }),
        queryOptions: {
            queryKey: [queryCacheKeys.panelList, params],
            // Panels are immutable once the dataset is loaded.
            staleTime: apiConfig.queryStaleTimes.default,
            // Keep the current page on screen while the next one loads.
            placeholderData: keepPreviousData,
            enabled
        }
    });

    return {
        ...query,
        requestError: formatAxiosError(errorCodeMap, query.requestError)
    };
};

export { useGetPanels };
