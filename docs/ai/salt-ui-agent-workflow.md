# Salt UI agent prototype

This repository-local prototype uses one authored shared Skill for behavior and
host-specific profiles only to select creator or reviewer roles. It is not a
Salt component reference, a package artifact, or an installation mechanism.

## Copy to another repository

Copy `skills/salt-ui/SKILL.md` and the selected host profiles together,
preserving their repository-relative paths:

- GitHub Copilot: `.github/agents/salt-ui-creator.agent.md` and, when an
  independent review is useful, `.github/agents/salt-ui-reviewer.agent.md`.
- Codex: `.codex/agents/salt-ui-creator.toml` and, when an independent review
  is useful, `.codex/agents/salt-ui-reviewer.toml`.

The receiving project must already have matching Salt CLI and Knowledge packages
available locally. The Skill invokes the installed CLI's declared binary
directly with Node. If that package or binary is absent, it reports the limitation
without invoking a package manager, fetching documentation, or substituting a
static copy of Salt guidance.

For an isolated review, include the project's manifest and lockfile with the
installed cohort so `info` can verify its context. Label screenshots by state
and supply the current check definitions and results; exclude obsolete diagnostic
images. The [initial comparison](../../evals/salt-ai/ui-agent/RESULTS.md) found no
creator-quality advantage, while independent retrieval exposed missed Card reuse.

The profile layouts follow the official [GitHub Copilot custom-agent
format](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-custom-agents)
and [Codex subagent configuration](https://learn.chatgpt.com/docs/agent-configuration/subagents).
They are portable configuration, not evidence that every local client supports
native activation. In this workspace, native Codex activation is unverified:
the local client exposes model selection but rejected the custom profile type as
an unknown model. Copilot has only received static validation because an
executable host is unavailable here.

When native Codex activation is unavailable, ask an ordinary Codex agent to
read `skills/salt-ui/SKILL.md` and carry out the creator or reviewer role. For a
controlled comparison, supply the corresponding TOML profile's
`developer_instructions` directly with that request. This fallback tests Skill
and profile behavior; it does not claim that the local host registered the
profile.

The separate Codex CLI smoke test also blocked shell file reads. The desktop
fresh-agent fallback uses this session's working execution tools to test the
Skill, profile behavior and Salt retrieval. It does not establish native profile
activation in that CLI build.

## Architecture boundary

`skills/salt-ui/SKILL.md` is the sole authored behavioral source. The two
Copilot and two Codex profiles explicitly load it. The existing
`skills/salt-design-system/SKILL.md`, Knowledge compiler inputs, and published
agent-support contract remain unchanged. No installer, launcher, plugin,
framework, or second Salt knowledge corpus is part of this prototype.
