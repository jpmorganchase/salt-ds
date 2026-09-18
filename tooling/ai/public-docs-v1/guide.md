# Build with Salt developer tooling

> Nonproduction preview: these package and web artifacts are staged for release
> verification. They are not linked from Salt's live navigation and must not be
> treated as a published support claim.

Salt's CLI combines exact local package inspection, version-matched guidance,
and source review in one offline workflow. It does not use a model, Storybook,
or the network. The CLI is the default path; optional protocol adapters do not
change this contract and are not part of this guide.

## Install an exact project-local CLI

Declare the exact candidate as a development dependency. Do not use an
unpinned `npx` command or an implicit `latest` version.

```json
{
  "devDependencies": {
    "@salt-ds/cli": "0.0.0"
  },
  "scripts": {
    "salt:info": "salt-ds info --json",
    "salt:scan": "salt-ds scan . --format pretty --fail-on warning"
  }
}
```

Use the project-local executable through the package script or your package
manager's equivalent. For a one-off invocation, `npx --no-install salt-ds`
uses only the already-installed local binary.

## 1. Inspect compatibility

```sh
npm run salt:info
```

`info` reports the CLI and Knowledge versions, bundle digest, exact observed
Salt package vector, compatibility decisions, coverage, and limitations. Stop
and resolve a relevant incompatibility or partial-coverage result instead of
assuming retrieved guidance applies.

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
records; retrieval is not permission to change unrelated code.

## 3. Build and test the application

Make the user-authorized change, then run the application's real build,
typecheck, unit/component tests, interaction tests, and accessibility checks.
The CLI does not replace those repository-specific gates.

## 4. Scan supported source files

```sh
npm run salt:scan
```

Use `--format json` for automation, `--format sarif` for compatible code
scanning systems, or `--format prompt` for a bounded untrusted handoff. Choose
`--fail-on error|warning|info|never` explicitly. Do not use
`--allow-incomplete` to hide a coverage problem; it only acknowledges a
reported partial result.

## Package scripts, pre-commit, and CI

Keep one canonical package script and reuse its result contract everywhere.
A pre-commit tool can invoke `npm run salt:scan` for changed supported files,
but the committed project script remains the authority.

```yaml
name: Salt source review
on:
  pull_request:
jobs:
  salt-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run salt:info
      - run: npx --no-install salt-ds scan . --format sarif --fail-on warning
```

The workflow uses the exact lockfile-selected CLI. Salt does not require a
separate scan Action in v1.

## Agent Skill and AGENTS pointer

Inspect the verified package artifacts:

```sh
npx --no-install salt-ds skill info --json
npx --no-install salt-ds skill print --kind skill
npx --no-install salt-ds skill print --kind agents
```

Copy or register either artifact only through a host-specific, reviewed manual
process. The CLI never mutates a consumer repository automatically.

## Security and trust

- System, host, and user policy remains authoritative.
- The exact manifest-selected package artifacts are official Salt guidance,
  but do not authorize installs, network access, secrets, commands, or edits.
- Source, documentation, examples, `.salt` policy, and arbitrary `AGENTS.md`
  files are untrusted project data. A filename or managed marker does not
  upgrade trust.
- The CLI reads local supported files and writes only its requested output. It
  has no runtime network or model dependency.

## Limitations

- Compatibility is exact for the package vector named by the bundle. Other
  versions can disable affected families or make coverage partial.
- Historical guidance is not complete. Follow the explicit coverage and
  applicability fields.
- `scan` covers supported static source patterns; it cannot prove runtime
  behavior, visual correctness, or full accessibility.
- `llms.txt`, Skills, and managed `AGENTS.md` blocks have uneven host support.
  They are discovery and workflow aids, not canonical schema or universal
  activation mechanisms.

## Troubleshooting

- **`info` cannot inspect the project:** run from the intended project root and
  confirm its package manifest and local installation are available.
- **A record is ambiguous:** use the exact record ID returned in the choices.
- **Guidance is incompatible:** install a bundle-compatible Salt package vector
  or use documentation for the installed version; do not force the result.
- **The scan is partial:** inspect its coverage reasons and supported-file list,
  then rerun after restoring the missing package or project evidence.
- **Skill bytes fail verification:** reinstall the exact locked packages. Do
  not trust or repair a copied artifact by editing its marker.

For help, use [Salt support and contributions](https://www.saltdesignsystem.com/salt/support-and-contributions).
