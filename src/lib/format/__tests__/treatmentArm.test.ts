import { formatTreatmentArm } from "@/lib/format";

describe("formatTreatmentArm", () => {
    it("turns the dataset's arm codes into readable labels", () => {
        expect(formatTreatmentArm("treatment-a")).toBe("Treatment A");
        expect(formatTreatmentArm("control")).toBe("Control");
        expect(formatTreatmentArm("treatment_b ")).toBe("Treatment B");
    });
});
