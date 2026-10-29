import { AxiosError } from "axios";
import { z } from "zod";

// The API's error body: a string `detail`, or a list of messages for validation errors (422).
export const errorResponseSchema = z.object({
    detail: z.union([z.string(), z.array(z.object({ msg: z.string() }))])
});

export const DEFAULT_ERROR_MESSAGE = "Something went wrong";

/**
 * The code `formatAxiosError` looks its message map up by. API errors carry no code of their own,
 * so this is the HTTP status as a string (e.g. "404").
 *
 * `undefined` when there is no response (a network failure or an aborted request).
 */
function getAxiosErrorCode(errorResponse: AxiosError | null | undefined): string | undefined {
    const status = errorResponse?.response?.status;

    return status === undefined ? undefined : String(status);
}

/**
 * EVERY message the backend sent, in order — where `formatAxiosError` collapses the response to one
 * curated sentence, this keeps the API's own wording. Empty when the body is not an API error.
 */
function getAxiosErrorMessages(errorResponse: AxiosError | null | undefined): string[] {
    if (!errorResponse) return [];

    const validatedResponse = errorResponseSchema.safeParse(errorResponse.response?.data);
    if (!validatedResponse.success) return [];

    const { detail } = validatedResponse.data;

    return typeof detail === "string" ? [detail] : detail.map((e) => e.msg);
}

function formatAxiosError(errorCodeMap: Record<string, string>, errorResponse: AxiosError | null) {
    if (!errorResponse) return undefined;

    const code = getAxiosErrorCode(errorResponse);
    const mapped = code ? errorCodeMap[code] : undefined;

    if (mapped) {
        return mapped;
    }

    if (errorCodeMap.DEFAULT) {
        return errorCodeMap.DEFAULT;
    }

    return DEFAULT_ERROR_MESSAGE;
}

export { formatAxiosError, getAxiosErrorCode, getAxiosErrorMessages };
