import { describe, expect, it, vi } from "vitest";

import {
  checkSnapshotDispatch,
  isSnapshotCommand,
  reportSnapshotRelease,
  requestSnapshotRelease,
  wantsDryRun,
} from "../request.mjs";

const SHA = "a".repeat(40);

function pullRequest(overrides = {}) {
  return {
    state: "open",
    head: { sha: SHA, repo: { full_name: "jpmorganchase/salt-ds" } },
    ...overrides,
  };
}

const FORK = pullRequest({
  head: { sha: SHA, repo: { full_name: "someone/salt-ds" } },
});
const DELETED_FORK = pullRequest({ head: { sha: SHA, repo: null } });
const CLOSED = pullRequest({ state: "closed" });

function mockGithub({
  permission = "write",
  permissionError,
  pr = pullRequest(),
  dispatchData = {},
} = {}) {
  return {
    rest: {
      repos: {
        getCollaboratorPermissionLevel: vi.fn(async () => {
          if (permissionError) throw permissionError;
          return { data: { permission } };
        }),
      },
      pulls: { get: vi.fn(async () => ({ data: pr })) },
      issues: { createComment: vi.fn(async () => ({})) },
      reactions: { createForIssueComment: vi.fn(async () => ({})) },
      actions: {
        createWorkflowDispatch: vi.fn(async () => ({ data: dispatchData })),
      },
    },
  };
}

function commentContext({
  body = "/snapshot-release",
  onPullRequest = true,
} = {}) {
  return {
    repo: { owner: "jpmorganchase", repo: "salt-ds" },
    serverUrl: "https://github.com",
    runId: 42,
    payload: {
      comment: { id: 1001, body, user: { login: "someone" } },
      issue: { number: 7, ...(onPullRequest ? { pull_request: {} } : {}) },
      repository: { default_branch: "main" },
    },
  };
}

const mockCore = () => ({ info: vi.fn(), setFailed: vi.fn() });

describe("snapshot release commands", () => {
  it("recognises the command only at the start of a comment", () => {
    expect(isSnapshotCommand("/snapshot-release")).toBe(true);
    expect(isSnapshotCommand("/release-pr please")).toBe(true);
    expect(isSnapshotCommand("/snapshot-releases")).toBe(false);
    expect(isSnapshotCommand("please /snapshot-release")).toBe(false);
  });

  it("reads --dry-run from the command line only", () => {
    expect(wantsDryRun("/snapshot-release --dry-run")).toBe(true);
    expect(wantsDryRun("/snapshot-release")).toBe(false);
    expect(wantsDryRun("/snapshot-release\nnot --dry-run")).toBe(false);
  });
});

describe("requestSnapshotRelease", () => {
  it("dispatches release.yml, pinned to the head commit, for a commenter with write access", async () => {
    const github = mockGithub();

    const result = await requestSnapshotRelease({
      github,
      context: commentContext(),
      core: mockCore(),
    });

    expect(result).toEqual({ requested: true, sha: SHA, dryRun: false });
    expect(github.rest.actions.createWorkflowDispatch).toHaveBeenCalledWith({
      owner: "jpmorganchase",
      repo: "salt-ds",
      workflow_id: "release.yml",
      ref: "main",
      inputs: {
        pull_request: "7",
        sha: SHA,
        comment_id: "1001",
        dry_run: "false",
      },
    });
  });

  it("links the request comment to the dispatched run when GitHub returns it", async () => {
    const htmlUrl = "https://github.com/jpmorganchase/salt-ds/actions/runs/99";
    for (const [dispatchData, link] of [
      [{ html_url: htmlUrl }, `[View workflow run](${htmlUrl})`],
      [{}, "/actions/workflows/release.yml)"],
    ]) {
      const github = mockGithub({ dispatchData });
      await requestSnapshotRelease({
        github,
        context: commentContext(),
        core: mockCore(),
      });
      expect(github.rest.issues.createComment).toHaveBeenCalledWith(
        expect.objectContaining({ body: expect.stringContaining(link) }),
      );
    }
  });

  it("passes --dry-run on to the release run", async () => {
    const github = mockGithub();
    await requestSnapshotRelease({
      github,
      context: commentContext({ body: "/snapshot-release --dry-run" }),
      core: mockCore(),
    });
    expect(github.rest.actions.createWorkflowDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        inputs: expect.objectContaining({ dry_run: "true" }),
      }),
    );
  });

  it.each([
    ["read permission", { permission: "read" }],
    ["triage permission", { permission: "triage" }],
    ["no permission", { permission: "none" }],
    [
      "a failed permission check",
      {
        permissionError: Object.assign(new Error("Not Found"), { status: 404 }),
      },
    ],
    ["a fork", { pr: FORK }],
    ["a closed pull request", { pr: CLOSED }],
  ])("never dispatches for %s", async (_, options) => {
    const github = mockGithub(options);
    const core = mockCore();

    const result = await requestSnapshotRelease({
      github,
      context: commentContext(),
      core,
    });

    expect(result.requested).toBe(false);
    expect(github.rest.actions.createWorkflowDispatch).not.toHaveBeenCalled();
    expect(github.rest.issues.createComment).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.stringContaining("Snapshot release not started"),
      }),
    );
    expect(core.setFailed).toHaveBeenCalled();
  });

  it("ignores issues and comments that are not commands", async () => {
    for (const context of [
      commentContext({ onPullRequest: false }),
      commentContext({ body: "can someone run /snapshot-release?" }),
    ]) {
      const github = mockGithub();
      await requestSnapshotRelease({ github, context, core: mockCore() });
      expect(
        github.rest.repos.getCollaboratorPermissionLevel,
      ).not.toHaveBeenCalled();
      expect(github.rest.actions.createWorkflowDispatch).not.toHaveBeenCalled();
    }
  });
});

