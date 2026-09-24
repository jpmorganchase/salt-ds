// These declarations describe intended relationships, not measured approvals.
// The audit still checks every final pair at every supported weight.
import { lineOnlySolidVariants } from "./line-only-variants.mjs";

export const pairContracts = {
  favorite: {
    mode: "component-exteriors",
    reason:
      "Fill the star without changing its five points or recessed shoulders.",
  },
  like: {
    mode: "component-exteriors",
    reason: "Fill the heart while retaining its lobes, cleft and point.",
  },
  sparkle: {
    mode: "component-exteriors",
    reason: "Retain both sparkle silhouettes and their relative placement.",
  },
  "sparkle-refresh": {
    mode: "component-exteriors",
    reason: "Retain the internal sparkle and complete circular arrow.",
  },
  ...Object.fromEntries(
    [...lineOnlySolidVariants].map((name) => [
      name,
      {
        mode: "identical-paint",
        reason: "Established open-line Solid compatibility export.",
      },
    ]),
  ),
};

export function classifyPair(name, samples, contracts = pairContracts) {
  const contract = contracts[name];
  if (!contract) return "needs-review";
  if (
    !["component-exteriors", "identical-paint"].includes(contract.mode) ||
    !contract.reason
  )
    throw new Error(`Invalid pair contract: ${name}`);
  if (samples.length !== 4) return "fail";
  return samples.every(
    (sample) =>
      sample.matches &&
      (contract.mode !== "identical-paint" || sample.identicalPaint),
  )
    ? "pass"
    : "fail";
}
