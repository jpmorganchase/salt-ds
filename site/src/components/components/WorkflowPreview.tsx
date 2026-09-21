import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { code, p, ul } from "../mdx/index";
import {
  type WorkflowPreviewRegistration,
  workflowPreviewByRoute,
} from "./patternSourceLoaders";
import styles from "./WorkflowPreview.module.css";

const bootstrapPath = "/ai/development/bootstrap.json";
const digestPattern = /^sha256:[0-9a-f]{64}$/u;
const digestHexPattern = /^[0-9a-f]{64}$/u;
const markdownComponents = { code, p, ul };

type Artifact = {
  url: string;
  sha256: string;
  bytes: number;
  content_identity: string;
};

type DocumentArtifact = Omit<Artifact, "content_identity">;

type GuidanceArtifact = Artifact & {
  reference: string;
  document: DocumentArtifact;
};

type WorkflowFile = DocumentArtifact & { path: string };

type DevelopmentBootstrap = {
  contract: "salt-workflow-development/1";
  development: true;
  publishable: false;
  bundle_digest: string;
  workflow: {
    id: string;
    route: string;
    recipe: Artifact;
    guidance: GuidanceArtifact;
    preview: { url: string; tree_sha256: string };
    files: WorkflowFile[];
  };
  button: {
    route: string;
    guidance: GuidanceArtifact;
    files: WorkflowFile[];
  };
};

type CanonicalSection = {
  purpose: string;
  reference: string;
  title: string;
  markdown: string;
  search_text: string;
};

type CanonicalDocument = {
  contract: "salt-canonical-document/1";
  reference: string;
  title: string;
  content_identity: string;
  readiness: string;
  sections: CanonicalSection[];
};

type WorkflowRecipe = {
  contract: "salt-workflow-recipe/1";
  id: string;
  intent: { summary: string };
  source_identity: { content_identity: string };
  limitations: string[];
  readiness: {
    delivered: string;
    manual_review: string;
    pending_reviews: string[];
  };
};

type LoadedWorkflow = {
  bootstrap: DevelopmentBootstrap;
  guidance: CanonicalDocument;
  recipe: WorkflowRecipe;
};

function isArtifact(value: unknown): value is Artifact {
  if (!value || typeof value !== "object") return false;
  const artifact = value as Partial<Artifact>;
  return (
    typeof artifact.url === "string" &&
    digestPattern.test(artifact.sha256 ?? "") &&
    typeof artifact.bytes === "number" &&
    Number.isSafeInteger(artifact.bytes) &&
    artifact.bytes >= 0 &&
    typeof artifact.content_identity === "string" &&
    artifact.content_identity.length > 0
  );
}

function isDocumentArtifact(value: unknown): value is DocumentArtifact {
  if (!value || typeof value !== "object") return false;
  const artifact = value as Partial<DocumentArtifact>;
  return (
    typeof artifact.url === "string" &&
    digestPattern.test(artifact.sha256 ?? "") &&
    typeof artifact.bytes === "number" &&
    Number.isSafeInteger(artifact.bytes) &&
    artifact.bytes >= 0
  );
}

function hex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

async function fetchVerifiedBytes(artifact: DocumentArtifact) {
  const response = await fetch(artifact.url);
  if (!response.ok)
    throw new Error("Verified development resource unavailable");
  const bytes = await response.arrayBuffer();
  if (
    bytes.byteLength !== artifact.bytes ||
    `sha256:${hex(await crypto.subtle.digest("SHA-256", bytes))}` !==
      artifact.sha256
  ) {
    throw new Error("Verified development resource changed");
  }
  return bytes;
}

async function fetchVerifiedJson<T>(artifact: DocumentArtifact): Promise<T> {
  return JSON.parse(
    new TextDecoder().decode(await fetchVerifiedBytes(artifact)),
  ) as T;
}

