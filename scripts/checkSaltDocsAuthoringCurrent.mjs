import { assert, sha256 } from "./saltAiEvidenceUtils.mjs";

export function validateCurrentWebArtifacts({
  routeMap,
  routeMapBytes,
  receipt,
}) {
  assert(
    routeMap?.contract === "salt-ai-web-route-map/2" &&
      Array.isArray(routeMap.routes) &&
      routeMap.bundle_digest === receipt?.bundle_digest &&
      receipt?.route_map?.sha256 === sha256(routeMapBytes) &&
      receipt.route_map.bytes === routeMapBytes.byteLength &&
      receipt.workflow_preview?.bootstrap?.path ===
        "/ai/development/bootstrap.json",
    "Current authoring web route map or receipt is stale",
  );
  const bootstrap = routeMap.routes.find(
    (route) => route.path === receipt.workflow_preview.bootstrap.path,
  );
  assert(
    bootstrap?.sha256 === receipt.workflow_preview.bootstrap.sha256 &&
      bootstrap?.bytes === receipt.workflow_preview.bootstrap.bytes,
    "Current authoring workflow bootstrap is absent from the web route map",
  );
}
