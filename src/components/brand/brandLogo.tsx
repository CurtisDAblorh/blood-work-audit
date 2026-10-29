import { cn } from "@/lib/utils";

// The Blood Work Audit mark (a blood drop with an audit tick, also the favicon) beside the wordmark.
// The mark is decorative: the wordmark text next to it already names the app.
const BrandLogo = ({ className }: { className?: string }) => (
    <span className={cn("inline-flex items-center gap-2 text-foreground", className)}>
        <svg viewBox="0 0 32 32" aria-hidden="true" className="size-8">
            <path d="M16 3C16 3 6 14.2 6 20.5a10 10 0 0 0 20 0C26 14.2 16 3 16 3Z" fill="var(--destructive)" />
            <path d="m11.5 20.5 3.2 3.2 6-6.4" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[1.6rem] leading-none font-medium tracking-tight">Blood Work Audit</span>
    </span>
);

export { BrandLogo };
