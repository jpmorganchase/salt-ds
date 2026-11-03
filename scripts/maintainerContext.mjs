import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const scope =
  "Local Git snapshot only. Tracking refs may be stale; no fetch, GitHub/CI lookup or verification was performed.";

function git(cwd, args, optional = false) {
  const result = spawnSync("git", ["--no-pager", ...args], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" },
    maxBuffer: 16 * 1024 * 1024,
  });
  if (result.error) {
    throw new Error(`Cannot run Git: ${result.error.message}`);
  }
  if (result.status !== 0) {
    if (optional) return null;
    throw new Error(result.stderr.trim() || "Git command failed.");
  }
  return result.stdout;
}

function files(output) {
  return output.split("\0").filter(Boolean);
}

function unique(values) {
  return [...new Set(values)].sort();
}

function diffFiles(root, refs) {
  return files(
    git(root, [
      "diff",
      "--name-only",
      "--no-renames",
      "--no-ext-diff",
      "--no-textconv",
      "--ignore-submodules=none",
      "-z",
      ...refs,
      "--",
    ]),
  );
}

function guidanceFor(changedFiles) {
  const guidance = [
    {
      path: ".github/maintainer-workflow.md",
      reason:
        "Recover the contract and PR evidence, then choose relevant checks.",
    },
    {
      path: "CONTRIBUTING.md",
      reason: "Use the existing setup, contribution rules and commands.",
    },
  ];
  const routes = [
    [
      /^(packages\/icons\/|scripts\/makeSynonym\.mjs$|site\/src\/components\/icon-preview\/)/,
      "CONTRIBUTING.md#how-to-add-a-new-icon",
      "Follow the icon asset, generation, synonym and verification procedure.",
    ],
    [
      /^(packages\/[^/]+\/src\/.*\.tsx?$|test\/consumer-types\/|scripts\/(typecheck|checkConsumerTypes))/,
      "CONTRIBUTING.md#supporting-react-16-to-19",
      "Check compatibility when implementation or public types change.",
    ],
    [
      /^packages\/[^/]+\/src\/(?!__tests__\/).*\.tsx$/,
      "CONTRIBUTING.md#render-prop-support",
      "Consult this when the change affects public rendering or composition.",
    ],
    [
      /^packages\/theme\//,
      "CONTRIBUTING.md#theming",
      "Follow token ownership, documentation and deprecation requirements.",
    ],
    [
      /(\.css$|\.stories\.[jt]sx?$|^site\/src\/examples\/)/,
      "CONTRIBUTING.md#chromatic",
      "Select visual checks when the change affects appearance or layout.",
    ],
    [
      /^(package\.json$|yarn\.lock$|packages\/[^/]+\/package\.json$|scripts\/|\.github\/workflows\/)/,
      ".github/workflows/test.yml",
      "Inspect the existing build, type, package and test lanes before choosing checks.",
    ],
  ];
  for (const [pattern, path, reason] of routes) {
    if (changedFiles.some((file) => pattern.test(file))) {
      guidance.push({ path, reason });
    }
  }
  return guidance;
}

