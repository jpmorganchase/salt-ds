import { describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import { workflowPreviewForRoute } from "../../site/src/components/components/patternSourceLoaders";
import { WorkflowPreview } from "../../site/src/components/components/WorkflowPreview";

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

    const registration = workflowPreviewForRoute("/salt/patterns/forms");
    if (!registration)
      throw new Error("Forms must register its workflow preview");
    await render(<WorkflowPreview registration={registration} />);

    await expect
      .element(page.getByText("Current development workflow"))
      .toBeVisible();
    await expect
      .element(
        page.getByText(
          "Create or adapt an incident record form with host-owned draft, validation, pending submission, failure recovery, retry, and cancellation state.",
        ),
      )
      .toBeVisible();
    await expect.element(page.getByText("Readiness: runnable")).toBeVisible();
    await expect
      .element(page.getByText("Manual review: pending"))
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
    expect(bootstrap.workflow.files).toHaveLength(12);

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
      .element(frame.getByRole("status"))
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

  it("rejects a bootstrap whose verified recipe identity does not match", async () => {
    const registration = workflowPreviewForRoute("/salt/patterns/forms");
    if (!registration)
      throw new Error("Forms must register its workflow preview");
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
    const responses = new Map([
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
