import { type CSSProperties, useCallback, useState } from "react";

import { BloodCellModel } from "@/components/brand/bloodCellModel";
import { SiteHeader } from "@/components/layout/siteHeader";
import { PanelDetailSidebar } from "@/components/panels/panelDetailSidebar";
import { PanelExplorer } from "@/components/panels/panelExplorer";
import { ReviewOverview } from "@/components/review/reviewOverview";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { EvidenceRef, PanelSelection } from "@/types";

export default function App() {
    const [selection, setSelection] = useState<PanelSelection | null>(null);
    const closePanel = useCallback(() => setSelection(null), []);
    const selectPanel = useCallback((panelId: string) => setSelection({ panelId }), []);
    // Evidence from a finding opens its panel focused on the exact record it cites.
    const selectEvidence = useCallback((ref: EvidenceRef) => setSelection({ panelId: ref.panel_id, focus: ref }), []);

    return (
        <SidebarProvider
            open={selection !== null}
            onOpenChange={(open) => {
                if (!open) closePanel();
            }}
            style={{ "--sidebar-width": "28rem" } as CSSProperties}>
            <SidebarInset className="min-w-0 bg-background">
                <div id="top" className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-8">
                    <SiteHeader />

                    <section className="pt-10 pb-14 sm:pt-16">
                        <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                                <p className="font-serif text-2xl text-muted-foreground italic">
                                    Trial-site specimen quality audit
                                </p>
                                <h1 className="mt-2 text-5xl font-medium tracking-tight sm:text-7xl">
                                    Blood Work Audit
                                </h1>
                            </div>
                            <BloodCellModel className="size-32 shrink-0 sm:size-56 lg:size-72" />
                        </div>
                    </section>

                    <div className="flex flex-col gap-10">
                        <ReviewOverview onSelectEvidence={selectEvidence} />
                        <PanelExplorer selectedPanelId={selection?.panelId ?? null} onSelectPanel={selectPanel} />
                    </div>
                </div>
            </SidebarInset>

            <PanelDetailSidebar selection={selection} onClose={closePanel} />
        </SidebarProvider>
    );
}
