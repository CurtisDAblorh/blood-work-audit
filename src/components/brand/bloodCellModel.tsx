import { lazy, Suspense, useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

// three.js is a few hundred KB, so it loads in its own chunk after the page has painted.
const BloodCellCanvas = lazy(() => import("@/components/brand/bloodCellCanvas"));

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const subscribeToReducedMotion = (onChange: () => void) => {
    const media = window.matchMedia(REDUCED_MOTION_QUERY);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
};

const usePrefersReducedMotion = () =>
    useSyncExternalStore(subscribeToReducedMotion, () => window.matchMedia(REDUCED_MOTION_QUERY).matches);

const BloodCellModel = ({ className }: { className?: string }) => {
    const reducedMotion = usePrefersReducedMotion();

    return (
        <div
            role="img"
            aria-label="3D model of a red blood cell. Drag to rotate it."
            className={cn("cursor-grab active:cursor-grabbing", className)}>
            <Suspense fallback={<div className="size-full animate-pulse rounded-full bg-sand/50" />}>
                <BloodCellCanvas reducedMotion={reducedMotion} />
            </Suspense>
        </div>
    );
};

export { BloodCellModel };
