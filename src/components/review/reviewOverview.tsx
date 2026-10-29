import { useState } from "react";

import { useGetReview } from "@/api/review/useGetReview";
import { RequestErrorAlert } from "@/components/requestErrorAlert";
import { FindingsCard } from "@/components/review/findingsCard";
import { ReviewCard } from "@/components/review/reviewCard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { EvidenceRef, ReviewAnswer } from "@/types";

interface RankingTableProps {
    ranking: ReviewAnswer["ranking"];
    selectedSite: string | undefined;
    onSelectSite: (siteId: string) => void;
}

// Clicking a row (or its site button, for keyboards) shows that site in the Findings card below.
const RankingTable = ({ ranking, selectedSite, onSelectSite }: RankingTableProps) => {
    if (ranking.length === 0) {
        return <p className="text-muted-foreground">No sites with panels in the review window.</p>;
    }

    // Bars are scaled to the highest rate so the ordering reads at a glance; the exact value sits beside each.
    const maxRate = Math.max(...ranking.map((site) => site.repeat_draw_rate), 0);

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b border-border text-xs tracking-wide text-muted-foreground uppercase">
                        <th scope="col" className="hidden w-12 pb-3 pl-4 font-medium sm:table-cell">
                            #
                        </th>
                        <th scope="col" className="pb-3 pl-3 font-medium sm:pl-0">
                            Site
                        </th>
                        <th scope="col" className="pb-3 text-right font-medium">
                            Panels
                        </th>
                        <th scope="col" className="pb-3 text-right font-medium">
                            Repeat<span className="hidden sm:inline"> draws</span>
                        </th>
                        <th scope="col" className="pb-3 pl-4 text-right font-medium sm:w-2/5 sm:pl-8 sm:text-left">
                            Rate<span className="hidden sm:inline"> of repeat draws</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {ranking.map((site, index) => {
                        const isSelected = site.site_id === selectedSite;

                        return (
                            <tr
                                key={site.site_id}
                                onClick={() => onSelectSite(site.site_id)}
                                className={cn(
                                    "cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-muted/50",
                                    isSelected && "bg-sand/50 hover:bg-sand/60"
                                )}>
                                <td
                                    className={cn(
                                        "hidden border-l-4 border-transparent py-4 pl-3 text-muted-foreground tabular-nums sm:table-cell",
                                        isSelected && "border-ink font-medium text-foreground"
                                    )}>
                                    {index + 1}
                                </td>
                                <th scope="row" className="py-4 pl-3 font-medium sm:pl-0">
                                    <button
                                        type="button"
                                        aria-pressed={isSelected}
                                        aria-controls="findings"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onSelectSite(site.site_id);
                                        }}
                                        className="rounded-sm text-left focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
                                        {site.site_id}
                                        <span className="sr-only">, show findings</span>
                                    </button>
                                </th>
                                <td className="py-4 text-right tabular-nums">{site.total_panels}</td>
                                <td className="py-4 text-right tabular-nums">{site.repeat_draw_panels}</td>
                                <td className="py-4 pl-4 sm:pl-8">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="hidden h-2 flex-1 rounded-full bg-muted sm:block"
                                            aria-hidden="true">
                                            <div
                                                className="h-full rounded-full bg-ink"
                                                style={{
                                                    width:
                                                        maxRate > 0 ? `${(site.repeat_draw_rate / maxRate) * 100}%` : 0
                                                }}
                                            />
                                        </div>
                                        <span className="ml-auto w-14 text-right font-medium tabular-nums">
                                            {(site.repeat_draw_rate * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

interface ReviewOverviewProps {
    onSelectEvidence: (ref: EvidenceRef) => void;
}

const ReviewOverview = ({ onSelectEvidence }: ReviewOverviewProps) => {
    const review = useGetReview();
    // Shared by the Ranking rows and the Findings tabs; falls back to the top-ranked site.
    const [selectedSite, setSelectedSite] = useState<string | undefined>();

    if (review.isRequesting) {
        return (
            <div role="status" aria-label="Loading review" className="flex flex-col gap-8">
                <Skeleton className="h-64 rounded-[2rem] bg-sand/60" />
                <Skeleton className="h-80 rounded-[2rem] bg-sand/60" />
            </div>
        );
    }

    if (review.requestError || !review.responseData) {
        return (
            <RequestErrorAlert message={review.requestError} isRetrying={review.isFetching} onRetry={review.refetch} />
        );
    }

    const { answer } = review.responseData;
    const currentSite = selectedSite ?? answer.ranking[0]?.site_id ?? answer.findings[0]?.site_id;

    return (
        <div className="flex flex-col gap-10">
            <ReviewCard
                id="ranking"
                title="Ranking"
                caption="Sites by repeat-draw rate in the review window. Select a site to see its findings.">
                <RankingTable ranking={answer.ranking} selectedSite={currentSite} onSelectSite={setSelectedSite} />
            </ReviewCard>

            <FindingsCard
                ranking={answer.ranking}
                findings={answer.findings}
                selectedSite={currentSite}
                onSelectSite={setSelectedSite}
                onSelectEvidence={onSelectEvidence}
            />
        </div>
    );
};

export { ReviewOverview };