function hasCanonicalUrl(value: string, bundleDigest: string) {
  const bundle = bundleDigest.slice("sha256:".length);
  if (!digestHexPattern.test(bundle)) return false;
  try {
    const url = new URL(value, window.location.origin);
    return (
      url.origin === window.location.origin &&
      url.search === "" &&
      url.hash === "" &&
      url.pathname.startsWith(`/ai/v1/${bundle}/`)
    );
  } catch {
    return false;
  }
}

function canonicalPath(value: string) {
  try {
    return new URL(value, window.location.origin).pathname;
  } catch {
    return "";
  }
}

function isFile(value: unknown, bundleDigest: string): value is WorkflowFile {
  if (!isDocumentArtifact(value)) return false;
  const file = value as WorkflowFile;
  return (
    typeof file.path === "string" &&
    file.path.length > 0 &&
    !file.path.startsWith("/") &&
    !file.path.includes("..") &&
    hasCanonicalUrl(file.url, bundleDigest) &&
    canonicalPath(file.url).includes(`/files/${file.path}`)
  );
}

function parseBootstrap(
  value: unknown,
  registration: WorkflowPreviewRegistration,
): DevelopmentBootstrap | undefined {
  if (!value || typeof value !== "object") return undefined;
  const bootstrap = value as Partial<DevelopmentBootstrap>;
  const workflow = bootstrap.workflow;
  const button = bootstrap.button;
  if (
    bootstrap.contract !== "salt-workflow-development/1" ||
    bootstrap.development !== true ||
    bootstrap.publishable !== false ||
    !digestPattern.test(bootstrap.bundle_digest ?? "") ||
    !workflow ||
    !button ||
    workflow.id !== registration.id ||
    workflow.route !== registration.route ||
    !isArtifact(workflow.recipe) ||
    !canonicalPath(workflow.recipe.url).endsWith(
      `/examples/workflows/${registration.id}/recipe.json`,
    ) ||
    !isArtifact(workflow.guidance) ||
    typeof workflow.guidance.reference !== "string" ||
    workflow.guidance.reference !== registration.guideReference ||
    !isDocumentArtifact(workflow.guidance.document) ||
    !canonicalPath(workflow.guidance.url).endsWith(
      `/guides/${registration.id}/index.md`,
    ) ||
    !canonicalPath(workflow.guidance.document.url).endsWith(
      `/guidance/${registration.id}/document.json`,
    ) ||
    !workflow.preview ||
    typeof workflow.preview.url !== "string" ||
    !digestPattern.test(workflow.preview.tree_sha256 ?? "") ||
    !canonicalPath(workflow.preview.url).includes(
      `/examples/workflows/${registration.id}/preview/${workflow.preview.tree_sha256.slice("sha256:".length)}/`,
    ) ||
    !Array.isArray(workflow.files) ||
    button.route !== "/salt/components/button/examples" ||
    !isArtifact(button.guidance) ||
    typeof button.guidance.reference !== "string" ||
    button.guidance.reference !== "record:guide:guide.button.loading" ||
    !isDocumentArtifact(button.guidance.document) ||
    !canonicalPath(button.guidance.url).endsWith(
      "/guides/guide.button.loading/index.md",
    ) ||
    !canonicalPath(button.guidance.document.url).endsWith(
      "/guidance/guide.button.loading/document.json",
    ) ||
    !Array.isArray(button.files)
  ) {
    return undefined;
  }
  const allUrls = [
    workflow.recipe.url,
    workflow.guidance.url,
    workflow.guidance.document.url,
    workflow.preview.url,
    button.guidance.url,
    button.guidance.document.url,
  ];
  if (
    !allUrls.every((url) => hasCanonicalUrl(url, bootstrap.bundle_digest!)) ||
    !workflow.files.every((file) => isFile(file, bootstrap.bundle_digest!)) ||
    !button.files.every((file) => isFile(file, bootstrap.bundle_digest!))
  ) {
    return undefined;
  }
  return bootstrap as DevelopmentBootstrap;
}

