import { describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { workflowPreviewForRoute } from "../../site/src/components/components/patternSourceLoaders";
import {
  ButtonLoadingResources,
  WorkflowPreview,
} from "../../site/src/components/components/WorkflowPreview";

type Artifact = {
  url: string;
  sha256: string;
  bytes: number;
};

type Bootstrap = {
  bundle_digest: string;
  workflow: {
    files: (Artifact & { path: string })[];
    recipe: Artifact;
    guidance: Artifact & { document: Artifact };
  };
  button: {
    files: (Artifact & { path: string })[];
    guidance: Artifact & { document: Artifact };
  };
};

function toHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

async function jsonArtifact(
  url: string,
  value: unknown,
  contentIdentity?: string,
) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  const artifact = {
    url,
    sha256: `sha256:${toHex(await crypto.subtle.digest("SHA-256", bytes))}`,
    bytes: bytes.byteLength,
  };
  return contentIdentity
    ? { ...artifact, content_identity: contentIdentity }
    : artifact;
}

async function verifyArtifact(artifact: Artifact, immutableBase: string) {
  const url = new URL(artifact.url, window.location.origin);
  expect(url.origin).toBe(window.location.origin);
  expect(url.pathname.startsWith(immutableBase)).toBe(true);
  expect(url.search).toBe("");
  expect(url.hash).toBe("");

  const response = await fetch(url);
  expect(response.ok).toBe(true);
  const bytes = await response.arrayBuffer();
  expect(bytes.byteLength).toBe(artifact.bytes);
  expect(`sha256:${toHex(await crypto.subtle.digest("SHA-256", bytes))}`).toBe(
    artifact.sha256,
  );
}

