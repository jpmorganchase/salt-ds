# Deterministic graders

`tooling/eval-graders` implements the check kinds a code case (and, for text checks, an
instruct case) can name in a criterion's `grader` field. Python talks to it over a JSONL
protocol on stdio (`schemas/grader-request.schema.json`, `schemas/grader-result.schema.json`).
One `node bin/salt-eval-grade.mjs --serve` process per run keeps the TypeScript program
warm.

Each check returns `correct`, `wrong` or `error`. `error` is a harness fault or an
undecidable input; salt-eval reports it as `review`, never as an agent failure. Every
check ships a `must_fire` and a `must_not_fire` fixture under
`tooling/eval-graders/src/__tests__/fixtures/<kind>/`; the spec fails when a kind has no
fixture folder.

## Element selectors

Checks that take `element` match the component's exported name after resolving import
aliases, so `import { FormField as Field }` and `<Field>` match `element: "FormField"`.
With `from` set, the element must be imported from that package; a locally defined
component of the same name does not match. Namespace imports (`<Salt.FormField>`) resolve
through the namespace.

## Check kinds

### `ts:typecheck`

Typechecks the artifact files inside `fixtures/<fixture>/` with that fixture's
`tsconfig.json`, which maps `@salt-ds/*` to `packages/*/src/index.ts`. Any syntactic or
semantic diagnostic in an artifact file is `wrong`; the diagnostics carry the TS code and
position. `--salt-types dist` uses `tsconfig.dist.json` and the built `dist-types` instead
(run `yarn build` first). No parameters.

### `lint:biome`

Runs Biome's recommended rules on the artifact's TS and JS files. `params.level`
(`error`, default, or `warning`) is the lowest severity that fails the check. The
repository's `biome.jsonc` is not used; a Salt consumer gets Biome's defaults.

### `salt:imports-resolve`

Every named import from `@salt-ds/core`, `@salt-ds/lab`, `@salt-ds/icons` or
`@salt-ds/date-components` must exist in that package's export census. Default imports
fail (no Salt package has one). Namespace imports and subpath imports such as
`@salt-ds/theme/index.css` are not checked. No parameters.

### `salt:no-deprecated`

Every named Salt import must not carry an `@deprecated` JSDoc tag in the census. The
diagnostic repeats the tag text, for example `since 1.32.0. Use SaltProviderNext`. No
parameters.

### `jsx:required-element`

`params`: `element`, optional `from`, optional `min` (default 1). At least `min`
matching elements across all artifact files.

### `jsx:required-ancestor`

`params`: `element`, `ancestor`, optional `from` (applies to both). Every matching
element has a matching ancestor somewhere up its JSX tree; fragments and intrinsic
elements are walked through. Vacuously `correct` when the element never appears. Pair it
with `jsx:required-element` to demand presence.

### `jsx:forbidden-element`

`params`: `element`, optional `from`. `wrong` when any matching element is rendered.

### `jsx:prop-value`

`params`: `element`, `prop`, `equals` (boolean, string, number or null), optional
`from`. At least one matching element must exist and every one must set `prop` to
`equals`. A bare attribute is `true`. A computed value (`readOnly={flag}`) or a spread
that could supply the prop is `error`, because the syntax cannot decide it.

### `jsx:prop-absent`

`params`: `element`, `prop`, optional `from`. No matching element may set `prop` in any
form, including `disabled={false}`. A spread without an explicit `prop` is `error`.
Vacuously `correct` without matches.

### `text:forbidden-pattern`

`params`: `pattern` (JavaScript regular expression source), optional `flags`. `wrong`
when the pattern matches anywhere in any artifact file, including `response.md` on the
instruct track. Evidence lists each match with line and column.

### `render:smoke`

Reserved for a browser-mode render check. Returns `error` in this version.

## The export census

`src/registry/build.ts` reads `packages/{core,lab,icons,date-components}/src/index.ts`
with the TypeScript compiler API and records every export with its `@deprecated` text.
The result is cached at `salt-eval/.work/registry-<git-sha>.json`. A working tree with
changes under `packages/*/src` is never cached. `yarn workspace @salt-ds/eval-graders registry`
prints a fresh census.

## Running the graders by hand

```bash
node --disable-warning=ExperimentalWarning tooling/eval-graders/bin/salt-eval-grade.mjs request.json
```

`request.json` follows `schemas/grader-request.schema.json`:

```json
{
  "id": "example",
  "files": {
    "src/Field.tsx": "import { FormField } from \"@salt-ds/core\";\nexport const F = () => <FormField readOnly />;"
  },
  "checks": [
    {
      "id": "readonly",
      "grader": "jsx:prop-value",
      "params": { "element": "FormField", "prop": "readOnly", "equals": true }
    }
  ]
}
```

The sources run directly under Node's type stripping; `bin/salt-eval-grade.mjs` registers a
resolve hook so the package keeps the repository's extensionless imports. Specs run with
`yarn workspace @salt-ds/eval-graders test` and are also part of the root `yarn test`.

## Adding a check kind

1. Add the name to `checkKind` in `salt-eval/schemas/common.schema.json` and, if it has
   parameters, a `oneOf` branch under `check`.
2. Add the name to `CHECK_KINDS` in `src/protocol.ts` and implement it with `defineCheck`
   in `src/checks/`. Register it in `src/checks/index.ts`; the `Record<CheckKind, AnyCheck>`
   type fails to compile until you do.
3. Add `fixtures/<kind-with-dashes>/params.json`, `must_fire.tsx.txt` (or `.md`) and
   `must_not_fire.tsx.txt`. The spec fails without them.
4. Document the kind above and in `writing-cases.md` if it changes authoring advice.
