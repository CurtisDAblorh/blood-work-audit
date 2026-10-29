import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const tones = {
    light: "bg-card text-card-foreground",
    sand: "bg-linear-to-b from-[#ede6dc] to-sand text-secondary-foreground"
};

interface ReviewCardProps {
    id: string;
    title: string;
    /** One line under the title in the heading column. */
    caption?: string;
    tone?: keyof typeof tones;
    /** Full-width content under the body, e.g. a footer strip. */
    footer?: ReactNode;
    children: ReactNode;
}

// Full-width card: heading column on the left, content beside it on large screens, stacked below that.
const ReviewCard = ({ id, title, caption, tone = "light", footer, children }: ReviewCardProps) => (
    <section
        id={id}
        aria-labelledby={`${id}-title`}
        className={cn("scroll-mt-6 overflow-hidden rounded-[2rem] shadow-card", tones[tone])}>
        <div className="grid gap-6 p-8 sm:p-10 lg:grid-cols-[13rem_1fr] lg:gap-12">
            <div>
                <h2 id={`${id}-title`} className="text-3xl font-medium tracking-tight sm:text-4xl">
                    {title}
                </h2>
                {caption && <p className="mt-2 text-sm text-muted-foreground">{caption}</p>}
            </div>
            <div className="min-w-0">{children}</div>
        </div>
        {footer}
    </section>
);

export { ReviewCard };
