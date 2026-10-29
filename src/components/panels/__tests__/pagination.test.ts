import { describePage } from "@/components/panels/pagination";

describe("describePage", () => {
    it("describes a full page, a partial last page and an exact multiple of the page size", () => {
        expect(describePage(0, 10, 13)).toEqual({ rangeLabel: "Showing 1–10 of 13 panels", pageLabel: "Page 1 of 2" });
        expect(describePage(1, 10, 13)).toEqual({ rangeLabel: "Showing 11–13 of 13 panels", pageLabel: "Page 2 of 2" });
        expect(describePage(1, 10, 20).pageLabel).toBe("Page 2 of 2");
    });

    it("says there are no panels rather than showing 1–0", () => {
        expect(describePage(0, 10, 0)).toEqual({ rangeLabel: "No panels", pageLabel: "Page 0 of 0" });
    });
});
