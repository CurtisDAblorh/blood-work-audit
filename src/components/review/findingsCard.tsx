import { ArrowUpRight } from "lucide-react";
import { Tabs as TabsPrimitive } from "radix-ui";

import { useGetPanelById } from "@/api/panels/useGetPanelById";
import {
  currentSiteTab,
  describeRecord,
  groupByPanel,
  orderSiteTabs,
} from "@/components/review/findingsHelpers";
import { ReviewCard } from "@/components/review/reviewCard";
import { cn } from "@/lib/utils";
import type { EvidenceRef, ReviewFinding, SiteFinding } from "@/types";

// One pill per cited panel; each record inside it is its own button that opens the sidebar on that record.
const EvidenceGroup = ({
  panelId,
  findingSiteId,
  refs,
  onSelect,
}: {
  panelId: string;
  findingSiteId: string;
  refs: EvidenceRef[];
  onSelect: (ref: EvidenceRef) => void;
}) => {
  // The citation doesn't carry the panel's site, so look the panel up (cached and shared with the
  // sidebar) and flag evidence from another site before the reviewer clicks into it.
  const panel = useGetPanelById({ panelId });
  const otherSite =
    panel.responseData && panel.responseData.site_id !== findingSiteId
      ? panel.responseData.site_id
      : undefined;

  return (
    <span className="inline-flex flex-wrap items-center gap-1 rounded-full bg-background py-1 pr-1 pl-3.5 ring-1 ring-foreground/10">
      {otherSite && (
        <span
          title={`Comparison panel from ${otherSite}, not ${findingSiteId}`}
          className="rounded-full bg-sand px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide uppercase"
        >
          {otherSite}
        </span>
      )}
      <span className="mr-1 font-mono text-xs">{panelId}</span>
      {refs.map((ref) => {
        const { label, Icon } = describeRecord(ref);

        return (
          <button
            key={`${ref.source}:${ref.record_id}`}
            type="button"
            onClick={() => onSelect(ref)}
            aria-label={`Open ${label.toLowerCase()} on ${panelId}`}
            className="group inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium transition-colors hover:bg-ink hover:text-ink-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <Icon
              className="size-3.5 text-muted-foreground transition-colors group-hover:text-ink-foreground"
              aria-hidden="true"
            />
            {label}
            <ArrowUpRight
              className="size-3 text-muted-foreground transition-colors group-hover:text-ink-foreground"
              aria-hidden="true"
            />
          </button>
        );
      })}
    </span>
  );
};

interface FindingsDocumentProps {
  site: SiteFinding | undefined;
  rank: number | undefined;
  findings: ReviewFinding[];
  onSelectEvidence: (ref: EvidenceRef) => void;
}

