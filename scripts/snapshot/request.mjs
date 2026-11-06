/**
 * Snapshot releases: turning a request into a release run, and reporting back.
 *
 * npm refuses trusted-publishing token exchanges for `issue_comment` runs, so
 * a `/snapshot-release` comment can't publish anything itself. Instead
 * `.github/workflows/snapshot-release.yml` calls `requestSnapshotRelease`,
 * which checks the request and starts `release.yml` with `workflow_dispatch`.
 * The dispatched run calls `checkSnapshotDispatch` before it builds anything,
 * and `reportSnapshotRelease` at the end.
 *
 * Only people with write access can publish snapshots: the comment path
 * checks the commenter's permission here, and GitHub only lets people with
 * write access start a `workflow_dispatch` run.
 */

export const SNAPSHOT_COMMANDS = ["/snapshot-release", "/release-pr"];

// `permission` reports maintainers as `write` and triagers as `read`.
const WRITE_PERMISSIONS = new Set(["admin", "maintain", "write"]);

const COMMAND_PATTERN = new RegExp(
  `^(${SNAPSHOT_COMMANDS.map((command) => command.replace("/", "\\/")).join("|")})(\\s|$)`,
);

export function isSnapshotCommand(body) {
  return COMMAND_PATTERN.test(String(body ?? ""));
}

/** `/snapshot-release --dry-run` checks everything without publishing. */
export function wantsDryRun(body) {
  const [command] = String(body ?? "").split(/\r?\n/, 1);
  return /(^|\s)--dry-run(\s|$)/.test(command);
}

export function hasWriteAccess(permission) {
  return WRITE_PERMISSIONS.has(permission);
}

/** Snapshot releases only build open pull requests from this repository. */
export function checkPullRequest(pullRequest, repository) {
  if (pullRequest.state !== "open") {
    return {
      ok: false,
      reason: "Snapshot releases are only published from open pull requests.",
    };
  }
  if (pullRequest.head?.repo?.full_name !== repository) {
    return {
      ok: false,
      reason: "Snapshot releases are not published from forks.",
    };
  }
  return { ok: true, sha: pullRequest.head.sha };
}

function shortSha(sha) {
  return String(sha).slice(0, 7);
}

/** Called by `snapshot-release.yml` for every comment that starts with a command. */
export async function requestSnapshotRelease({ github, context, core }) {
  const { owner, repo } = context.repo;
  const { comment, issue, repository } = context.payload;
  if (!issue?.pull_request || !isSnapshotCommand(comment?.body)) {
    core.info("Not a snapshot release request.");
    return { requested: false };
  }

  const username = comment.user.login;
  const refuse = async (reason) => {
    await github.rest.issues.createComment({
      owner,
      repo,
      issue_number: issue.number,
      body: `Snapshot release not started: ${reason}`,
    });
    core.setFailed(reason);
    return { requested: false, reason };
  };

  let permission;
  try {
    ({
      data: { permission },
    } = await github.rest.repos.getCollaboratorPermissionLevel({
      owner,
      repo,
      username,
    }));
  } catch (error) {
    return refuse(
      `could not check @${username}'s permissions (${error.status ?? error.message}).`,
    );
  }
  if (!hasWriteAccess(permission)) {
    return refuse(`@${username} needs write access to this repository.`);
  }

  let pullRequest;
  try {
    ({ data: pullRequest } = await github.rest.pulls.get({
      owner,
      repo,
      pull_number: issue.number,
    }));
  } catch (error) {
    return refuse(
      `could not read the pull request (${error.status ?? error.message}).`,
    );
  }
  const check = checkPullRequest(pullRequest, `${owner}/${repo}`);
  if (!check.ok) {
    return refuse(check.reason);
  }

  await github.rest.reactions.createForIssueComment({
    owner,
    repo,
    comment_id: comment.id,
    content: "eyes",
  });
  // `sha` pins the commit that was current when the request was made: the
  // release run refuses to build if the branch has moved since.
  const dryRun = wantsDryRun(comment.body);
  const { data: dispatch } = await github.rest.actions.createWorkflowDispatch({
    owner,
    repo,
    workflow_id: "release.yml",
    ref: repository?.default_branch ?? "main",
    inputs: {
      pull_request: String(issue.number),
      sha: check.sha,
      comment_id: String(comment.id),
      dry_run: String(dryRun),
    },
  });
  const runLink = dispatch?.html_url
    ? `[View workflow run](${dispatch.html_url})`
    : `[Release workflow runs](https://github.com/${owner}/${repo}/actions/workflows/release.yml)`;
  await github.rest.issues.createComment({
    owner,
    repo,
    issue_number: issue.number,
    body: `Snapshot release ${dryRun ? "dry run " : ""}requested for \`${shortSha(check.sha)}\`.\n\n${runLink}`,
  });
  return { requested: true, sha: check.sha, dryRun };
}

