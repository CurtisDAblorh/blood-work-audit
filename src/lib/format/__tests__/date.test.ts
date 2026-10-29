import { formatDisplayDate, formatDisplayDateTime, parseApiDate, toExclusiveApiDate } from "@/lib/format";

// Jest runs in America/Los_Angeles (see jest.config.cjs), behind UTC, so a helper that parsed
// "2026-05-01" as UTC midnight would show 30 April here and fail.
describe("date helpers", () => {
    it("keeps API dates on the same calendar day in a timezone behind UTC", () => {
        expect(formatDisplayDate("2026-05-01")).toBe("1 May 2026");
        expect(parseApiDate("2026-05-01").getDate()).toBe(1);
    });

    it("turns an inclusive last day into the API's exclusive end, across month ends", () => {
        expect(toExclusiveApiDate(new Date(2026, 4, 31))).toBe("2026-06-01");
    });

    it("shows event times in UTC whatever the viewer's timezone", () => {
        expect(formatDisplayDateTime("2026-05-20T00:00:15Z")).toBe("20 May 2026, 00:00:15 UTC");
    });
});