// The "page" under the selected tab: a white sheet with a folded top-right corner.
const FindingsDocument = ({
  site,
  rank,
  findings,
  onSelectEvidence,
}: FindingsDocumentProps) => (
  <div className="relative rounded-2xl rounded-tl-none bg-card p-6 shadow-card sm:p-8">
    <span
      aria-hidden="true"
      className="absolute top-0 right-0 size-7 rounded-bl-lg bg-linear-to-bl from-sand from-50% to-[#ddd3c5] to-50%"
    />

    {site && (
      <p className="pr-8 text-sm text-muted-foreground">
        {rank !== undefined && (
          <span className="font-medium text-foreground">Rank {rank} · </span>
        )}
        {site.repeat_draw_panels} of {site.total_panels} panels flagged for a
        repeat draw ({(site.repeat_draw_rate * 100).toFixed(1)}%)
      </p>
    )}

    {findings.length === 0 ? (
      <p className="mt-6 text-muted-foreground">
        No findings were recorded for this site.
      </p>
    ) : (
      <ol className="mt-6 flex flex-col divide-y divide-border">
        {findings.map((finding, index) => (
          <li key={index} className="py-5 first:pt-0 last:pb-0">
            {/* Sans eyebrow label, so finding order never reads like the serif rank on the tabs. */}
            <p
              aria-hidden="true"
              className="mb-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase"
            >
              Finding {index + 1}
            </p>
            <div className="min-w-0">
              <p className="max-w-[75ch] text-base leading-7 text-foreground/90 sm:text-lg sm:leading-8">
                {finding.statement}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Evidence
                </span>
                {finding.evidence.length === 0 ? (
                  <span className="text-sm text-muted-foreground">
                    No records cited
                  </span>
                ) : (
                  groupByPanel(finding.evidence).map(([panelId, refs]) => (
                    <EvidenceGroup
                      key={panelId}
                      panelId={panelId}
                      findingSiteId={finding.site_id}
                      refs={refs}
                      onSelect={onSelectEvidence}
                    />
                  ))
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    )}
  </div>
);

interface FindingsCardProps {
  ranking: SiteFinding[];
  findings: ReviewFinding[];
  selectedSite: string | undefined;
  onSelectSite: (siteId: string) => void;
  onSelectEvidence: (ref: EvidenceRef) => void;
}

// Per-site findings behind folder-style tabs, ordered by rank. The selected tab joins the sheet below it and
// carries an ink tag on top; picking a row in the Ranking table selects the same tab.
const FindingsCard = ({
  ranking,
  findings,
  selectedSite,
  onSelectSite,
  onSelectEvidence,
}: FindingsCardProps) => {
  // Ranked sites first in rank order, then any site the findings mention that the ranking does not.
  const siteIds = orderSiteTabs(ranking, findings);
  const current = currentSiteTab(siteIds, selectedSite);

  return (
    <ReviewCard
      id="findings"
      title="Findings"
      caption="Possible contributing factors, not established causes. Each finding lists the panels behind it."
      tone="sand"
    >
      {current === undefined ? (
        <p className="text-muted-foreground">No findings in this review.</p>
      ) : (
        <TabsPrimitive.Root value={current} onValueChange={onSelectSite}>
          <div className="-mx-1 overflow-x-auto px-1 pt-1">
            <TabsPrimitive.List
              aria-label="Sites"
              className="flex items-end gap-1.5"
            >
              {siteIds.map((siteId) => {
                const rank = ranking.findIndex(
                  (site) => site.site_id === siteId,
                );
                const count = findings.filter(
                  (finding) => finding.site_id === siteId,
                ).length;

                return (
                  <TabsPrimitive.Trigger
                    key={siteId}
                    value={siteId}
                    className={cn(
                      "group/tab relative flex shrink-0 items-center gap-2 rounded-t-xl px-4 pt-3 pb-2.5 text-sm whitespace-nowrap transition-colors",
                      "bg-foreground/6 text-muted-foreground hover:bg-foreground/10 hover:text-foreground",
                      "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                      "data-[state=active]:bg-card data-[state=active]:pb-3.5 data-[state=active]:font-medium data-[state=active]:text-foreground",
                    )}
                  >
                    {/* The tag: an ink strip clipped to the top of the selected tab. */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-3 top-0 hidden h-1 rounded-b-full bg-ink group-data-[state=active]/tab:block"
                    />
                    {rank >= 0 && (
                      <span className="font-serif text-base text-foreground/45 italic">
                        <span className="sr-only">Rank </span>#{rank + 1}
                        <span className="sr-only">, </span>
                      </span>
                    )}
                    {siteId}
                    <span className="sr-only">, </span>
                    {/* Notification-style count of findings for this site. */}
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[0.7rem] leading-none font-semibold text-white tabular-nums shadow-sm">
                      {count}
                      <span className="sr-only">
                        {count === 1 ? " finding" : " findings"}
                      </span>
                    </span>
                  </TabsPrimitive.Trigger>
                );
              })}
            </TabsPrimitive.List>
          </div>

          {siteIds.map((siteId) => {
            const rank = ranking.findIndex((site) => site.site_id === siteId);

            return (
              <TabsPrimitive.Content
                key={siteId}
                value={siteId}
                className="focus-visible:outline-none"
              >
                <FindingsDocument
                  site={ranking[rank]}
                  rank={rank >= 0 ? rank + 1 : undefined}
                  findings={findings.filter(
                    (finding) => finding.site_id === siteId,
                  )}
                  onSelectEvidence={onSelectEvidence}
                />
              </TabsPrimitive.Content>
            );
          })}
        </TabsPrimitive.Root>
      )}
    </ReviewCard>
  );
};

export { FindingsCard };
