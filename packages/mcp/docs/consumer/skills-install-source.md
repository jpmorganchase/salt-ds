# Skill Install Source

This file is the single maintained source for how external consumers should install the public `salt-ds` skill.

Until the skills ship behind a stable package, tag, or release ref, do not invent alternative install paths in other docs.

## Current Supported Source

Use the verified GitHub source path for the current consumer AI work:

```sh
npx skills add https://github.com/jpmorganchase/salt-ds/tree/mcp/packages/skills --list
npx skills add https://github.com/jpmorganchase/salt-ds/tree/mcp/packages/skills --skill salt-ds
```

The public consumer install surface is `salt-ds`.
Specialist workflow modules may still exist in the repository during the transition, but they are not the recommended public install path.

## Maintainer Verification

Before changing consumer docs, verify the documented source with:

```sh
npx skills add <source> --list
```

## Local Checkout Verification

For maintainers working in a local checkout, verify the collection with:

```sh
npx skills add ./packages/skills --list
```

## Still Open

The install wording is now centralized here, but the distribution answer is not fully done until this source is replaced by a stable package, release ref, or tag.
