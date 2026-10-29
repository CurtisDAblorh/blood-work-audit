import { Activity, Gauge, NotebookPen } from "lucide-react";

import type { EvidenceRef, ReviewFinding, SiteFinding } from "@/types";

/** Short label and icon for a cited record, named after the sidebar tab it opens. */
export const describeRecord = (ref: EvidenceRef) => {
  if (ref.source === "collection_note")
    return { label: "Note", Icon: NotebookPen };
  if (ref.source === "processing_event") {
    // Event IDs end in -EVT-0001; show "Event 1" and fall back to the raw ID if the format ever changes.
    const number = /-EVT-(\d+)$/.exec(ref.record_id)?.[1];
    return {
      label: number ? `Event ${Number(number)}` : ref.record_id,
      Icon: Activity,
    };
  }
  return { label: "Overview", Icon: Gauge };
};

/** Group a finding's records by panel, keeping first-cited order, so each panel ID shows once. */
export const groupByPanel = (evidence: EvidenceRef[]) => {
  const groups = new Map<string, EvidenceRef[]>();
  for (const ref of evidence)
    groups.set(ref.panel_id, [...(groups.get(ref.panel_id) ?? []), ref]);
  return [...groups];
};

/** Findings tabs: ranked sites first in rank order, then any site only the findings mention, no repeats. */
export const orderSiteTabs = (
  ranking: SiteFinding[],
  findings: ReviewFinding[],
) =>
  [
    ...ranking.map((site) => site.site_id),
    ...findings
      .map((finding) => finding.site_id)
      .filter((id) => !ranking.some((site) => site.site_id === id)),
  ].filter((id, index, all) => all.indexOf(id) === index);

/** The tab to show: the selected site if it still has a tab, otherwise the first tab. */
export const currentSiteTab = (
  siteIds: string[],
  selectedSite: string | undefined,
) =>
  selectedSite && siteIds.includes(selectedSite) ? selectedSite : siteIds[0];
