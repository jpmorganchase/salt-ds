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

export * from "./date-fns";
export * from "./dayjs";
export * from "./luxon";
export * from "./moment";

export * from "./types";
