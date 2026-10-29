import { X } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { useGetManifest } from "@/api/manifest/useGetManifest";
import { useGetPanelById } from "@/api/panels/useGetPanelById";
import { IntegrityBadge } from "@/components/panels/integrityBadge";
import { RequestErrorAlert } from "@/components/requestErrorAlert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    useSidebar
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDisplayDate, formatDisplayDateTime, formatTreatmentArm } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { EvidenceRef, Panel, PanelSelection } from "@/types";

type SidebarTab = "overview" | "note" | "events";

/** Which tab holds each kind of cited record. */
const tabForSource: Record<EvidenceRef["source"], SidebarTab> = {
    panel: "overview",
    collection_note: "note",
    processing_event: "events"
};

/** Ring + tint for the record a finding cited, so it stands out once the sidebar scrolls to it. */
const citedStyles = "ring-2 ring-ink/70 ring-offset-2 ring-offset-sidebar";

const CitedLabel = () => (
    <span className="rounded-full bg-ink px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide text-ink-foreground uppercase">
        Cited
    </span>
);

const levelStyles: Record<string, string> = {
    ERROR: "border-destructive/30 bg-destructive/8 text-destructive",
    WARNING: "border-warning/30 bg-warning/10 text-warning",
    WARN: "border-warning/30 bg-warning/10 text-warning"
};

const Section = ({ title, children }: { title?: string; children: ReactNode }) => (
    <SidebarGroup className="px-6 py-4">
        {title && (
            <SidebarGroupLabel className="h-auto px-0 pb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {title}
            </SidebarGroupLabel>
        )}
        <SidebarGroupContent>{children}</SidebarGroupContent>
    </SidebarGroup>
);

const IntegrityMeter = ({ score, minimum, cited }: { score: number; minimum: number; cited?: string }) => {
    const belowThreshold = score < minimum;

    return (
        <div
            data-record-id={cited}
            aria-current={cited ? "true" : undefined}
            className={cn("rounded-2xl bg-card p-5 ring-1 ring-border", cited && citedStyles)}>
            {cited && (
                <div className="mb-3">
                    <CitedLabel />
                </div>
            )}
            <div className="flex items-end justify-between gap-4">
                <p className="text-5xl font-medium tracking-tight tabular-nums">{score.toFixed(2)}</p>
                <p className={cn("pb-1 text-sm font-medium", belowThreshold ? "text-destructive" : "text-success")}>
                    {belowThreshold ? "Below QC threshold" : "Meets QC threshold"}
                </p>
            </div>
            <div
                className="relative mt-4 h-2 rounded-full bg-muted"
                role="meter"
                aria-label="Specimen integrity"
                aria-valuemin={0}
                aria-valuemax={1}
                aria-valuenow={score}>
                <div
                    className={cn("h-full rounded-full", belowThreshold ? "bg-destructive" : "bg-success")}
                    style={{ width: `${score * 100}%` }}
                />
                <div
                    aria-hidden="true"
                    className="absolute -top-1 h-4 w-0.5 rounded-full bg-foreground"
                    style={{ left: `${minimum * 100}%` }}
                />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Threshold {minimum.toFixed(2)}</p>
        </div>
    );
};

