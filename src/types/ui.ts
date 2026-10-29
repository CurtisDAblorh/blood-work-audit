import type { EvidenceRef } from "./models";

/** What the panel sidebar shows: a panel, optionally focused on one cited record inside it. */
export interface PanelSelection {
    panelId: string;
    focus?: EvidenceRef;
}
