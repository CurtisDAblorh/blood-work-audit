import { currentSiteTab, describeRecord, groupByPanel, orderSiteTabs } from "@/components/review/findingsHelpers";
import type { EvidenceRef, ReviewFinding, SiteFinding } from "@/types";

const ref = (panel_id: string, source: EvidenceRef["source"], record_id: string): EvidenceRef => ({
    panel_id,
    source,
    record_id
});

describe("evidence buttons", () => {
    it("labels each record by the sidebar tab it opens, with the event number from its ID", () => {
        expect(describeRecord(ref("PANEL-0000012", "processing_event", "PANEL-0000012-EVT-0009")).label).toBe(
            "Event 9"
        );
        expect(describeRecord(ref("PANEL-0000012", "processing_event", "odd-id")).label).toBe("odd-id");
        expect(describeRecord(ref("PANEL-0000012", "collection_note", "PANEL-0000012-NOTE")).label).toBe("Note");
        expect(describeRecord(ref("PANEL-0000012", "panel", "PANEL-0000012")).label).toBe("Overview");
    });

    it("groups records by panel in first-cited order, each panel once", () => {
        const groups = groupByPanel([
            ref("PANEL-0000020", "panel", "PANEL-0000020"),
            ref("PANEL-0000003", "collection_note", "PANEL-0000003-NOTE"),
            ref("PANEL-0000020", "collection_note", "PANEL-0000020-NOTE")
        ]);
        expect(groups.map(([panelId, refs]) => [panelId, refs.length])).toEqual([
            ["PANEL-0000020", 2],
            ["PANEL-0000003", 1]
        ]);
    });
});

describe("findings tabs", () => {
    const site = (site_id: string): SiteFinding => ({
        site_id,
        total_panels: 10,
        repeat_draw_panels: 1,
        repeat_draw_rate: 0.1
    });
    const finding = (site_id: string): ReviewFinding => ({ site_id, statement: "…", evidence: [] });

    it("orders ranked sites by rank, then sites only the findings mention, without repeats", () => {
        expect(
            orderSiteTabs(
                [site("SITE-002"), site("SITE-003")],
                [finding("SITE-005"), finding("SITE-002"), finding("SITE-005")]
            )
        ).toEqual(["SITE-002", "SITE-003", "SITE-005"]);
    });

    it("falls back to the first tab when the selected site no longer has one", () => {
        const tabs = ["SITE-002", "SITE-003"];
        expect(currentSiteTab(tabs, "SITE-003")).toBe("SITE-003");
        expect(currentSiteTab(tabs, "SITE-009")).toBe("SITE-002");
        expect(currentSiteTab(tabs, undefined)).toBe("SITE-002");
    });
});