function parseCanonicalDocument(
  value: unknown,
  reference: string,
  contentIdentity: string,
): CanonicalDocument | undefined {
  if (!value || typeof value !== "object") return undefined;
  const document = value as Partial<CanonicalDocument>;
  if (
    document.contract !== "salt-canonical-document/1" ||
    document.reference !== reference ||
    document.content_identity !== contentIdentity ||
    typeof document.title !== "string" ||
    typeof document.readiness !== "string" ||
    !Array.isArray(document.sections) ||
    !document.sections.every(
      (section) =>
        section &&
        typeof section === "object" &&
        typeof section.purpose === "string" &&
        typeof section.reference === "string" &&
        typeof section.title === "string" &&
        typeof section.markdown === "string" &&
        typeof section.search_text === "string",
    )
  ) {
    return undefined;
  }
  return document as CanonicalDocument;
}

function parseRecipe(
  value: unknown,
  registration: WorkflowPreviewRegistration,
  contentIdentity: string,
): WorkflowRecipe | undefined {
  if (!value || typeof value !== "object") return undefined;
  const recipe = value as Partial<WorkflowRecipe>;
  return recipe.contract === "salt-workflow-recipe/1" &&
    recipe.id === registration.id &&
    typeof recipe.intent?.summary === "string" &&
    recipe.intent.summary.trim().length > 0 &&
    recipe.source_identity?.content_identity === contentIdentity &&
    Array.isArray(recipe.limitations) &&
    recipe.limitations.every((limit) => typeof limit === "string") &&
    typeof recipe.readiness?.delivered === "string" &&
    typeof recipe.readiness.manual_review === "string" &&
    Array.isArray(recipe.readiness.pending_reviews) &&
    recipe.readiness.pending_reviews.every(
      (review) => typeof review === "string",
    )
    ? (recipe as WorkflowRecipe)
    : undefined;
}

function GuidanceContext({
  document,
  documentUrl,
  markdownUrl,
  recipeUrl,
  fileUrls,
  recipe,
}: {
  document: CanonicalDocument;
  documentUrl: string;
  markdownUrl: string;
  recipeUrl?: string;
  fileUrls: string[];
  recipe?: WorkflowRecipe;
}) {
  const sections = document.sections.filter((section) =>
    [
      "guidance",
      "prerequisites",
      "implementation",
      "adaptation",
      "acceptance",
    ].includes(section.purpose),
  );
  const intent = sections.find(
    (section) =>
      section.purpose === "guidance" && /when to use/iu.test(section.title),
  );
  const displayedSections = sections.filter((section) => section !== intent);
  const copyContext = useMemo(() => {
    const overview = sections.find((section) => section.purpose === "guidance");
    const absolute = (url: string) => new URL(url, window.location.origin).href;
    const chunks = [
      `Full guidance: ${absolute(documentUrl)}`,
      `Guidance Markdown: ${absolute(markdownUrl)}`,
      recipeUrl ? `Workflow recipe: ${absolute(recipeUrl)}` : "",
      `Reference: ${document.reference}`,
      document.title,
      `Readiness: ${document.readiness}`,
      overview
        ? `${overview.title}\n${overview.search_text}\n${overview.reference}`
        : "",
      ...fileUrls.map((url) => `Complete file: ${absolute(url)}`),
    ].filter(Boolean);
    const bounded: string[] = [];
    let bytes = 0;
    for (const chunk of chunks) {
      const nextBytes = new TextEncoder().encode(`${chunk}\n\n`).byteLength;
      if (bytes + nextBytes > 12_000) break;
      bounded.push(chunk);
      bytes += nextBytes;
    }
    return bounded.join("\n\n");
  }, [
    document.readiness,
    document.reference,
    document.title,
    documentUrl,
    fileUrls,
    markdownUrl,
    recipeUrl,
    sections,
  ]);
  const [copied, setCopied] = useState(false);

  return (
    <section className={styles.guidance} aria-label="Verified guidance">
      <h3>Verified guidance</h3>
      <p>Readiness: {document.readiness}</p>
      {intent && (
        <div className={styles.guidanceSummary}>
          <ReactMarkdown components={markdownComponents}>
            {intent.markdown}
          </ReactMarkdown>
        </div>
      )}
      {recipe && (
        <>
          <p>Workflow delivery: {recipe.readiness.delivered}</p>
          <p>Manual review: {recipe.readiness.manual_review}</p>
          <ul>
            {recipe.readiness.pending_reviews.map((review) => (
              <li key={review}>{review}</li>
            ))}
            {recipe.limitations.map((limitation) => (
              <li key={limitation}>{limitation}</li>
            ))}
          </ul>
        </>
      )}
      <div className={styles.guidanceActions}>
        <a download href={documentUrl}>
          Technical metadata (JSON)
        </a>
        <button
          onClick={() => {
            void navigator.clipboard
              .writeText(copyContext)
              .then(() => setCopied(true));
          }}
          type="button"
        >
          {copied ? "Copied context" : "Copy context"}
        </button>
      </div>
      {displayedSections.map((section, index) => (
        <details key={section.reference} open={index === 0}>
          <summary>{section.title}</summary>
          <ReactMarkdown components={markdownComponents}>
            {section.markdown}
          </ReactMarkdown>
          <a href={documentUrl}>{section.reference}</a>
        </details>
      ))}
    </section>
  );
}

