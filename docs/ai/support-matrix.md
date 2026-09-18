# Salt AI support matrix

## Product boundary

| Surface              | Support                                                                  |
| -------------------- | ------------------------------------------------------------------------ |
| Node                 | >=22; release smoke on 22 and 24                                         |
| Salt versions        | exact current tested package vector only                                 |
| Source scan          | JS, JSX, TS, TSX, CSS                                                    |
| npm                  | 10.x/11.x, physical node_modules, package-lock v3                        |
| Yarn Classic         | 1.22.x, physical node_modules, yarn.lock v1                              |
| Yarn Berry           | 4.17.x, `nodeLinker: node-modules`, lock metadata v8                     |
| pnpm                 | 9.x/10.x, lockfile 9.0; exact only for unique contained realpaths        |
| Bun                  | detected, partial; not GA-exact                                          |
| Yarn PnP             | detected, partial; `.pnp.cjs` is never executed                          |
| custom layout        | detected, partial; never guessed                                         |
| MCP                  | optional local stdio adapter only after final `ship`                     |
| web                  | blocked until immutable storage/upload/readback/CAS/rollback is ratified |
| historical knowledge | not supported; Plan 002 only                                             |

Prerelease versions are compatible only when explicitly declared. Each of the
thirteen Salt package families resolves independently; Core cannot grant Lab or
another family compatibility.

## Support ownership

`@saltdesignsystem` is the named primary and `@brooklynrob` the backup for every
AI surface until a reviewed ownership inventory delegates it. Public intake is
[Salt support and contributions](https://www.saltdesignsystem.com/salt/support-and-contributions),
not GitHub Issues.

Include CLI/Knowledge versions, MCP version when applicable, bundle and semantic
digests, Node/OS, exact observed Salt vector, command/format/exit code, sanitized
configuration/minimal fixture, offline state, and reported limitation codes. Do
not submit proprietary source, lockfiles, credentials, home paths, or environment
values by default.

Stable resolver and scanner limitation codes are defined in
[ADR 0001](../decisions/0001-salt-ai-knowledge-platform.md). A partial result is
not a clean result; failed coverage is never overridable.