const PanelDetails = ({ panel, minimum, focus }: { panel: Panel; minimum: number; focus?: EvidenceRef }) => (
    <>
        <TabsContent value="overview">
            <Section title="Integrity">
                <IntegrityMeter
                    score={panel.specimen_integrity_score}
                    minimum={minimum}
                    cited={focus?.source === "panel" && focus.record_id === panel.panel_id ? panel.panel_id : undefined}
                />
            </Section>

            <Section title="Details">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                    {[
                        ["Patient ID", <span className="font-mono">{panel.patient_id}</span>],
                        ["Site ID", panel.site_id],
                        ["Treatment arm", formatTreatmentArm(panel.treatment_arm)],
                        [
                            "Collected",
                            <time dateTime={panel.collection_date}>{formatDisplayDate(panel.collection_date)}</time>
                        ]
                    ].map(([label, value]) => (
                        <div key={label as string}>
                            <dt className="text-muted-foreground">{label}</dt>
                            <dd className="mt-0.5 font-medium">{value}</dd>
                        </div>
                    ))}
                </dl>
            </Section>

            <Section title={`Measurements (${panel.measurements.length})`}>
                {panel.measurements.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No measurements recorded.</p>
                ) : (
                    <ul className="divide-y divide-border overflow-hidden rounded-2xl bg-card ring-1 ring-border">
                        {panel.measurements.map((measurement) => (
                            <li
                                key={measurement.measurement_id}
                                className="flex items-baseline justify-between gap-3 px-4 py-3 text-sm">
                                <span>{measurement.test_name}</span>
                                <span className="font-medium tabular-nums">
                                    {measurement.value}
                                    <span className="ml-1 font-normal text-muted-foreground">{measurement.unit}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </Section>
        </TabsContent>

        <TabsContent value="note">
            <Section>
                {panel.collection_note ? (
                    <figure
                        data-record-id={panel.collection_note.note_id}
                        aria-current={focus?.record_id === panel.collection_note.note_id ? "true" : undefined}
                        className={cn(
                            "rounded-2xl bg-sand/70 p-5",
                            focus?.source === "collection_note" &&
                                focus.record_id === panel.collection_note.note_id &&
                                citedStyles
                        )}>
                        {focus?.source === "collection_note" && focus.record_id === panel.collection_note.note_id && (
                            <div className="mb-3">
                                <CitedLabel />
                            </div>
                        )}
                        <blockquote className="font-serif text-xl leading-snug italic">
                            “{panel.collection_note.text}”
                        </blockquote>
                        <figcaption className="mt-3 text-xs text-muted-foreground">
                            {panel.collection_note.author} ·{" "}
                            <span className="font-mono">{panel.collection_note.note_id}</span>
                        </figcaption>
                    </figure>
                ) : (
                    <p className="text-sm text-muted-foreground">No collection note.</p>
                )}
            </Section>
        </TabsContent>

        <TabsContent value="events">
            <Section title={`${panel.processing_events.length} events, in order`}>
                <ol className="relative ml-1.5 border-l border-border">
                    {panel.processing_events.map((event) => {
                        const isCited = focus?.source === "processing_event" && focus.record_id === event.event_id;

                        return (
                            <li key={event.event_id} className="relative pb-5 pl-5 last:pb-0">
                                <span
                                    aria-hidden="true"
                                    className={cn(
                                        "absolute top-1.5 -left-[5px] size-2.5 rounded-full ring-4 ring-sidebar",
                                        event.level.toUpperCase() === "ERROR"
                                            ? "bg-destructive"
                                            : event.level.toUpperCase().startsWith("WARN")
                                              ? "bg-warning"
                                              : "bg-foreground/40"
                                    )}
                                />
                                <div
                                    data-record-id={event.event_id}
                                    aria-current={isCited ? "true" : undefined}
                                    className={cn("rounded-lg", isCited && `-m-2 bg-sand/70 p-2 ${citedStyles}`)}>
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                        {isCited && <CitedLabel />}
                                        <time dateTime={event.time}>{formatDisplayDateTime(event.time)}</time>
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "h-5 px-1.5 text-[0.65rem] uppercase",
                                                levelStyles[event.level.toUpperCase()]
                                            )}>
                                            {event.level}
                                        </Badge>
                                    </div>
                                    <p className="mt-1 text-sm">{event.message}</p>
                                    <p className="mt-0.5 font-mono text-[0.7rem] text-muted-foreground">
                                        {event.event_id}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            </Section>
        </TabsContent>
    </>
);

interface PanelDetailSidebarProps {
    selection: PanelSelection | null;
    onClose: () => void;
}

const PanelDetailSidebar = ({ selection, onClose }: PanelDetailSidebarProps) => {
    const panelId = selection?.panelId ?? null;
    const focus = selection?.focus;
    const panel = useGetPanelById({ panelId: panelId ?? "" });
    const manifest = useGetManifest();
    const { isMobile, openMobile, setOpenMobile } = useSidebar();

    // Desktop open state is controlled by the provider; on mobile the sidebar is a sheet with its own state.
    useEffect(() => {
        if (isMobile) setOpenMobile(panelId !== null);
    }, [isMobile, panelId, setOpenMobile]);

    const wasOpenMobile = useRef(false);
    useEffect(() => {
        if (wasOpenMobile.current && !openMobile) onClose();
        wasOpenMobile.current = openMobile;
    }, [openMobile, onClose]);

    const [tab, setTab] = useState<SidebarTab>("overview");

    // A cited record picks its own tab. Each click makes a new selection object, so clicking the same
    // evidence again re-runs this and scrolls back to it.
    useEffect(() => {
        if (selection?.focus) setTab(tabForSource[selection.focus.source]);
    }, [selection]);

    const minimum = manifest.responseData?.minimum_integrity_score;
    const data = panel.responseData;

    // Once this selection's panel has loaded and the right tab is showing, bring the cited record into view.
    // scrolledFor remembers which selection was handled, so switching tabs by hand afterwards never jumps back.
    const scrolledFor = useRef<PanelSelection | null>(null);
    useEffect(() => {
        if (!selection?.focus || scrolledFor.current === selection) return;
        if (!data || data.panel_id !== selection.panelId || minimum === undefined) return;
        if (tab !== tabForSource[selection.focus.source]) return;

        const selector = `[data-record-id="${CSS.escape(selection.focus.record_id)}"]`;
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        // The newly selected tab (and, on mobile, the sheet) can mount a frame or two after this effect runs,
        // so keep looking for up to ~half a second rather than giving up on the first miss.
        let frame = 0;
        let handle = 0;
        const tryScroll = () => {
            const target = document.querySelector(selector);
            if (target) {
                // Only marked handled once it has actually scrolled, so an interrupted search can retry.
                scrolledFor.current = selection;
                target.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
            } else if (frame++ < 30) {
                handle = requestAnimationFrame(tryScroll);
            }
        };
        tryScroll();

        return () => cancelAnimationFrame(handle);
    }, [selection, data, minimum, tab]);

    return (
        <Sidebar side="right" collapsible="offcanvas" className="border-l border-sidebar-border">
            <Tabs
                value={tab}
                onValueChange={(value) => setTab(value as SidebarTab)}
                className="flex min-h-0 flex-1 flex-col gap-0">
                <SidebarHeader className="gap-3 border-b border-sidebar-border px-6 py-5">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="font-serif text-lg text-muted-foreground italic">Panel record</p>
                            <h2 className="font-mono text-xl font-medium tracking-tight">{panelId}</h2>
                        </div>
                        <Button variant="ghost" size="icon" aria-label="Close panel details" onClick={onClose}>
                            <X />
                        </Button>
                    </div>
                    {data && minimum !== undefined && (
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">{data.site_id}</Badge>
                            <Badge variant="outline">{formatTreatmentArm(data.treatment_arm)}</Badge>
                            <IntegrityBadge score={data.specimen_integrity_score} minimum={minimum} />
                        </div>
                    )}
                    <TabsList className="mt-1 grid h-9 w-full grid-cols-3 rounded-xl bg-muted p-1">
                        <TabsTrigger value="overview" className="rounded-lg text-xs sm:text-sm">
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="note" className="rounded-lg text-xs sm:text-sm">
                            <span className="md:hidden">Note</span>
                            <span className="hidden md:inline">Collection note</span>
                        </TabsTrigger>
                        <TabsTrigger value="events" className="rounded-lg text-xs sm:text-sm">
                            <span className="md:hidden">Events</span>
                            <span className="hidden md:inline">Processing events</span>
                        </TabsTrigger>
                    </TabsList>
                </SidebarHeader>

                <SidebarContent className="pb-6">
                    {panel.requestError ? (
                        <div className="p-6">
                            <RequestErrorAlert
                                message={panel.requestError}
                                isRetrying={panel.isFetching}
                                onRetry={panel.refetch}
                            />
                        </div>
                    ) : data && minimum !== undefined ? (
                        <PanelDetails panel={data} minimum={minimum} focus={focus} />
                    ) : panelId ? (
                        <div role="status" aria-label="Loading panel" className="flex flex-col gap-4 p-6">
                            <Skeleton className="h-32 rounded-2xl bg-muted" />
                            <Skeleton className="h-24 rounded-2xl bg-muted" />
                            <Skeleton className="h-48 rounded-2xl bg-muted" />
                        </div>
                    ) : null}
                </SidebarContent>
            </Tabs>
        </Sidebar>
    );
};

export { PanelDetailSidebar };
