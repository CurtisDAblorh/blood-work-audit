import { apiConfig } from "@/api/config";
import { useConfiguredQuery } from "@/api/useRemoteData";
import gatewayRoutes from "@/consts/gatewayRoutes";
import queryCacheKeys from "@/consts/queryCacheKeys";
import { formatAxiosError } from "@/lib/format";
import { Manifest, QueryApiHook } from "@/types";

type ResponseType = Manifest;

const errorCodeMap: Record<string, string> = {
    DEFAULT: "Could not load the dataset manifest"
};

const useGetManifest = (opts?: { enabled?: boolean }): QueryApiHook<ResponseType> => {
    const { enabled = true } = opts ?? {};

    const query = useConfiguredQuery<ResponseType>({
        getRequestConfig: () => ({
            url: gatewayRoutes.manifest.get
        }),
        queryOptions: {
            queryKey: [queryCacheKeys.manifest],
            // The dataset is loaded once at server startup, so it never changes while the app is open.
            staleTime: apiConfig.queryStaleTimes.default,
            enabled
        }
    });

    return {
        ...query,
        requestError: formatAxiosError(errorCodeMap, query.requestError)
    };
};

export { useGetManifest };
