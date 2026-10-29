import { flexRender, getCoreRowModel, type PaginationState, useReactTable } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { useGetPanels } from "@/api/panels/useGetPanels";
import { describePage } from "@/components/panels/pagination";
import { getPanelColumns } from "@/components/panels/panelColumns";
import { RequestErrorAlert } from "@/components/requestErrorAlert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

interface PanelsDataTableProps {
    siteId: string;
    /** Inclusive ISO start date. */
    start: string;
    /** Exclusive ISO end date. */
    end: string;
    minimumIntegrityScore: number;
    selectedPanelId: string | null;
    onSelectPanel: (panelId: string) => void;
}

// One site's panels for the chosen period. Paging happens server-side: the scale dataset has 10,000 panels.
const PanelsDataTable = ({
    siteId,
    start,
    end,
    minimumIntegrityScore,
    selectedPanelId,
    onSelectPanel
}: PanelsDataTableProps) => {
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: PAGE_SIZE });

    const panels = useGetPanels({
        siteId,
        start,
        end,
        offset: pagination.pageIndex * pagination.pageSize,
        limit: pagination.pageSize
    });

    const columns = useMemo(() => getPanelColumns(minimumIntegrityScore), [minimumIntegrityScore]);
    const total = panels.responseData?.total_panels ?? 0;

    const table = useReactTable({
        data: panels.responseData?.panels ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => row.panel_id,
        manualPagination: true,
        rowCount: total,
        state: { pagination },
        onPaginationChange: setPagination
    });

    if (panels.requestError) {
        return <RequestErrorAlert message={panels.requestError} isRetrying={panels.isFetching} onRetry={panels.refetch} />;
    }

    const { rangeLabel, pageLabel } = describePage(pagination.pageIndex, pagination.pageSize, total);
    const isPaging = panels.isFetching && !panels.isRequesting;

    return (
        <div className="flex flex-col gap-4">
            <div
                className={cn(
                    "overflow-hidden rounded-2xl border border-border bg-card transition-opacity",
                    isPaging && "opacity-60"
                )}
                aria-busy={panels.isFetching}>
                <Table>
                    <TableHeader className="bg-muted/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="h-11 px-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {panels.isRequesting ? (
                            Array.from({ length: 5 }, (_, i) => (
                                <TableRow key={i} className="hover:bg-transparent">
                                    {columns.map((_, j) => (
                                        <TableCell key={j} className="px-4 py-3.5">
                                            <Skeleton className="h-4 w-full max-w-28 bg-muted" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : table.getRowModel().rows.length === 0 ? (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                                    No panels from {siteId} were collected in this period.
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.id === selectedPanelId ? "selected" : undefined}
                                    tabIndex={0}
                                    aria-label={`Open panel ${row.id}`}
                                    onClick={() => onSelectPanel(row.id)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter" || event.key === " ") {
                                            event.preventDefault();
                                            onSelectPanel(row.id);
                                        }
                                    }}
                                    className="cursor-pointer focus-visible:bg-muted/60 focus-visible:outline-none data-[state=selected]:bg-sand/60">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="px-4 py-3">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                <p aria-live="polite">
                    {rangeLabel}
                </p>
                <div className="flex items-center gap-2">
                    <span className="tabular-nums">
                        {pageLabel}
                    </span>
                    <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label="Previous page"
                        disabled={!table.getCanPreviousPage()}
                        onClick={() => table.previousPage()}>
                        <ChevronLeft />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label="Next page"
                        disabled={!table.getCanNextPage()}
                        onClick={() => table.nextPage()}>
                        <ChevronRight />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export { PanelsDataTable };
