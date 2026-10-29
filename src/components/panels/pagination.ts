/** The panels table's footer text, e.g. "Showing 11–13 of 13 panels" and "Page 2 of 2". */
export const describePage = (pageIndex: number, pageSize: number, total: number) => {
    if (total === 0) return { rangeLabel: "No panels", pageLabel: "Page 0 of 0" };

    const pageCount = Math.ceil(total / pageSize);
    const firstRow = pageIndex * pageSize + 1;
    const lastRow = Math.min(total, (pageIndex + 1) * pageSize);

    return {
        rangeLabel: `Showing ${firstRow}–${lastRow} of ${total} panels`,
        pageLabel: `Page ${pageIndex + 1} of ${pageCount}`
    };
};
