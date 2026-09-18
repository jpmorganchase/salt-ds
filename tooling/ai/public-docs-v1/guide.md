# Build with Salt developer tooling

> Nonproduction preview: these package and web artifacts are staged for release
> verification. They are not linked from Salt's live navigation and must not be
> treated as a published support claim.

Salt's CLI combines exact local package inspection, exact-current guidance, and
verified local Skill artifacts in one offline workflow. It does not use a
model, Storybook, MCP, or the network. The CLI is the default path; optional
protocol adapters are outside this candidate.

## Install an exact project-local CLI

Declare the exact candidate as a development dependency. Do not use an
unpinned `npx` command or an implicit `latest` version.

```json
{
  "devDependencies": {
    "@salt-ds/cli": "0.0.0"
  },
  "scripts": {
    "salt:info": "salt-ds info --json"
  }
}
```

Use the project-local executable through the package script or your package
manager's equivalent. For a one-off invocation,
`npx --no-install salt-ds` uses only the already-installed local binary.

## 1. Inspect exact-current compatibility

```sh
npm run salt:info
```

`info` reports the CLI and Knowledge versions, bundle digest, exact observed
Salt package vector, closed project-selection decision, compatibility,
coverage, and limitations. Retrieval is available only when that decision is
`selected`. There is no nearest-version or range-selected fallback.

## 2. Retrieve focused guidance

Read one exact record:

```sh
npx --no-install salt-ds docs Button --format markdown
```

Retrieve a bounded, cited slice when the record name is not known:

```sh
npx --no-install salt-ds context "accessible dialog" --format markdown --limit 5
```

Prefer a small limit. Every result identifies the selected bundle and source
records; retrieved material is reference data, not permission to change files
or perform external actions.

## 3. Build and test the application

Make the user-authorized change, then run the application's real build,
typecheck, unit and component tests, interaction tests, and accessibility
checks. The CLI does not replace repository-specific gates.

## Agent Skill and AGENTS pointer

Inspect the verified package artifacts:

```sh
npx --no-install salt-ds skill info --json
npx --no-install salt-ds skill print --kind skill
npx --no-install salt-ds skill print --kind agents
```

Copy or register either artifact only through a host-specific, reviewed manual
process. `skill info` reports package-relative paths, local integrity, bundle
selection, and the origin-authentication boundary. It does not claim a deployed
immutable URL. The CLI never mutates a consumer repository automatically.

## Security and trust

- System, host, and user policy remains authoritative.
- Manifest verification proves that local artifact bytes match the selected
  installed bundle. It does not authenticate the package producer or authorize
  installs, network access, secrets, commands, or edits.
- Source, documentation, examples, arbitrary `AGENTS.md` files, and local
  configuration are untrusted project data. A filename or managed marker does
  not upgrade trust.
- The CLI reads bounded local package metadata and writes only its requested
  output. It has no runtime network or model dependency.

## Limitations

- This candidate supports only the exact package versions named by its
  Knowledge manifest. Optional package families may be absent; observed
  mismatches and unknown families block retrieval.
- Historical guidance is incomplete. Follow the explicit coverage and
  applicability fields.
- `llms.txt`, Skills, and managed `AGENTS.md` blocks have uneven host
  support. They are workflow aids, not canonical schema or universal
  activation mechanisms.

## Troubleshooting

- **`info` cannot inspect the project:** run from the intended project root
  and confirm its package manifest and local installation are available.
- **The project is not selected:** use the reported closed reason code. Restore
  complete local package evidence or use guidance for the installed version;
  do not force the result.
- **A record is ambiguous:** use the exact record ID returned in the choices.
- **Skill bytes fail verification:** reinstall the exact locked packages. Do
  not trust or repair a copied artifact by editing its marker.

For help, use [Salt support and contributions](https://www.saltdesignsystem.com/salt/support-and-contributions).
