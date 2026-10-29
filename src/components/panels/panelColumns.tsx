import type { ColumnDef } from "@tanstack/react-table";

import { IntegrityBadge } from "@/components/panels/integrityBadge";
import { formatDisplayDate, formatTreatmentArm } from "@/lib/format";
import type { PanelSummary } from "@/types";

const getPanelColumns = (minimumIntegrityScore: number): ColumnDef<PanelSummary>[] => [
    {
        accessorKey: "panel_id",
        header: "Panel ID",
        cell: ({ row }) => <span className="font-mono text-[0.8rem] font-medium">{row.original.panel_id}</span>
    },
    {
        accessorKey: "site_id",
        header: "Site ID",
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.site_id}</span>
    },
    {
        accessorKey: "patient_id",
        header: "Patient ID",
        cell: ({ row }) => <span className="font-mono text-[0.8rem] text-muted-foreground">{row.original.patient_id}</span>
    },
    {
        accessorKey: "treatment_arm",
        header: "Treatment arm",
        cell: ({ row }) => formatTreatmentArm(row.original.treatment_arm)
    },
    {
        accessorKey: "collection_date",
        header: "Collected",
        cell: ({ row }) => (
            <time dateTime={row.original.collection_date}>{formatDisplayDate(row.original.collection_date)}</time>
        )
    },
    {
        accessorKey: "specimen_integrity_score",
        header: () => <span className="block text-right">Integrity</span>,
        cell: ({ row }) => (
            <div className="text-right">
                <IntegrityBadge score={row.original.specimen_integrity_score} minimum={minimumIntegrityScore} />
            </div>
        )
    }
];

export { getPanelColumns };
