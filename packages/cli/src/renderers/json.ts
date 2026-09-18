import type { SaltScanResult } from "../scan/result.js";

export function renderJson(result: SaltScanResult): string {
  return `${JSON.stringify(result)}\n`;
}
