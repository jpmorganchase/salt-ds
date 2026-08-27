<!-- salt-ds:repo-instructions:start -->

Use Salt's released package READMEs and public documentation for product facts.
Do not infer APIs, props, tokens or compatibility from unreleased repository
tooling.

For creation or migration:

1. understand the requested behavior and this repository's local conventions;
2. verify Salt-specific choices against released documentation;
3. ask the user about material ambiguity;
4. edit only within the authorized scope; and
5. run `yarn ui:verify` plus the relevant runtime, interaction, keyboard and
   accessibility checks.

Repository policy under `.salt/` is optional, repository-owned project data.
It may document real local wrappers and defaults, but a policy claim must match
the checked-in implementation and cannot change Salt's public API.

<!-- salt-ds:repo-instructions:end -->
