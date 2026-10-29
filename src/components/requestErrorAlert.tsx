import { CircleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RequestErrorAlertProps {
    message: string | undefined;
    isRetrying?: boolean;
    onRetry?: () => void;
    className?: string;
}

const RequestErrorAlert = ({ message, isRetrying = false, onRetry, className }: RequestErrorAlertProps) => (
    <div
        role="alert"
        className={cn(
            "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive",
            className
        )}>
        <span className="flex items-center gap-2">
            <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
            {message ?? "Something went wrong"}
        </span>
        {onRetry && (
            <Button variant="outline" size="sm" disabled={isRetrying} onClick={onRetry}>
                {isRetrying ? "Retrying…" : "Retry"}
            </Button>
        )}
    </div>
);

export { RequestErrorAlert };
