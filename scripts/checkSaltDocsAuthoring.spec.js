import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";
import { validateCurrentWebArtifacts } from "./checkSaltDocsAuthoringCurrent.mjs";
import { sha256 } from "./saltAiEvidenceUtils.mjs";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const script = path.join(repositoryRoot, "scripts/checkSaltDocsAuthoring.mjs");

function checkCurrentAuthoring(arguments_) {
  return execFileSync(
    process.execPath,
    [script, "--current-product", ...arguments_],
    {
      cwd: repositoryRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    },
  );
}

describe("checkSaltDocsAuthoring current-product mode", () => {
  function webFixture() {
    const routeMap = {
      contract: "salt-ai-web-route-map/2",
      bundle_digest: "sha256:bundle",
      routes: [
        {
          path: "/ai/development/bootstrap.json",
          sha256: "sha256:bootstrap",
          bytes: 12,
        },
      ],
    };
    const routeMapBytes = Buffer.from(JSON.stringify(routeMap), "utf8");
    return {
      routeMap,
      routeMapBytes,
      receipt: {
        bundle_digest: "sha256:bundle",
        route_map: {
          sha256: sha256(routeMapBytes),
          bytes: routeMapBytes.byteLength,
        },
        workflow_preview: {
          bootstrap: {
            path: "/ai/development/bootstrap.json",
            sha256: "sha256:bootstrap",
            bytes: 12,
          },
        },
      },
    };
  }

  it("requires an explicit generated web route map", () => {
    expect(() => checkCurrentAuthoring([])).toThrow(
      /--current-product requires --require-web-route-map/u,
    );
  });

  it("rejects a route map that is not the current generated web map", () => {
    expect(() =>
      checkCurrentAuthoring(["--require-web-route-map", "package.json"]),
    ).toThrow(/Current authoring route map must be/u);
  });

  it("rejects stale route-map bytes and an incomplete workflow bootstrap", () => {
    const fixture = webFixture();
    expect(() => validateCurrentWebArtifacts(fixture)).not.toThrow();
    expect(() =>
      validateCurrentWebArtifacts({
        ...fixture,
        routeMapBytes: Buffer.from("stale", "utf8"),
      }),
    ).toThrow(/route map or receipt is stale/u);
    expect(() =>
      validateCurrentWebArtifacts({
        ...fixture,
        routeMap: { ...fixture.routeMap, routes: [] },
      }),
    ).toThrow(/workflow bootstrap is absent/u);
  });
});
