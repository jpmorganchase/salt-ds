import type { ApiSymbolIdentity } from "../types.js";
import { stableShaId } from "./catalogSerialization.js";

export function isApiSymbolSpaceAvailable(
  symbolSpace: ApiSymbolIdentity["symbol_space"],
  usageSpace: "type" | "value",
): boolean {
  return symbolSpace === "type_and_value" || symbolSpace === usageSpace;
}

export function isApiSymbolSpaceReplacementCompatible(
  source: ApiSymbolIdentity["symbol_space"],
  target: ApiSymbolIdentity["symbol_space"],
): boolean {
  return (
    (source !== "type" || isApiSymbolSpaceAvailable(target, "type")) &&
    (source !== "value" || isApiSymbolSpaceAvailable(target, "value")) &&
    (source !== "type_and_value" ||
      (isApiSymbolSpaceAvailable(target, "type") &&
        isApiSymbolSpaceAvailable(target, "value")))
  );
}

export function apiSymbolIdentityMaterial(subject: ApiSymbolIdentity): {
  schema: "salt.api-symbol.identity.v1";
  package: string;
  entrypoint: string;
  export_name: string;
  symbol_space: "value" | "type" | "type_and_value";
  member_path: ApiSymbolIdentity["member_path"];
} {
  return {
    schema: "salt.api-symbol.identity.v1",
    package: subject.package,
    entrypoint: subject.entrypoint,
    export_name: subject.export_name,
    symbol_space: subject.symbol_space,
    member_path: subject.member_path,
  };
}

export function createApiSymbolId(subject: ApiSymbolIdentity): string {
  return stableShaId("api-symbol", apiSymbolIdentityMaterial(subject));
}

export function createDeprecationId(subject: ApiSymbolIdentity): string {
  return stableShaId("deprecation", {
    schema: "salt.deprecation.identity.v1",
    subject_ref: {
      family: "api_symbol",
      id: createApiSymbolId(subject),
    },
  });
}
