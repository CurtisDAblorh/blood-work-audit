import { subDays } from "date-fns";
import { useState } from "react";

import { useGetManifest } from "@/api/manifest/useGetManifest";
import { type DateRange, DateRangeFilter } from "@/components/panels/dateRangeFilter";
import { PanelsDataTable } from "@/components/panels/panelsDataTable";
import { SiteMultiSelect } from "@/components/panels/siteMultiSelect";
import { RequestErrorAlert } from "@/components/requestErrorAlert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDisplayDate, parseApiDate, toApiDate, toExclusiveApiDate } from "@/lib/format";
import type { Manifest } from "@/types";

const INITIAL_SITE_COUNT = 3;

interface PanelExplorerProps {
    selectedPanelId: string | null;
    onSelectPanel: (panelId: string) => void;
}

const PanelExplorerCard = ({ manifest, selectedPanelId, onSelectPanel }: PanelExplorerProps & { manifest: Manifest }) => {
    // The manifest's end date is exclusive; the pickers work in inclusive days.
    const bounds: DateRange = {
        from: parseApiDate(manifest.start_date),
        to: subDays(parseApiDate(manifest.end_date_exclusive), 1)
    };

    const [range, setRange] = useState<DateRange>(bounds);
    const [selectedSites, setSelectedSites] = useState(() => manifest.site_ids.slice(0, INITIAL_SITE_COUNT));
    const [activeSite, setActiveSite] = useState<string | undefined>(selectedSites[0]);

    // Keep tabs in manifest order regardless of the order sites were picked in.
    const tabSites = manifest.site_ids.filter((siteId) => selectedSites.includes(siteId));
    const currentSite = activeSite && tabSites.includes(activeSite) ? activeSite : tabSites[0];

    const handleSitesChange = (next: string[]) => {
        // Jump to a newly added site so the pick has a visible effect.
        const added = next.find((siteId) => !selectedSites.includes(siteId));
        if (added) setActiveSite(added);
        setSelectedSites(next);
    };

    const start = toApiDate(range.from);
    const end = toExclusiveApiDate(range.to);

    return (
        <Card id="panels" className="scroll-mt-6 gap-0 rounded-[2rem] border-0 py-0 shadow-card ring-0">
            <CardHeader className="gap-2 px-6 pt-8 sm:px-10 sm:pt-10">
                <CardTitle className="text-3xl font-medium tracking-tight sm:text-4xl">Panels</CardTitle>
                <CardDescription className="max-w-2xl text-base">
                    {manifest.panel_count.toLocaleString()} panels across {manifest.site_ids.length} sites, collected{" "}
                    {formatDisplayDate(bounds.from)} – {formatDisplayDate(bounds.to)}. Select a row to open the full
                    panel record.
                </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-6 px-6 pt-8 pb-8 sm:px-10 sm:pb-10">
                <div className="flex flex-wrap items-center gap-2">
                    <SiteMultiSelect siteIds={manifest.site_ids} selected={selectedSites} onChange={handleSitesChange} />
                    <DateRangeFilter value={range} bounds={bounds} onChange={setRange} />
                </div>

                {currentSite ? (
                    <Tabs value={currentSite} onValueChange={setActiveSite} className="gap-4">
                        <div className="-mx-1 overflow-x-auto px-1 pb-1">
                            <TabsList className="h-10 rounded-xl bg-muted p-1">
                                {tabSites.map((siteId) => (
                                    <TabsTrigger key={siteId} value={siteId} className="rounded-lg px-3">
                                        {siteId}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        {tabSites.map((siteId) => (
                            <TabsContent key={siteId} value={siteId}>
                                <PanelsDataTable
                                    // Remount on a new period so paging restarts at page one.
                                    key={`${start}:${end}`}
                                    siteId={siteId}
                                    start={start}
                                    end={end}
                                    minimumIntegrityScore={manifest.minimum_integrity_score}
                                    selectedPanelId={selectedPanelId}
                                    onSelectPanel={onSelectPanel}
                                />
                            </TabsContent>
                        ))}
                    </Tabs>
                ) : (
                    <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-border text-muted-foreground">
                        Select at least one site to see its panels.
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const PanelExplorer = (props: PanelExplorerProps) => {
    const manifest = useGetManifest();

    if (manifest.isRequesting) {
        return <Skeleton role="status" aria-label="Loading panels" className="h-128 rounded-[2rem] bg-sand/60" />;
    }

    if (manifest.requestError || !manifest.responseData) {
        return <RequestErrorAlert message={manifest.requestError} isRetrying={manifest.isFetching} onRetry={manifest.refetch} />;
    }

    return <PanelExplorerCard manifest={manifest.responseData} {...props} />;
};

export { PanelExplorer };
