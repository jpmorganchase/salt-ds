export const ActionCaseValues = ["uppercase", "asTyped"] as const;

export type ActionCase = (typeof ActionCaseValues)[number];