describe("checkSnapshotDispatch", () => {
  const context = commentContext();

  it("returns the head commit of an open pull request from this repository", async () => {
    await expect(
      checkSnapshotDispatch({
        github: mockGithub(),
        context,
        pullRequest: "7",
        expectedSha: SHA,
      }),
    ).resolves.toEqual({ ok: true, sha: SHA });
  });

  it("stops when the pull request moved after the request", async () => {
    const result = await checkSnapshotDispatch({
      github: mockGithub(),
      context,
      pullRequest: "7",
      expectedSha: "b".repeat(40),
    });
    expect(result).toEqual({
      ok: false,
      reason: expect.stringContaining("moved"),
    });
  });

  it.each([FORK, DELETED_FORK, CLOSED])(
    "refuses forks and closed pull requests (%#)",
    async (pr) => {
      const result = await checkSnapshotDispatch({
        github: mockGithub({ pr }),
        context,
        pullRequest: "7",
      });
      expect(result.ok).toBe(false);
    },
  );

  it("rejects malformed inputs without calling GitHub", async () => {
    const github = mockGithub();
    for (const input of [
      { pullRequest: "7; rm -rf /" },
      { pullRequest: "7", expectedSha: "main" },
    ]) {
      expect(
        (await checkSnapshotDispatch({ github, context, ...input })).ok,
      ).toBe(false);
    }
    expect(github.rest.pulls.get).not.toHaveBeenCalled();
  });
});

describe("reportSnapshotRelease", () => {
  it("reports a pull request without changesets without reacting", async () => {
    const github = mockGithub();
    await reportSnapshotRelease({
      github,
      context: commentContext(),
      core: mockCore(),
      pullRequest: "7",
      commentId: "1001",
      sha: SHA,
      result: "skipped",
      published: "",
      dryRun: false,
      noChangesets: true,
    });
    expect(github.rest.issues.createComment).toHaveBeenCalledWith(
      expect.objectContaining({
        issue_number: 7,
        body: expect.stringContaining("no changesets"),
      }),
    );
    expect(github.rest.reactions.createForIssueComment).not.toHaveBeenCalled();
  });

  it.each([
    ["success", "@salt-ds/core@0.0.0-snapshot-20261002090000", "rocket"],
    ["failure", "", "confused"],
    ["success", "", "confused"],
  ])(
    "reacts to a %s that published %j with %s",
    async (result, published, content) => {
      const github = mockGithub();
      await reportSnapshotRelease({
        github,
        context: commentContext(),
        core: mockCore(),
        pullRequest: "7",
        commentId: "1001",
        sha: SHA,
        result,
        published,
        dryRun: false,
      });
      expect(github.rest.issues.createComment).toHaveBeenCalledWith(
        expect.objectContaining({ issue_number: 7 }),
      );
      expect(github.rest.reactions.createForIssueComment).toHaveBeenCalledWith(
        expect.objectContaining({ comment_id: 1001, content }),
      );
    },
  );
});
