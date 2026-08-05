# Salt Review

Use review for Salt-specific analysis of code text supplied by the host. The
server's scope is the submitted text only.

## Procedure

1. Load `core.md` and identify the exact artifact and text being submitted.
2. Call `review_salt_code` with explicit artifact identifiers, languages, and
   non-blank submitted source text. Use an explicit package version only when
   it is known.
3. Check each finding for a stable rule, exact submitted location, parsed fact,
   supported remediation, evidence, and provenance.
4. Report findings without editing when the user requested review only.
5. If fixes are authorized, apply only supported remediations within scope,
   resubmit the changed text, and run the relevant repository checks.

## Rules

- Lead with actionable Salt-specific findings.
- Separate generic code-quality observations from Salt evidence.
- Treat parse uncertainty, dynamic expressions, incomplete input, and missing
  evidence as limitations rather than grounded findings.
- A no-findings result applies only to the submitted text and evaluated rules.
- Never claim complete-file, repository, runtime, browser, accessibility,
  interaction, visual, implementation, or task completion without the
  corresponding independent evidence.
