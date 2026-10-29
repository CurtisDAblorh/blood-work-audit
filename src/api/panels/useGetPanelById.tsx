import { apiConfig } from "@/api/config";
import { useConfiguredQuery } from "@/api/useRemoteData";
import gatewayRoutes from "@/consts/gatewayRoutes";
import queryCacheKeys from "@/consts/queryCacheKeys";
import { formatAxiosError } from "@/lib/format";
import { GetPanelByIdParams, Panel, QueryApiHook } from "@/types";

type RequestType = GetPanelByIdParams;
type ResponseType = Panel;

const errorCodeMap: Record<string, string> = {
    404: "Panel not found",
    DEFAULT: "Could not load the panel"
};

const useGetPanelById = (params: RequestType, opts?: { enabled?: boolean }): QueryApiHook<ResponseType> => {
    const { enabled = true } = opts ?? {};

    const query = useConfiguredQuery<ResponseType>({
        getRequestConfig: () => ({
            url: gatewayRoutes.panel.get(params.panelId)
        }),
        queryOptions: {
            queryKey: [queryCacheKeys.panel, params.panelId],
            // Panels are immutable once the dataset is loaded.
            staleTime: apiConfig.queryStaleTimes.default,
            enabled: enabled && params.panelId !== ""
        }
    });

    return {
        ...query,
        requestError: formatAxiosError(errorCodeMap, query.requestError)
    };
};

export { useGetPanelById };
