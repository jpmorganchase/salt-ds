/**
 * To add a new adapter, then, add the adapter's date object to `DateFrameworkTypeMap` interface
 *
 * declare module "./types" {
 *   interface DateFrameworkTypeMap {
 *     luxon: DateTime;
 *   }
 * }
 */
// biome-ignore lint/complexity/noBannedTypes: type augmented by configured adapters
export type DateFrameworkTypeMap = {};

export * from "./types";
export * from "./LocalizationProvider";

// Supported date libraries but you can create your own by implementing `SaltDateAdapter`
export * from "./date-fns";
export * from "./dayjs";
export * from "./luxon";
/** Deprecated by maintainers since Sept 2020, consider an alternative OSS date library instead */
export * from "./moment";
