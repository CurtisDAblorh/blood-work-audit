// Turns the raw scale dataset in source-data/ into the static files the site serves from public/data/:
//   manifest.json                copied as-is
//   review.json                  the ranking and findings
//   summaries.json               one row per panel (what the panel table shows), sorted by date then ID
//   panels/<SITE>.json           full panels for one site, fetched only when a panel is opened
// Run with: npm run data
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const read = (f) => JSON.parse(readFileSync(new URL(`../source-data/${f}`, import.meta.url), "utf8"));
const out = (f) => new URL(`../public/data/${f}`, import.meta.url);

const manifest = read("manifest.json");
const review = read("review.json");
const panels = read("panels.json");

rmSync(out(""), { recursive: true, force: true });
mkdirSync(out("panels"), { recursive: true });

writeFileSync(out("manifest.json"), JSON.stringify(manifest));
// only the ranking and findings are displayed
writeFileSync(out("review.json"), JSON.stringify({ answer: review.answer }));

// Same fields and order as the API's PanelSummary rows (date, then ID) so paging is stable.
const summaries = panels
    .map(({ panel_id, site_id, patient_id, treatment_arm, collection_date, specimen_integrity_score }) =>
        ({ panel_id, site_id, patient_id, treatment_arm, collection_date, specimen_integrity_score }))
    .sort((a, b) => a.collection_date.localeCompare(b.collection_date) || a.panel_id.localeCompare(b.panel_id));
writeFileSync(out("summaries.json"), JSON.stringify(summaries));

const bySite = new Map();
for (const p of panels) {
    if (!bySite.has(p.site_id)) bySite.set(p.site_id, []);
    bySite.get(p.site_id).push(p);
}
for (const [site, list] of bySite) writeFileSync(out(`panels/${site}.json`), JSON.stringify(list));

// Every record the review cites must exist, or its citation would open "Panel not found" or point at nothing.
// Same rules as PanelDataset.has_record: a panel, its collection note, or one of its processing events.
const byId = new Map(panels.map((p) => [p.panel_id, p]));
const hasRecord = (ref) => {
    const p = byId.get(ref.panel_id);
    if (!p) return false;
    if (ref.source === "panel") return ref.record_id === p.panel_id;
    if (ref.source === "collection_note") return p.collection_note?.note_id === ref.record_id;
    return p.processing_events.some((e) => e.event_id === ref.record_id);
};
const refs = review.answer.findings.flatMap((f) => f.evidence);
const bad = refs.filter((r) => !hasRecord(r));
if (bad.length) throw new Error(`review cites ${bad.length} record(s) not in the dataset, e.g. ${bad[0].panel_id} ${bad[0].record_id}`);
const cited = new Set(refs.map((r) => r.panel_id));

console.log(`${panels.length} panels across ${bySite.size} sites; review cites ${refs.length} records on ${cited.size} panels, all present`);
