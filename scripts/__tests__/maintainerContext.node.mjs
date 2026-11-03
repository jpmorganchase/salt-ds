import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(
  new URL("../maintainerContext.mjs", import.meta.url),
);
const env = {
  ...process.env,
  GIT_CONFIG_NOSYSTEM: "1",
  GIT_CONFIG_GLOBAL: process.platform === "win32" ? "NUL" : "/dev/null",
  GIT_AUTHOR_NAME: "Maintainer test",
  GIT_AUTHOR_EMAIL: "maintainer@example.invalid",
  GIT_COMMITTER_NAME: "Maintainer test",
  GIT_COMMITTER_EMAIL: "maintainer@example.invalid",
};

function git(cwd, ...args) {
  const result = spawnSync("git", ["-c", "commit.gpgsign=false", ...args], {
    cwd,
    env,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr || `git ${args.join(" ")}`);
  return result.stdout.trim();
}

function write(root, name, content = "content\n") {
  const file = path.join(root, name);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content);
}

function fixture(t, { initialCommit = true } = {}) {
  const parent = mkdtempSync(path.join(tmpdir(), "salt-maintainer-"));
  const root = path.join(parent, "repository");
  mkdirSync(root);
  t.after(() => rmSync(parent, { recursive: true, force: true }));
  git(root, "init", "-b", "main");
  if (initialCommit) {
    write(root, "README.md", "baseline\n");
    write(root, ".gitignore", "ignored/\n");
    git(root, "add", ".");
    git(root, "commit", "-m", "Baseline");
    git(root, "update-ref", "refs/remotes/origin/main", "HEAD");
    git(root, "switch", "-c", "pilot");
  }
  return { root, parent };
}

function run(cwd, args = []) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd,
    env,
    encoding: "utf8",
  });
}

function context(cwd, args = []) {
  const result = run(cwd, [...args, "--json"]);
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

test("reports a clean branch against the explicit default base", (t) => {
  const { root } = fixture(t);
  const value = context(root);
  assert.equal(value.root, root);
  assert.equal(value.branch, "pilot");
  assert.equal(value.head, git(root, "rev-parse", "HEAD"));
  assert.equal(value.base.ref, "origin/main");
  assert.equal(value.base.sha, value.head);
  assert.equal(value.base.mergeBase, value.head);
  assert.equal(value.dirty, false);
  assert.equal(value.upstream, null);
  assert.deepEqual(value.changedFiles, []);
  assert.match(value.scope, /local/i);
});

test("includes committed, staged, unstaged and untracked paths without changing the worktree", (t) => {
  const { root } = fixture(t);
  write(root, "committed.txt");
  git(root, "add", "committed.txt");
  git(root, "commit", "-m", "Add committed change");
  write(root, "staged.txt");
  git(root, "add", "staged.txt");
  write(root, "README.md", "unstaged\n");
  write(root, "untracked with spaces.txt");
  write(root, "ignored/private.txt", "must remain ignored\n");
  const before = git(root, "status", "--porcelain=v1", "-z");
  const value = context(root);
  assert.deepEqual(value.changedFiles, [
    "README.md",
    "committed.txt",
    "staged.txt",
    "untracked with spaces.txt",
  ]);
  assert.deepEqual(value.committedFiles, ["committed.txt"]);
  assert.deepEqual(value.dirtyFiles, [
    "README.md",
    "staged.txt",
    "untracked with spaces.txt",
  ]);
  assert.equal(value.dirty, true);
  assert.equal(git(root, "status", "--porcelain=v1", "-z"), before);
  assert.equal(
    readFileSync(path.join(root, "README.md"), "utf8"),
    "unstaged\n",
  );
});

test("uses the merge base so changes made only on main are excluded", (t) => {
  const { root } = fixture(t);
  const shared = git(root, "rev-parse", "HEAD");
  write(root, "branch-only.txt");
  git(root, "add", "branch-only.txt");
  git(root, "commit", "-m", "Branch work");
  git(root, "switch", "main");
  write(root, "main-only.txt");
  git(root, "add", "main-only.txt");
  git(root, "commit", "-m", "Main work");
  git(root, "switch", "pilot");
  const value = context(root, ["--base", "main"]);
  assert.equal(value.base.mergeBase, shared);
  assert.notEqual(value.base.sha, shared);
  assert.deepEqual(value.changedFiles, ["branch-only.txt"]);
});

test("retains both sides of a committed rename and a staged deletion", (t) => {
  const { root } = fixture(t);
  git(root, "mv", "README.md", "renamed file.md");
  git(root, "commit", "-m", "Rename");
  git(root, "rm", ".gitignore");
  assert.deepEqual(context(root).changedFiles, [
    ".gitignore",
    "README.md",
    "renamed file.md",
  ]);
});

test("preserves unusual paths and escapes them in human output", {
  skip: process.platform === "win32",
}, (t) => {
  const { root } = fixture(t);
  const name = "untracked\nwith\ttabs.txt";
  write(root, name);
  assert.deepEqual(context(root).changedFiles, [name]);
  const result = run(root);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.stdout.includes(JSON.stringify(name)));
});

