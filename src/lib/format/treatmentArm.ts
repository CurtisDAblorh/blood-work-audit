/** "treatment-a" -> "Treatment A", "control" -> "Control". */
export const formatTreatmentArm = (arm: string) =>
    arm
        .split(/[-_\s]+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
