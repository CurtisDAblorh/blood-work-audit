import { render, screen, waitFor } from "@testing-library/react";

import { useGetPanelById } from "@/api/panels/useGetPanelById";
import { PanelDetailSidebar } from "@/components/panels/panelDetailSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import type { Panel, PanelSelection } from "@/types";

// The sidebar's data hooks are replaced so the test controls what's loaded and when.
jest.mock("@/api/panels/useGetPanelById", () => ({ useGetPanelById: jest.fn() }));
jest.mock("@/api/manifest/useGetManifest", () => ({
    useGetManifest: () => ({ responseData: { minimum_integrity_score: 0.7 }, isRequesting: false, isFetching: false })
}));

const panel: Panel = {
    panel_id: "PANEL-0000012",
    site_id: "SITE-003",
    patient_id: "PATIENT-0000007",
    treatment_arm: "treatment-b",
    collection_date: "2026-05-12",
    specimen_integrity_score: 0.55,
    measurements: [],
    collection_note: { note_id: "PANEL-0000012-NOTE", author: "Collector 2", text: "Bench wait." },
    processing_events: [1, 2, 9].map((n) => ({
        event_id: `PANEL-0000012-EVT-000${n}`,
        time: "2026-05-12T00:00:00Z",
        level: n === 9 ? "warning" : "info",
        message: `Event ${n}`
    }))
};

const citedEvent: PanelSelection = {
    panelId: "PANEL-0000012",
    focus: { panel_id: "PANEL-0000012", source: "processing_event", record_id: "PANEL-0000012-EVT-0009" }
};

const hookResult = (data: Panel | undefined) => ({
    responseData: data,
    requestError: undefined,
    isRequesting: data === undefined,
    isFetching: data === undefined,
    isSuccess: data !== undefined
});

const renderSidebar = (selection: PanelSelection) =>
    render(
        <SidebarProvider open>
            <PanelDetailSidebar selection={selection} onClose={() => {}} />
        </SidebarProvider>
    );

describe("PanelDetailSidebar citation focus", () => {
    let scrolled: jest.SpyInstance;
    beforeEach(() => {
        scrolled = jest.spyOn(Element.prototype, "scrollIntoView");
    });
    afterEach(() => scrolled.mockRestore());

    it("opens the cited record's tab, highlights it and scrolls to it", async () => {
        jest.mocked(useGetPanelById).mockReturnValue(hookResult(panel));
        renderSidebar(citedEvent);

        expect(screen.getByRole("tab", { selected: true }).textContent).toContain("Processing events");
        await waitFor(() => expect(scrolled).toHaveBeenCalled());

        const target = scrolled.mock.contexts[0] as HTMLElement;
        expect(target.getAttribute("data-record-id")).toBe("PANEL-0000012-EVT-0009");
        expect(target.getAttribute("aria-current")).toBe("true");
        // Only the cited event is marked.
        expect(document.querySelectorAll('[aria-current="true"]')).toHaveLength(1);
    });

    it("still scrolls to the record when the panel finishes loading after the click", async () => {
        jest.mocked(useGetPanelById).mockReturnValue(hookResult(undefined));
        const { rerender } = renderSidebar(citedEvent);
        expect(scrolled).not.toHaveBeenCalled();

        jest.mocked(useGetPanelById).mockReturnValue(hookResult(panel));
        rerender(
            <SidebarProvider open>
                <PanelDetailSidebar selection={citedEvent} onClose={() => {}} />
            </SidebarProvider>
        );

        await waitFor(() => expect(scrolled).toHaveBeenCalledTimes(1));
        expect((scrolled.mock.contexts[0] as HTMLElement).getAttribute("data-record-id")).toBe(
            "PANEL-0000012-EVT-0009"
        );
    });
});