/** First job of a dispatched snapshot run: is the request still valid? */
export async function checkSnapshotDispatch({
  github,
  context,
  pullRequest,
  expectedSha,
}) {
  const { owner, repo } = context.repo;
  if (!/^\d+$/.test(String(pullRequest ?? ""))) {
    return {
      ok: false,
      reason: `"${pullRequest}" is not a pull request number.`,
    };
  }
  if (expectedSha && !/^[0-9a-f]{40}$/.test(expectedSha)) {
    return { ok: false, reason: `"${expectedSha}" is not a full commit SHA.` };
  }

  let data;
  try {
    ({ data } = await github.rest.pulls.get({
      owner,
      repo,
      pull_number: Number(pullRequest),
    }));
  } catch (error) {
    return {
      ok: false,
      reason: `Could not read pull request #${pullRequest} (${error.status ?? error.message}).`,
    };
  }
  const check = checkPullRequest(data, `${owner}/${repo}`);
  if (!check.ok) {
    return check;
  }
  if (expectedSha && expectedSha !== check.sha) {
    return {
      ok: false,
      reason:
        `Pull request #${pullRequest} moved from \`${shortSha(expectedSha)}\` to ` +
        `\`${shortSha(check.sha)}\` after the snapshot was requested. Request it again.`,
    };
  }
  return check;
}

/** The comment posted on the pull request when a snapshot run finishes. */
export function formatSnapshotReport({
  result,
  published,
  dryRun,
  noChangesets,
  sha,
  runUrl,
}) {
  const commit = sha ? ` for \`${shortSha(sha)}\`` : "";
  const runLink = `[View workflow run](${runUrl})`;
  if (noChangesets) {
    return (
      `Snapshot release finished${commit}, but no packages were published: ` +
      `the pull request has no changesets.\n\n${runLink}`
    );
  }
  if (result !== "success") {
    return `Snapshot release failed${commit}.\n\n${runLink}`;
  }
  if (dryRun) {
    return (
      `Snapshot release dry run passed${commit}. Nothing was published; ` +
      "npm accepted the trusted-publishing token for:\n\n" +
      published.map((tag) => `- \`${tag}\``).join("\n") +
      `\n\n${runLink}`
    );
  }
  const multiple = published.length > 1;
  return (
    `Snapshot release completed${commit}.\n\n` +
    `🫰✨ **Your snapshot${multiple ? "s have" : " has"} been published to npm.**\n\n` +
    `Test the snapshot${multiple ? "s" : ""} by updating your \`package.json\` ` +
    `with the newly published version${multiple ? "s" : ""}:\n` +
    published.map((tag) => `\`\`\`sh\nyarn add ${tag}\n\`\`\``).join("\n") +
    `\n\n${runLink}`
  );
}

/** Last job of a dispatched snapshot run: comment and react on the pull request. */
export async function reportSnapshotRelease({
  github,
  context,
  core,
  pullRequest,
  commentId,
  sha,
  result,
  published,
  dryRun,
  noChangesets = false,
}) {
  const { owner, repo } = context.repo;
  if (!/^\d+$/.test(String(pullRequest ?? ""))) {
    core.info(`Not reporting: "${pullRequest}" is not a pull request number.`);
    return;
  }
  const tags = String(published ?? "")
    .split("\n")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const succeeded = !noChangesets && result === "success" && tags.length > 0;
  const runUrl = `${context.serverUrl}/${owner}/${repo}/actions/runs/${context.runId}`;

  await github.rest.issues.createComment({
    owner,
    repo,
    issue_number: Number(pullRequest),
    body: formatSnapshotReport({
      result: succeeded ? "success" : "failure",
      published: tags,
      dryRun,
      noChangesets,
      sha,
      runUrl,
    }),
  });
  if (!noChangesets && /^\d+$/.test(String(commentId ?? ""))) {
    await github.rest.reactions.createForIssueComment({
      owner,
      repo,
      comment_id: Number(commentId),
      content: succeeded ? "rocket" : "confused",
    });
  }
}