describe("verified development workflow preview", () => {
  it("uses only the verified static bootstrap, assets, and packed interaction", async () => {
    const response = await fetch("/ai/development/bootstrap.json");
    expect(response.ok).toBe(true);
    const bootstrap = (await response.json()) as Bootstrap;
    const digest = bootstrap.bundle_digest.slice("sha256:".length);
    const immutableBase = `/ai/v1/${digest}/`;

    const registration = workflowPreviewForRoute(
      "/salt/patterns/analytical-dashboard",
    );
    if (!registration)
      throw new Error(
        "Analytical dashboard must register its workflow preview",
      );
    await render(<WorkflowPreview registration={registration} />);

    await expect
      .element(page.getByText("Current development workflow"))
      .toBeVisible();
    await expect
      .element(
        page.getByText(
          "Build a runnable service-operations dashboard with a persistent shell, worklist filters, local loading, empty and error recovery states, incident inspection, and an editable record form.",
        ),
      )
      .toBeVisible();
    await expect.element(page.getByText("Readiness: runnable")).toBeVisible();
    await expect
      .element(page.getByText("Manual review: pending", { exact: true }))
      .toBeVisible();
    await expect
      .element(
        page
          .getByRole("region", { name: "Verified guidance" })
          .getByText("workflow owner review", { exact: true })
          .nth(0),
      )
      .toBeVisible();
    await expect
      .element(
        page
          .getByRole("region", { name: "Verified guidance" })
          .getByText("Prerequisites and setup", { exact: true })
          .nth(0),
      )
      .toBeVisible();
    await expect
      .element(page.getByRole("button", { name: "Copy context" }))
      .toBeVisible();
    const frame = page.frameLocator(page.getByTestId("workflow-preview-frame"));
    await expect
      .element(frame.getByRole("heading", { name: "Operations overview" }))
      .toBeVisible();

    await Promise.all([
      verifyArtifact(bootstrap.workflow.recipe, immutableBase),
      verifyArtifact(bootstrap.workflow.guidance, immutableBase),
      verifyArtifact(bootstrap.workflow.guidance.document, immutableBase),
      verifyArtifact(bootstrap.button.guidance, immutableBase),
      verifyArtifact(bootstrap.button.guidance.document, immutableBase),
      ...bootstrap.workflow.files.map((file) =>
        verifyArtifact(file, immutableBase),
      ),
      ...bootstrap.button.files.map((file) =>
        verifyArtifact(file, immutableBase),
      ),
    ]);
    expect(bootstrap.workflow.files.map((file) => file.path)).toEqual(
      expect.arrayContaining([
        "src/main.tsx",
        "src/OperationsDashboard.tsx",
        "src/workflows/service-worklist/IncidentWorklist.tsx",
        "src/workflows/service-worklist/IncidentInspector.tsx",
        "src/workflows/service-worklist/ServiceWorklist.css",
        "src/workflows/record-form/RecordForm.tsx",
      ]),
    );

    await frame.getByRole("textbox", { name: "Filter services" }).fill("Risk");
    await expect
      .element(frame.getByText("Showing 1 of 4 services"))
      .toBeVisible();
    await frame
      .getByRole("button", { name: "Inspect Risk calculator" })
      .click();
    await expect
      .element(
        frame
          .getByRole("region", { name: "Incident details" })
          .getByText("INC-1042"),
      )
      .toBeVisible();
    await frame.getByRole("textbox", { name: "Filter services" }).fill("");

    const indexHtmlFile = page.getByRole("listitem", { hasText: "index.html" });
    await indexHtmlFile.getByText("index.html", { exact: true }).click();
    await indexHtmlFile.getByRole("button", { name: "View source" }).click();
    await expect.element(page.getByText(/<!doctype html>/iu)).toBeVisible();

    await frame.getByRole("button", { name: "Create incident" }).click();
    const title = frame.getByRole("textbox", { name: "Incident title" });
    const service = frame.getByRole("textbox", {
      name: "Affected service or operational process",
    });
    const form = frame.getByRole("form", { name: "Create incident record" });
    await form.getByRole("button", { name: "Create incident" }).click();
    await expect
      .element(frame.getByRole("alert"))
      .toHaveTextContent("Review the incident details before saving");
    await expect.element(title).toHaveFocus();
    await title.fill("Risk calculator latency");
    await service.fill("Risk calculator");
    const submit = form.getByRole("button", {
      name: /Create incident|Saving incident\./u,
    });
    await submit.click();
    await expect.element(submit).toHaveAttribute("data-loading", "true");
    await expect.element(submit).toHaveAttribute("type", "button");
    await expect
      .element(form.getByRole("status"))
      .toHaveTextContent("Saving incident.");
    await expect.element(title).toHaveAttribute("readonly");
    await expect.element(service).toHaveAttribute("readonly");
    await expect
      .element(frame.getByRole("alert"))
      .toHaveTextContent("The local demo rejected this first save");
    await frame.getByRole("button", { name: "Retry save" }).click();
    await expect
      .element(
        frame.getByRole("status").filter({
          hasText:
            "Local demo recorded Risk calculator latency for Risk calculator.",
        }),
      )
      .toHaveTextContent("No notification was sent.");
  }, 20_000);

  it("clears a source failure when the reader retries successfully", async () => {
    const originalFetch = globalThis.fetch;
    const bootstrap = (await (
      await originalFetch("/ai/development/bootstrap.json")
    ).json()) as Bootstrap;
    const file = bootstrap.button.files[0];
    if (!file) throw new Error("Button resources must include a source file");
    const sourceBytes = await (await originalFetch(file.url)).arrayBuffer();
    const source = new TextDecoder().decode(sourceBytes);
    const filePath = new URL(file.url, window.location.origin).pathname;
    let firstAttempt = true;
    let finishRetry: ((response: Response) => void) | undefined;
    const retryResponse = new Promise<Response>((resolve) => {
      finishRetry = resolve;
    });
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
        const url = new URL(input.toString(), window.location.origin);
        if (url.pathname === filePath) {
          if (firstAttempt) {
            firstAttempt = false;
            return Promise.resolve(new Response(null, { status: 503 }));
          }
          return retryResponse;
        }
        return originalFetch(input, init);
      }),
    );
    try {
      await render(<ButtonLoadingResources />);
      const fileItem = page
        .getByRole("listitem")
        .filter({ hasText: file.path });
      await fileItem.getByText(file.path, { exact: true }).click();
      const viewSource = fileItem.getByRole("button", { name: "View source" });
      await viewSource.click();
      await expect
        .element(fileItem.getByText(/source is unavailable/iu))
        .toBeVisible();

      await viewSource.click();
      await expect
        .element(fileItem.getByText(/source is unavailable/iu))
        .not.toBeInTheDocument();
      finishRetry?.(new Response(sourceBytes));
      await expect
        .poll(() => fileItem.element().querySelector("pre")?.textContent)
        .toBe(source);
      await expect
        .element(fileItem.getByText(/source is unavailable/iu))
        .not.toBeInTheDocument();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("shows Button resource loading before an unavailable bootstrap", async () => {
    let finishLoading: ((response: Response) => void) | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            finishLoading = resolve;
          }),
      ),
    );
    try {
      await render(<ButtonLoadingResources />);
      const resources = page.getByRole("region", {
        name: "Button loading resources",
      });
      await expect
        .element(resources.getByRole("status"))
        .toHaveTextContent(/Loading/iu);
      finishLoading?.(new Response(null, { status: 503 }));
      await expect
        .element(resources.getByRole("status"))
        .toHaveTextContent(/unavailable/iu);
      await expect
        .element(
          resources.getByRole("link", { name: "Button loading document" }),
        )
        .not.toBeInTheDocument();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it.each(["integrity", "document identity"] as const)(
    "shows unavailable Button resources after a guidance %s failure",
    async (failure) => {
      const bootstrap = (await (
        await fetch("/ai/development/bootstrap.json")
      ).json()) as Bootstrap;
      const documentUrl = bootstrap.button.guidance.document.url;
      const document = (await (await fetch(documentUrl)).json()) as {
        content_identity: string;
      };
      if (failure === "integrity") {
        bootstrap.button.guidance.document.sha256 = `sha256:${"0".repeat(64)}`;
      } else {
        document.content_identity = "mismatched-document-identity";
        bootstrap.button.guidance.document = await jsonArtifact(
          documentUrl,
          document,
        );
      }
      vi.stubGlobal(
        "fetch",
        vi.fn(async (input: RequestInfo | URL) => {
          const url = new URL(input.toString(), window.location.origin);
          const body =
            url.pathname === "/ai/development/bootstrap.json"
              ? bootstrap
              : url.pathname ===
                  new URL(documentUrl, window.location.origin).pathname
                ? document
                : undefined;
          return new Response(body ? JSON.stringify(body) : undefined, {
            status: body ? 200 : 404,
          });
        }),
      );
      try {
        await render(<ButtonLoadingResources />);
        const resources = page.getByRole("region", {
          name: "Button loading resources",
        });
        await expect
          .element(resources.getByRole("status"))
          .toHaveTextContent(/unavailable/iu);
        await expect
          .element(
            resources.getByRole("link", { name: "Button loading document" }),
          )
          .not.toBeInTheDocument();
        await expect
          .element(resources.getByRole("region", { name: "Verified guidance" }))
          .not.toBeInTheDocument();
      } finally {
        vi.unstubAllGlobals();
      }
    },
  );

  it("rejects a bootstrap whose verified recipe identity does not match", async () => {
    const registration = workflowPreviewForRoute(
      "/salt/patterns/analytical-dashboard",
    );
    if (!registration)
      throw new Error(
        "Analytical dashboard must register its workflow preview",
      );
    const bundle = `sha256:${"a".repeat(64)}`;
    const base = `/ai/v1/${bundle.slice("sha256:".length)}`;
    const recipeIdentity = `sha256:${"b".repeat(64)}`;
    const mismatchedIdentity = `sha256:${"c".repeat(64)}`;
    const guidanceIdentity = `sha256:${"d".repeat(64)}`;
    const recipeUrl = `${base}/examples/workflows/${registration.id}/recipe.json`;
    const guidanceDocumentUrl = `${base}/guidance/${registration.id}/document.json`;
    const recipe = await jsonArtifact(
      recipeUrl,
      {
        contract: "salt-workflow-recipe/1",
        id: registration.id,
        intent: { summary: "Mismatched identity fixture." },
        source_identity: { content_identity: mismatchedIdentity },
        limitations: [],
        readiness: {
          delivered: "runnable",
          manual_review: "pending",
          pending_reviews: [],
        },
      },
      recipeIdentity,
    );
    const guidanceDocument = await jsonArtifact(guidanceDocumentUrl, {
      contract: "salt-canonical-document/1",
      reference: registration.guideReference,
      title: registration.title,
      content_identity: guidanceIdentity,
      readiness: "runnable",
      sections: [],
    });
    const bootstrap = {
      contract: "salt-workflow-development/1",
      development: true,
      publishable: false,
      bundle_digest: bundle,
      workflow: {
        id: registration.id,
        route: registration.route,
        recipe,
        guidance: {
          ...(await jsonArtifact(
            `${base}/guides/${registration.id}/index.md`,
            "canonical markdown",
            guidanceIdentity,
          )),
          reference: registration.guideReference,
          document: guidanceDocument,
        },
        preview: {
          url: `${base}/examples/workflows/${registration.id}/preview/${"e".repeat(64)}/index.html`,
          tree_sha256: `sha256:${"e".repeat(64)}`,
        },
        files: [],
      },
      button: {
        route: "/salt/components/button/examples",
        guidance: {
          ...(await jsonArtifact(
            `${base}/guides/guide.button.loading/index.md`,
            "button markdown",
            `sha256:${"f".repeat(64)}`,
          )),
          reference: "record:guide:guide.button.loading",
          document: await jsonArtifact(
            `${base}/guidance/guide.button.loading/document.json`,
            {},
          ),
        },
        files: [],
      },
    };
    const responses = new Map<string, unknown>([
      ["/ai/development/bootstrap.json", bootstrap],
      [
        recipeUrl,
        {
          contract: "salt-workflow-recipe/1",
          id: registration.id,
          intent: { summary: "Mismatched identity fixture." },
          source_identity: { content_identity: mismatchedIdentity },
          limitations: [],
          readiness: {
            delivered: "runnable",
            manual_review: "pending",
            pending_reviews: [],
          },
        },
      ],
      [
        guidanceDocumentUrl,
        {
          contract: "salt-canonical-document/1",
          reference: registration.guideReference,
          title: registration.title,
          content_identity: guidanceIdentity,
          readiness: "runnable",
          sections: [],
        },
      ],
    ]);
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = new URL(input.toString(), window.location.origin);
        const body = responses.get(url.pathname) ?? responses.get(url.href);
        return new Response(body ? JSON.stringify(body) : undefined, {
          status: body ? 200 : 404,
        });
      }),
    );
    try {
      await render(<WorkflowPreview registration={registration} />);
      await expect
        .element(
          page
            .getByText("The verified development workflow is unavailable.")
            .last(),
        )
        .toBeVisible();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