function VerifiedFileViewer({ file }: { file: WorkflowFile }) {
  const [source, setSource] = useState<string>();
  const [failed, setFailed] = useState(false);
  const filename = file.path.split("/").at(-1) ?? "source.txt";

  const viewSource = () => {
    setFailed(false);
    void fetchVerifiedBytes(file)
      .then((bytes) => {
        setSource(new TextDecoder().decode(bytes));
        setFailed(false);
      })
      .catch(() => setFailed(true));
  };

  return (
    <li>
      <details>
        <summary>{file.path}</summary>
        <div className={styles.guidanceActions}>
          <a download={filename} href={file.url}>
            Download source
          </a>
          <button onClick={viewSource} type="button">
            View source
          </button>
        </div>
        {failed && <p>Verified source is unavailable.</p>}
        {source && <pre className={styles.source}>{source}</pre>}
      </details>
    </li>
  );
}

export function WorkflowPreview({
  registration,
}: {
  registration: WorkflowPreviewRegistration;
}) {
  const [loaded, setLoaded] = useState<LoadedWorkflow>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoaded(undefined);
    setFailed(false);
    void fetch(bootstrapPath, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Workflow development bootstrap unavailable");
        }
        const bootstrap = parseBootstrap(await response.json(), registration);
        if (!bootstrap)
          throw new Error("Workflow development bootstrap is invalid");
        const [recipeValue, guidanceValue] = await Promise.all([
          fetchVerifiedJson(bootstrap.workflow.recipe),
          fetchVerifiedJson(bootstrap.workflow.guidance.document),
        ]);
        const recipe = parseRecipe(
          recipeValue,
          registration,
          bootstrap.workflow.recipe.content_identity,
        );
        const guidance = parseCanonicalDocument(
          guidanceValue,
          registration.guideReference,
          bootstrap.workflow.guidance.content_identity,
        );
        if (!recipe || !guidance) {
          throw new Error("Workflow development resources are incoherent");
        }
        return { bootstrap, recipe, guidance };
      })
      .then((next) => {
        setLoaded(next);
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setFailed(true);
        }
      });
    return () => controller.abort();
  }, [registration]);

  return (
    <section className={styles.container} aria-label="Workflow preview">
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>
            Current development workflow: {registration.title}
          </h2>
          {loaded && (
            <>
              <p className={styles.workflowIntent}>
                {loaded.recipe.intent.summary}
              </p>
              <p className={styles.workflowIntent}>
                Workflow delivery: {loaded.recipe.readiness.delivered}; manual
                review: {loaded.recipe.readiness.manual_review}.
              </p>
            </>
          )}
        </div>
      </div>
      {!loaded && (
        <p className={styles.status} aria-live="polite">
          {failed
            ? "The verified development workflow is unavailable."
            : "Loading verified development workflow…"}
        </p>
      )}
      {loaded && (
        <>
          <iframe
            className={styles.frame}
            data-testid="workflow-preview-frame"
            sandbox="allow-forms allow-same-origin allow-scripts"
            src={loaded.bootstrap.workflow.preview.url}
            title={`${registration.title} workflow preview`}
          />
          <GuidanceContext
            document={loaded.guidance}
            documentUrl={loaded.bootstrap.workflow.guidance.document.url}
            markdownUrl={loaded.bootstrap.workflow.guidance.url}
            recipeUrl={loaded.bootstrap.workflow.recipe.url}
            fileUrls={loaded.bootstrap.workflow.files.map((file) => file.url)}
            recipe={loaded.recipe}
          />
          <div className={styles.resources}>
            <h3>Verified development resources</h3>
            <ul>
              <li>
                <a download href={loaded.bootstrap.workflow.recipe.url}>
                  Workflow recipe
                </a>
              </li>
              <li>
                <a download href={loaded.bootstrap.workflow.guidance.url}>
                  Workflow guidance Markdown
                </a>
              </li>
              <li>
                <a
                  download
                  href={loaded.bootstrap.workflow.guidance.document.url}
                >
                  Workflow guidance document
                </a>
              </li>
              <li>
                <a download href={loaded.bootstrap.button.guidance.url}>
                  Button loading Markdown
                </a>
              </li>
              <li>
                <a
                  download
                  href={loaded.bootstrap.button.guidance.document.url}
                >
                  Button loading document
                </a>
              </li>
              {loaded.bootstrap.workflow.files.map((file) => (
                <VerifiedFileViewer file={file} key={file.path} />
              ))}
              {loaded.bootstrap.button.files.map((file) => (
                <VerifiedFileViewer file={file} key={`button-${file.path}`} />
              ))}
            </ul>
          </div>
        </>
      )}
    </section>
  );
}

