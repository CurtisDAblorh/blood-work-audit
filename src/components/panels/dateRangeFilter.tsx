import { isAfter, isBefore, isSameDay } from "date-fns";
import { CalendarDays, ChevronDown, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { type DateRange, getPeriodError } from "@/components/panels/period";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDisplayDate } from "@/lib/format";

export type { DateRange } from "@/components/panels/period";

interface DateRangeFilterProps {
    value: DateRange;
    /** The days the dataset covers; picking outside them is rejected. */
    bounds: DateRange;
    onChange: (range: DateRange) => void;
}

interface DatePickerProps {
    label: string;
    selected: Date;
    bounds: DateRange;
    onSelect: (date: Date) => void;
}

// Popover-triggered calendar, following sami's data table date filter, without its "days with data" lock:
// out-of-range days stay pickable so the period check can explain why they are rejected.
const DatePicker = ({ label, selected, bounds, onSelect }: DatePickerProps) => {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="h-10 justify-start gap-2 rounded-xl bg-card px-3 font-normal">
                    <CalendarDays className="text-muted-foreground" />
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{formatDisplayDate(selected)}</span>
                    <ChevronDown className="ml-1 text-muted-foreground" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    required
                    selected={selected}
                    defaultMonth={selected}
                    weekStartsOn={1}
                    modifiers={{ noData: (day) => isBefore(day, bounds.from) || isAfter(day, bounds.to) }}
                    modifiersClassNames={{ noData: "opacity-40" }}
                    onSelect={(date) => {
                        setOpen(false);
                        if (!isSameDay(date, selected)) onSelect(date);
                    }}
                    autoFocus
                />
            </PopoverContent>
        </Popover>
    );
};

const DateRangeFilter = ({ value, bounds, onChange }: DateRangeFilterProps) => {
    const apply = (range: DateRange) => {
        const error = getPeriodError(range, bounds);

        if (error) {
            toast.error(error.title, { id: "period-error", description: error.description });
            return;
        }

        onChange(range);
    };

    const isFullRange = isSameDay(value.from, bounds.from) && isSameDay(value.to, bounds.to);

    return (
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Collection period">
            <DatePicker label="From" selected={value.from} bounds={bounds} onSelect={(from) => apply({ ...value, from })} />
            <DatePicker label="To" selected={value.to} bounds={bounds} onSelect={(to) => apply({ ...value, to })} />
            <Button
                variant="ghost"
                className="h-10 rounded-xl text-muted-foreground"
                disabled={isFullRange}
                onClick={() => onChange(bounds)}>
                <RotateCcw />
                Full period
            </Button>
        </div>
    );
};

export { DateRangeFilter };
