import type { DoctorResult } from "./schemas.js";
export interface DoctorOptions {
  rootDir?: string;
  timestamp?: string;
  toolVersion?: string;
}
export declare function runDoctor(
  options?: DoctorOptions,
): Promise<DoctorResult>;