export function collectContext(cwd = process.cwd(), baseRef = "origin/main") {
  const root = git(cwd, ["rev-parse", "--show-toplevel"]).trimEnd();
  const head = git(
    root,
    ["rev-parse", "--verify", "HEAD^{commit}"],
    true,
  )?.trim();
  if (!head) throw new Error("The repository has no committed HEAD.");
  const baseSha = git(
    root,
    ["rev-parse", "--verify", "--end-of-options", `${baseRef}^{commit}`],
    true,
  )?.trim();
  if (!baseSha) {
    throw new Error(
      `Base ref ${JSON.stringify(baseRef)} is not available locally. Fetch the intended base or pass --base <local-ref>.`,
    );
  }
  const mergeBase = git(root, ["merge-base", baseSha, head], true)?.trim();
  if (!mergeBase) {
    throw new Error(
      `HEAD and ${JSON.stringify(baseRef)} have no common ancestor.`,
    );
  }
  const branch =
    git(root, ["symbolic-ref", "--quiet", "--short", "HEAD"], true)?.trim() ||
    null;
  const committedFiles = unique(diffFiles(root, [mergeBase, head]));
  // Read staged and unstaged changes separately: they can cancel in a diff of HEAD.
  const dirtyFiles = unique([
    ...diffFiles(root, ["--cached", head]),
    ...diffFiles(root, []),
    ...files(git(root, ["ls-files", "--others", "--exclude-standard", "-z"])),
  ]);
  const changedFiles = unique([...committedFiles, ...dirtyFiles]);
  let upstream = null;
  const upstreamRef = branch
    ? git(root, [
        "for-each-ref",
        "--format=%(upstream:short)",
        `refs/heads/${branch}`,
      ]).trim()
    : "";
  if (upstreamRef) {
    const upstreamSha = git(
      root,
      ["rev-parse", "--verify", "--end-of-options", `${upstreamRef}^{commit}`],
      true,
    )?.trim();
    const counts = upstreamSha
      ? git(root, [
          "rev-list",
          "--left-right",
          "--count",
          `${head}...${upstreamSha}`,
        ])
          .trim()
          .split(/\s+/)
          .map(Number)
      : [null, null];
    upstream = { ref: upstreamRef, ahead: counts[0], behind: counts[1] };
  }
  return {
    root,
    branch,
    head,
    base: { ref: baseRef, sha: baseSha, mergeBase },
    upstream,
    dirty: dirtyFiles.length > 0,
    committedFiles,
    dirtyFiles,
    changedFiles,
    guidance: guidanceFor(changedFiles),
    scope,
  };
}

export function formatContext(context) {
  const quote = JSON.stringify;
  const upstream = context.upstream;
  return [
    "Local maintainer context",
    `Repository: ${quote(context.root)}`,
    `Branch: ${context.branch === null ? "(detached HEAD)" : quote(context.branch)}`,
    `HEAD: ${context.head}`,
    `Base: ${quote(context.base.ref)} (${context.base.sha})`,
    `Merge base: ${context.base.mergeBase}`,
    `Working tree: ${context.dirty ? "has staged, unstaged or untracked changes" : "clean"}`,
    upstream === null
      ? "Local upstream: not configured"
      : upstream.ahead === null
        ? `Local upstream: ${quote(upstream.ref)} (tracking ref unavailable locally)`
        : `Local upstream: ${quote(upstream.ref)}; ahead ${upstream.ahead}, behind ${upstream.behind}`,
    "",
    `Changed files (${context.changedFiles.length}; branch commits and working tree):`,
    ...(context.changedFiles.length
      ? context.changedFiles.map((file) => `- ${quote(file)}`)
      : ["- None"]),
    "",
    "Guidance to consider (path hints, not a complete verification plan):",
    ...context.guidance.map(({ path, reason }) => `- ${path}: ${reason}`),
    "",
    context.scope,
  ].join("\n");
}

function main(args) {
  let baseRef = "origin/main";
  let json = false;
  let help = false;
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === "--help" || arg === "-h") help = true;
    else if (arg === "--json") json = true;
    else if (arg === "--base") {
      baseRef = args[++index];
      if (!baseRef || baseRef.startsWith("-")) {
        throw new Error("--base needs a local ref.");
      }
    } else
      throw new Error(`Unknown argument ${JSON.stringify(arg)}. Use --help.`);
  }
  if (help) {
    console.log(
      "Usage: node scripts/maintainerContext.mjs [--base <local-ref>] [--json]\n\n" +
        "Default base: origin/main. Compares from the merge base and includes staged, unstaged and untracked files.\n" +
        "Run from any directory in the checkout. Requires Node.js and Git; no installed packages.\n\n" +
        scope,
    );
    return;
  }
  const context = collectContext(process.cwd(), baseRef);
  console.log(json ? JSON.stringify(context, null, 2) : formatContext(context));
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(`maintainer:context: ${error.message}`);
    process.exitCode = 1;
  }
}
