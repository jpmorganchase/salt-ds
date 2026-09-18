declare module "js-yaml" {
  export interface LoadListenerState {
    anchor: string | null | undefined;
    anchorMap: Record<string, unknown> | undefined;
    position: number;
  }

  export interface LoadOptions {
    schema?: unknown;
    json?: boolean;
    listener?: (event: "open" | "close", state: LoadListenerState) => void;
  }

  export const JSON_SCHEMA: unknown;
  export function load(source: string, options?: LoadOptions): unknown;
}
