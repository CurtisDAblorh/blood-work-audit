import { addDays, format, parseISO } from "date-fns";

// The API sends calendar dates as yyyy-MM-dd. parseISO reads those as local midnight, so the
// displayed day never shifts with the viewer's timezone (unlike `new Date("2026-05-01")`).
export const parseApiDate = (value: string) => parseISO(value);

export const toApiDate = (date: Date) => format(date, "yyyy-MM-dd");

/** The exclusive end the API expects for a range whose last day is `inclusiveEnd`. */
export const toExclusiveApiDate = (inclusiveEnd: Date) => toApiDate(addDays(inclusiveEnd, 1));

/** e.g. "1 May 2026" */
export const formatDisplayDate = (value: Date | string) =>
    format(typeof value === "string" ? parseApiDate(value) : value, "d MMM yyyy");

const utcDateTime = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC"
});

/** e.g. "1 May 2026, 00:00:15 UTC". Lab event times are UTC instants, shown in UTC so logs line up. */
export const formatDisplayDateTime = (value: string) => `${utcDateTime.format(parseISO(value))} UTC`;
