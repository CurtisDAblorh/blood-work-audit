import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import axios, { AxiosError, type AxiosRequestConfig } from "axios";

import globalConfig from "@/config";
import { getAxiosErrorCode } from "@/lib/format";

const getUrl = (isGatewayRequest: boolean, url?: string) => {
    return isGatewayRequest ? `${globalConfig.urls.gateway.general}${url}` : url;
};

interface BaseOptions {
    headers?: Record<string, string>;
    isGatewayRequest?: boolean;
}

type useConfiguredQueryOptions<TResponse> = BaseOptions & {
    getRequestConfig: () => AxiosRequestConfig;
    queryOptions?: Omit<Partial<UseQueryOptions<TResponse, AxiosError>>, "queryFn">;
    useCookie?: boolean;
};

export const useConfiguredQuery = <TResponse>(options: useConfiguredQueryOptions<TResponse>) => {
    const { getRequestConfig, queryOptions, headers = {}, isGatewayRequest = true, useCookie = false } = options;

    const query = useQuery<TResponse, AxiosError>({
        queryKey: queryOptions?.queryKey ?? ["remoteData", getRequestConfig()],
        queryFn: async ({ signal }) => {
            const config = getRequestConfig();

            const response = await axios.request<TResponse>({
                ...config,
                method: config.method ?? "GET",
                headers: { ...config.headers, ...headers },
                url: getUrl(isGatewayRequest, config.url),
                withCredentials: useCookie,
                signal
            });

            return response.data;
        },
        retry: false,
        enabled: true,
        ...queryOptions
    });

    const refetch = () => {
        void query.refetch();
    };

    return {
        refetch,
        isRequesting: query.isLoading,
        isFetching: query.isFetching,
        isSuccess: query.isSuccess,
        responseData: query.data,
        requestError: query.error,
        requestErrorCode: getAxiosErrorCode(query.error)
    };
};
