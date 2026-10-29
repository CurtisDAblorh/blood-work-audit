import { isAfter, isBefore } from "date-fns";

import { formatDisplayDate } from "@/lib/format";

export interface DateRange {
    /** First day shown, inclusive. */
    from: Date;
    /** Last day shown, inclusive. */
    to: Date;
}

/** Why `range` cannot be shown, or null when it can. Drives the date filter's error toasts. */
export const getPeriodError = (range: DateRange, bounds: DateRange) => {
    if (isAfter(range.from, range.to)) {
        return {
            title: "Invalid period",
            description: `The start date (${formatDisplayDate(range.from)}) is after the end date (${formatDisplayDate(range.to)}).`
        };
    }

    if (isBefore(range.from, bounds.from) || isAfter(range.to, bounds.to)) {
        return {
            title: "Outside the dataset",
            description: `Panels were only collected from ${formatDisplayDate(bounds.from)} to ${formatDisplayDate(bounds.to)}.`
        };
    }

    return null;
};
