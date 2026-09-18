import { Buffer } from "node:buffer";

const SHA256_PATTERN = /^sha256:[0-9a-f]{64}$/u;
const ROOT_TOKEN_PATTERN = /^[A-Za-z0-9_-]+$/u;
export const MAX_PROJECT_POLICY_ROOT_TOKEN_CHARS = 24_576;
export const MAX_PROJECT_POLICY_RESOURCE_ID_CHARS = 256;
export const MAX_PROJECT_POLICY_ENCODED_RESOURCE_ID_CHARS = 1_024;

export type ProjectPolicyResourceKind = "manifest" | "chunk" | "claim";

export function projectPolicyRootToken(rootDir: string): string {
  const token = Buffer.from(rootDir, "utf8").toString("base64url");
  if (
    token.length === 0 ||
    token.length > MAX_PROJECT_POLICY_ROOT_TOKEN_CHARS
  ) {
    throw new Error(
      `Project-policy root tokens cannot exceed ${MAX_PROJECT_POLICY_ROOT_TOKEN_CHARS} characters.`,
    );
  }
  return token;
}

export function decodeProjectPolicyRootToken(token: string): string | null {
  if (
    token.length === 0 ||
    token.length > MAX_PROJECT_POLICY_ROOT_TOKEN_CHARS ||
    !ROOT_TOKEN_PATTERN.test(token)
  ) {
    return null;
  }
  try {
    const bytes = Buffer.from(token, "base64url");
    if (bytes.toString("base64url") !== token) return null;
    const rootDir = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return projectPolicyRootToken(rootDir) === token ? rootDir : null;
  } catch {
    return null;
  }
}

function digestSegment(digest: string): string {
  if (!SHA256_PATTERN.test(digest)) {
    throw new Error(`Invalid project-policy digest '${digest}'.`);
  }
  return digest.replace("sha256:", "sha256-");
}

export function projectPolicyResourceUri(input: {
  rootDir: string;
  digest: string;
  kind: ProjectPolicyResourceKind;
  id?: string;
}): string {
  const prefix = `salt://project-policy/v2/${projectPolicyRootToken(input.rootDir)}/${digestSegment(input.digest)}`;
  if (input.kind === "manifest") return `${prefix}/manifest/index`;
  if (!input.id) {
    throw new Error(`Project-policy ${input.kind} resources require an id.`);
  }
  if (input.id.length > MAX_PROJECT_POLICY_RESOURCE_ID_CHARS) {
    throw new Error(
      `Project-policy resource ids cannot exceed ${MAX_PROJECT_POLICY_RESOURCE_ID_CHARS} characters.`,
    );
  }
  const encodedId = encodeURIComponent(input.id);
  if (encodedId.length > MAX_PROJECT_POLICY_ENCODED_RESOURCE_ID_CHARS) {
    throw new Error(
      `Encoded project-policy resource ids cannot exceed ${MAX_PROJECT_POLICY_ENCODED_RESOURCE_ID_CHARS} characters.`,
    );
  }
  return `${prefix}/${input.kind}/${encodedId}`;
}

export function projectPolicyResourceTemplate(): string {
  return "salt://project-policy/v2/{root}/{digest}/{kind}/{id}";
}
