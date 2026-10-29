import { Check, ChevronsUpDown, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface SiteMultiSelectProps {
    siteIds: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
}

// Searchable multi-select: each chosen site becomes a tab in the panel explorer.
const SiteMultiSelect = ({ siteIds, selected, onChange }: SiteMultiSelectProps) => {
    const toggle = (siteId: string) =>
        onChange(selected.includes(siteId) ? selected.filter((id) => id !== siteId) : [...selected, siteId]);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="h-10 justify-between gap-2 rounded-xl bg-card px-3 font-normal">
                    <MapPin className="text-muted-foreground" />
                    <span>Sites</span>
                    <Badge variant="secondary" className="tabular-nums">
                        {selected.length}/{siteIds.length}
                    </Badge>
                    <ChevronsUpDown className="ml-1 text-muted-foreground" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search sites…" />
                    <CommandList>
                        <CommandEmpty>No sites found.</CommandEmpty>
                        <CommandGroup heading="Sites">
                            {siteIds.map((siteId) => {
                                const isSelected = selected.includes(siteId);

                                return (
                                    <CommandItem
                                        key={siteId}
                                        value={siteId}
                                        onSelect={() => toggle(siteId)}
                                        aria-selected={isSelected}>
                                        <span
                                            aria-hidden="true"
                                            className={cn(
                                                "flex size-4 items-center justify-center rounded-[0.3rem] border border-input",
                                                isSelected && "border-primary bg-primary text-primary-foreground"
                                            )}>
                                            {isSelected && <Check className="size-3" />}
                                        </span>
                                        {siteId}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup>
                            <CommandItem onSelect={() => onChange(siteIds)} disabled={selected.length === siteIds.length}>
                                Select all
                            </CommandItem>
                            <CommandItem onSelect={() => onChange([])} disabled={selected.length === 0}>
                                Clear selection
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export { SiteMultiSelect };
