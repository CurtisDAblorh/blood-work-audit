import type { AxiosError } from "axios";

import { formatAxiosError, getAxiosErrorCode, getAxiosErrorMessages } from "@/lib/format";

// Only the fields the helpers read; a real AxiosError carries much more.
const errorWith = (response?: { status: number; data: unknown }) => ({ response }) as AxiosError;

const codeMap = { 404: "Panel not found", DEFAULT: "Could not load the panel" };

describe("axios error formatting", () => {
    it("uses the hook's message for a mapped status and its default otherwise", () => {
        expect(formatAxiosError(codeMap, errorWith({ status: 404, data: { detail: "Unknown panel" } }))).toBe(
            "Panel not found"
        );
        expect(formatAxiosError(codeMap, errorWith({ status: 500, data: "boom" }))).toBe("Could not load the panel");
        expect(formatAxiosError(codeMap, null)).toBeUndefined();
    });

    it("has no code for a network failure, so callers can tell it from an HTTP error", () => {
        expect(getAxiosErrorCode(errorWith(undefined))).toBeUndefined();
        expect(formatAxiosError(codeMap, errorWith(undefined))).toBe("Could not load the panel");
        expect(getAxiosErrorCode(errorWith({ status: 422, data: {} }))).toBe("422");
    });

    it("reads the error detail as a string or a validation list, and ignores other bodies", () => {
        expect(getAxiosErrorMessages(errorWith({ status: 404, data: { detail: "Unknown panel: X" } }))).toEqual([
            "Unknown panel: X"
        ]);
        expect(
            getAxiosErrorMessages(
                errorWith({ status: 422, data: { detail: [{ msg: "Field required" }, { msg: "Too long" }] } })
            )
        ).toEqual(["Field required", "Too long"]);
        expect(getAxiosErrorMessages(errorWith({ status: 500, data: "<html>" }))).toEqual([]);
    });
});
