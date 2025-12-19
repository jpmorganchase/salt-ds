/**
 * To add a new adapter, then, add the adapter's date object to `DateFrameworkTypeMap` interface
 *
 * declare module "@salt-ds/date-adapters" {
 *   interface DateFrameworkTypeMap {
 *     luxon: DateTime;
 *   }
 * }
 */

// biome-ignore lint/complexity/noBannedTypes: type augmented by configured adapters
export interface DateFrameworkTypeMap {};
