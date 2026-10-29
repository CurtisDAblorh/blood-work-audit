// Response contracts for the data in public/data. Dates arrive as ISO strings.

export interface ReviewWindow {
    start_inclusive: string;
    end_exclusive: string;
}

export interface Manifest {
    seed: number;
    panel_count: number;
    site_ids: string[];
    measurement_count: number;
    events_per_panel: number;
    start_date: string;
    end_date_exclusive: string;
    minimum_integrity_score: number;
    review_window: ReviewWindow;
    repeat_draw_rate_definition: string;
    panels_file_bytes: number;
}

export interface BloodMeasurement {
    measurement_id: string;
    test_name: string;
    value: number;
    unit: string;
}

export interface CollectionNote {
    note_id: string;
    author: string;
    text: string;
}

export interface ProcessingEvent {
    event_id: string;
    time: string;
    level: string;
    message: string;
}

export interface Panel {
    panel_id: string;
    site_id: string;
    patient_id: string;
    treatment_arm: string;
    collection_date: string;
    specimen_integrity_score: number;
    measurements: BloodMeasurement[];
    collection_note: CollectionNote | null;
    processing_events: ProcessingEvent[];
}

export interface SiteFinding {
    site_id: string;
    total_panels: number;
    repeat_draw_panels: number;
    repeat_draw_rate: number;
}

/** The exact record behind a claim: the panel itself, its collection note, or one processing event. */
export interface EvidenceRef {
    panel_id: string;
    source: "panel" | "collection_note" | "processing_event";
    /** The panel ID, note_id or event_id. */
    record_id: string;
}

/** One qualified statement about one site, with the records that support it. */
export interface ReviewFinding {
    site_id: string;
    statement: string;
    evidence: EvidenceRef[];
}

export interface ReviewAnswer {
    ranking: SiteFinding[];
    findings: ReviewFinding[];
}

// The saved review: the site ranking and the findings that cite panel records.
export interface ReviewResult {
    answer: ReviewAnswer;
}

export interface GetPanelByIdParams {
    panelId: string;
}

export interface PanelSummary {
    panel_id: string;
    site_id: string;
    patient_id: string;
    treatment_arm: string;
    collection_date: string;
    specimen_integrity_score: number;
}

export interface PanelSummaryPage {
    panels: PanelSummary[];
    total_panels: number;
}

export interface GetPanelsParams {
    siteId: string;
    /** Inclusive ISO date (yyyy-MM-dd). */
    start: string;
    /** Exclusive ISO date (yyyy-MM-dd). */
    end: string;
    offset: number;
    limit: number;
}