test("works from a subdirectory and does not restrict changes to it", (t) => {
  const { root } = fixture(t);
  write(root, "packages/icons/example.svg");
  write(root, "elsewhere.txt");
  const value = context(path.join(root, "packages/icons"));
  assert.equal(value.root, root);
  assert.deepEqual(value.changedFiles, [
    "elsewhere.txt",
    "packages/icons/example.svg",
  ]);
  assert.ok(
    value.guidance.some(({ path: guide }) =>
      guide.includes("#how-to-add-a-new-icon"),
    ),
  );
});

test("supports linked worktrees and detached HEAD", (t) => {
  const { root, parent } = fixture(t);
  const linked = path.join(parent, "linked");
  git(root, "worktree", "add", "--detach", linked, "HEAD");
  write(linked, "worktree-only.txt");
  const value = context(linked, ["--base", "main"]);
  assert.equal(value.root, linked);
  assert.equal(value.branch, null);
  assert.deepEqual(value.changedFiles, ["worktree-only.txt"]);
  assert.deepEqual(context(root).changedFiles, []);
});

test("reports divergence against the local tracking ref", (t) => {
  const { root, parent } = fixture(t);
  git(root, "remote", "add", "origin", path.join(parent, "unused-remote"));
  git(root, "update-ref", "refs/remotes/origin/pilot", "HEAD");
  git(root, "branch", "--set-upstream-to=origin/pilot");
  write(root, "local.txt");
  git(root, "add", "local.txt");
  git(root, "commit", "-m", "Local commit");
  const value = context(root);
  assert.match(value.upstream.ref, /origin\/pilot$/);
  assert.equal(value.upstream.ahead, 1);
  assert.equal(value.upstream.behind, 0);
  assert.match(run(root).stdout, /local|fetch/i);
});

test("does not report a deleted tracking ref as synchronised", (t) => {
  const { root, parent } = fixture(t);
  git(root, "remote", "add", "origin", path.join(parent, "unused-remote"));
  git(root, "update-ref", "refs/remotes/origin/pilot", "HEAD");
  git(root, "branch", "--set-upstream-to=origin/pilot");
  git(root, "update-ref", "-d", "refs/remotes/origin/pilot");
  const value = context(root);
  assert.ok(value.upstream);
  assert.match(value.upstream.ref, /origin\/pilot$/);
  assert.equal(value.upstream.ahead, null);
  assert.equal(value.upstream.behind, null);
});

test("fails clearly for a missing base instead of silently comparing another ref", (t) => {
  const { root } = fixture(t);
  git(root, "update-ref", "-d", "refs/remotes/origin/main");
  const result = run(root, ["--json"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /origin\/main/);
  assert.equal(result.stdout, "");
  assert.equal(context(root, ["--base", "main"]).base.ref, "main");
});

test("passes base names as arguments without executing shell syntax", (t) => {
  const { root } = fixture(t);
  const result = run(root, ["--base", "main; touch injected-marker", "--json"]);
  assert.notEqual(result.status, 0);
  assert.equal(existsSync(path.join(root, "injected-marker")), false);
});

test("rejects unknown arguments and a missing base value", (t) => {
  const { root } = fixture(t);
  for (const args of [["--unknown"], ["--base"], ["unexpected"]]) {
    const result = run(root, args);
    assert.notEqual(result.status, 0);
    assert.ok(result.stderr.length > 0);
  }
});

test("shows help without requiring a git repository", (t) => {
  const { parent } = fixture(t);
  const result = run(parent, ["--help"]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /--base/);
  assert.match(result.stdout, /--json/);
});

test("fails clearly outside a repository or before the initial commit", (t) => {
  const { root, parent } = fixture(t, { initialCommit: false });
  for (const cwd of [root, parent]) {
    const result = run(cwd, ["--json"]);
    assert.notEqual(result.status, 0);
    assert.ok(result.stderr.length > 0);
    assert.equal(result.stdout, "");
  }
});
