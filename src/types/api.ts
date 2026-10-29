type BaseApiHook<Res> = {
    responseData: Res | undefined;
    requestError: string | undefined;
    /** The HTTP status behind `requestError` (e.g. "404"), when there was a response. */
    requestErrorCode?: string;
    isRequesting: boolean;
    isSuccess: boolean;
};

export type QueryApiHook<Res> = BaseApiHook<Res> & {
    refetch?: () => void;
    isFetching: boolean;
};
