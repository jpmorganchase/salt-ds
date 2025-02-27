export const ActionCaseValues = ["uppercase", "original"] as const;

export type ActionCase = (typeof ActionCaseValues)[number];
