import { z } from "zod";

const safeNonNegativeNumber = z
  .number()
  .finite()
  .nonnegative()
  .max(Number.MAX_SAFE_INTEGER);

export const calculatorInputSchema = z
  .object({
    currentValue: safeNonNegativeNumber,
    futureValue: safeNonNegativeNumber,
    waitSeconds: safeNonNegativeNumber,
    lightningProbability: z.number().finite().min(0).max(1),
    residualValue: safeNonNegativeNumber,
    waitCost: safeNonNegativeNumber,
  })
  .superRefine((input, context) => {
    if (input.residualValue > input.futureValue) {
      context.addIssue({
        code: "custom",
        path: ["residualValue"],
        message: "Residual value cannot exceed future value.",
      });
    }
  });