export function ButtonLoadingResources() {
  const registration = Object.values(workflowPreviewByRoute)[0];
  const [bootstrap, setBootstrap] = useState<DevelopmentBootstrap>();
  const [guidance, setGuidance] = useState<CanonicalDocument>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!registration) return;
    const controller = new AbortController();
    void fetch(bootstrapPath, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok)
          throw new Error("Workflow development bootstrap unavailable");
        const next = parseBootstrap(await response.json(), registration);
        if (!next) throw new Error("Workflow development bootstrap is invalid");
        const document = parseCanonicalDocument(
          await fetchVerifiedJson(next.button.guidance.document),
          "record:guide:guide.button.loading",
          next.button.guidance.content_identity,
        );
        if (!document) throw new Error("Button guidance is incoherent");
        return { bootstrap: next, guidance: document };
      })
      .then((loaded) => {
        if (controller.signal.aborted) return;
        setBootstrap(loaded.bootstrap);
        setGuidance(loaded.guidance);
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => controller.abort();
  }, [registration]);

  if (!registration) return null;
  return (
    <section className={styles.container} aria-label="Button loading resources">
      <div className={styles.resources}>
        <h3>Verified Button loading resources</h3>
        {!bootstrap || !guidance ? (
          <p className={styles.status} role="status">
            {failed
              ? "The verified Button resources are unavailable."
              : "Loading verified Button resources…"}
          </p>
        ) : (
          <ul>
            <li>
              <a download href={bootstrap.button.guidance.url}>
                Button loading Markdown
              </a>
            </li>
            <li>
              <a download href={bootstrap.button.guidance.document.url}>
                Button loading document
              </a>
            </li>
            {bootstrap.button.files.map((file) => (
              <VerifiedFileViewer file={file} key={file.path} />
            ))}
          </ul>
        )}
      </div>
      {bootstrap && guidance && (
        <GuidanceContext
          document={guidance}
          documentUrl={bootstrap.button.guidance.document.url}
          markdownUrl={bootstrap.button.guidance.url}
          fileUrls={bootstrap.button.files.map((file) => file.url)}
        />
      )}
    </section>
  );
}
