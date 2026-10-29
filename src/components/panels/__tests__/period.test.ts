import { getPeriodError } from "@/components/panels/period";

// The dataset covers 1–30 May 2026; the date filter must reject anything else with the right toast.
const bounds = { from: new Date(2026, 4, 1), to: new Date(2026, 4, 30) };
const day = (date: number) => new Date(2026, 4, date);

describe("getPeriodError", () => {
    it("allows any range inside the dataset, including its first and last day and a single day", () => {
        expect(getPeriodError(bounds, bounds)).toBeNull();
        expect(getPeriodError({ from: day(12), to: day(12) }, bounds)).toBeNull();
    });

    it("rejects a start date after the end date", () => {
        expect(getPeriodError({ from: day(20), to: day(10) }, bounds)?.title).toBe("Invalid period");
    });

    it("rejects dates outside the dataset on either side", () => {
        expect(getPeriodError({ from: new Date(2026, 3, 30), to: day(10) }, bounds)?.title).toBe(
            "Outside the dataset"
        );
        expect(getPeriodError({ from: day(10), to: new Date(2026, 4, 31) }, bounds)?.title).toBe(
            "Outside the dataset"
        );
    });
});
