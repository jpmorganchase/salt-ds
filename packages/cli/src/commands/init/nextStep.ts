import type { SaltInfoResult } from "../../types.js";
import type { ConventionsPackSource } from "./policy.js";

export function buildStackNextStep(input: {
  policyMode: SaltInfoResult["policy"]["mode"];
  conventionsPackRequested: boolean;
  conventionsPackSource: string | null;
}): string {
  if (input.policyMode !== "stack") {
    return "Bootstrap is complete. Continue with salt-ds create for new UI. Repo-aware Salt workflows will apply declared project conventions automatically, and you should validate with salt-ds review or the repo ui:verify script when it exists.";
  }

  if (!input.conventionsPackRequested) {
    return "Layered Salt policy already exists. Run salt-ds info --json to verify the stack before continuing with salt-ds create. Repo-aware Salt workflows will apply the declared layer order automatically, and you should validate with salt-ds review or the repo ui:verify script when it exists.";
  }

  if (!input.conventionsPackSource) {
    return "Bootstrap is complete. Add the shared conventions pack, run salt-ds info --json to verify the layered stack, then continue with salt-ds create. Repo-aware Salt workflows will apply the declared layer order automatically, and you should validate with salt-ds review or the repo ui:verify script when it exists.";
  }

  return "Bootstrap is complete. Run salt-ds info --json to verify the layered conventions stack and shared pack resolution, then continue with salt-ds create. Repo-aware Salt workflows will apply the declared layer order automatically, and you should validate with salt-ds review or the repo ui:verify script when it exists.";
}

export function buildSharedPackVerificationNotes(
  context: SaltInfoResult,
  conventionsPack: ConventionsPackSource,
): string[] {
  if (context.policy.mode !== "stack") {
    return [];
  }

  const notes: string[] = [
    conventionsPack.packageSource
      ? "Run salt-ds info --json to verify the layered conventions stack and shared conventions pack resolution before starting create or review."
      : "Run salt-ds info --json to verify the layered stack before starting create or review.",
  ];

  const packDetails = context.policy.sharedConventions.packDetails;
  if (packDetails.length === 0) {
    return conventionsPack.requested
      ? [
          ...notes,
          ...(conventionsPack.packageSource
            ? []
            : [
                "Add the shared conventions pack before relying on the layered stack for shared upstream policy.",
              ]),
        ]
      : notes;
  }

  return [
    ...notes,
    ...packDetails.map((detail) => {
      if (
        detail.status === "resolved" &&
        (!detail.compatibility || detail.compatibility.status === "compatible")
      ) {
        return `Verified shared conventions pack ${detail.source}${detail.packId ? ` (${detail.packId})` : ""}${detail.resolvedPath ? ` at ${detail.resolvedPath}` : ""}.`;
      }

      return (
        detail.reason ??
        detail.compatibility?.reason ??
        `Shared conventions pack ${detail.source} still needs verification.`
      );
    }),
  ];
}
