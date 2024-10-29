/**
 * To add a new adapter, then, add the adapter's date object to `DateFrameworkTypeMap` interface
 *
 * declare module "./types" {
 *   interface DateFrameworkTypeMap {
 *     luxon: DateTime;
 *   }
 * }
 */
export type DateFrameworkTypeMap = {};

export * from "./types";
export * from "./saltDateAdapter";
export * from "./LocalizationProvider";

// Supported date libraries but you can create your own by implementating `SaltDateAdapter`
export * from "./date-fns";
export * from "./dayjs";
export * from "./luxon";
/** Deprecated by maintainers since Sept 2020, consider an alternative OSS date library instead */
export * from "./moment";
