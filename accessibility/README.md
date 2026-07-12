# Component accessibility evidence

`component-evidence.json` is the source of truth for Salt's component-level
accessibility evidence. It records evidence for a bounded behavior and must not
be used to infer conformance for the full library or for products composed with
Salt.

## Updating an entry

1. Run every automated command named by the affected entry. Record `passed`
   only when the command succeeds, and use the date on which it ran.
2. Record a manual result only after the named scenario is run with the exact
   operating system, browser and assistive technology in the matrix. Keep it
   `not-tested` when no public result exists.
3. When a scenario fails, add an exception with its impact, owner, status and
   review date. Do not use `supported` unless every targeted manual combination
   has a current passed result.
4. Update `reviewedOn` and set `reviewBy` no more than 93 days later. Update the
   corresponding public summary in
   `site/docs/about/accessibility-evidence.mdx`.
5. Run `yarn check:accessibility-evidence` and the affected component tests.
   `yarn verify:lint` runs the evidence validator in continuous integration.

Manual records must not contain personal or confidential information. If a
detailed test report cannot be public, record only the safe attestation fields:
the combination, scenario, outcome, date and accountable owner. Never infer a
manual result from axe or another automated check.
