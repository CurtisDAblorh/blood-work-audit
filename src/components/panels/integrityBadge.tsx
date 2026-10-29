import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface IntegrityBadgeProps {
    score: number;
    minimum: number;
    className?: string;
}

/** The panel's integrity score, flagged when it falls below the manifest's QC threshold. */
const IntegrityBadge = ({ score, minimum, className }: IntegrityBadgeProps) => {
    const belowThreshold = score < minimum;

    return (
        <Badge
            variant="outline"
            title={belowThreshold ? `Below the ${minimum.toFixed(2)} QC threshold` : "Meets the QC threshold"}
            className={cn(
                "gap-1.5 font-medium tabular-nums",
                belowThreshold
                    ? "border-destructive/30 bg-destructive/8 text-destructive"
                    : "border-success/30 bg-success/8 text-success",
                className
            )}>
            <span aria-hidden="true" className={cn("size-1.5 rounded-full", belowThreshold ? "bg-destructive" : "bg-success")} />
            {score.toFixed(2)}
            <span className="sr-only">{belowThreshold ? ", below QC threshold" : ", meets QC threshold"}</span>
        </Badge>
    );
};

export { IntegrityBadge };
