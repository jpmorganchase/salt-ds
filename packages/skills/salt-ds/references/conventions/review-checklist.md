# Review Checklist

Use this when reviewing or simplifying an existing project conventions setup.

## Structure

- If the repo is simple, does it use `.salt/team.json` cleanly?
- If the repo uses `.salt/stack.json`, is that justified by real layering?
- If the repo is bootstrapped for simple usage, does its repo instruction snippet point to `.salt/team.json` first?
- Does each conventions payload use `project_conventions_v1`?
- Is there a `version` where the repo expects one?
- Are there only supported top-level sections?

## Rule Quality

- Does each rule reflect a durable repo convention instead of a one-off preference?
- Does each rule have a concrete `reason`?
- If a replacement exists, is it explicit?
- Are there repo docs or code references worth adding to `docs`?

## Duplication

- Does a `preferred_components` rule duplicate an `approved_wrappers` rule?
- Does a `pattern_preferences` rule overlap with a note that should be removed?
- Are there rules that only restate canonical Salt guidance and should be deleted?

## Merge Safety

- Would a `banned_choices` rule block the intended replacement cleanly?
- Are wrapper rules more specific than pattern rules where they overlap?
- Are notes informative without changing merge behavior implicitly?

## Final Check

- Can the file still be explained as repo-local refinements on top of canonical Salt?
- If multiple layers exist, is the split between LoB and team still clear?
- Would an external consumer understand why each rule exists?
- Is the file small enough to maintain?
- Does the bootstrap guidance still keep `.salt/stack.json` clearly advanced-only?
