# Salt icons

`@salt-ds/icons` provides SVG icons as React components and CSS masks. The catalogue contains 550 SVG exports, including 185 outline/solid pairs. Two pairs, Import and Export, retain identical line-only variants for compatibility.

## Design and use

- [Browse and use icons](../../site/docs/foundations/assets/index.mdx): selection, size, weight, spacing and accessible use.
- [Icon design](../../site/docs/foundations/assets/icon-design.mdx): meaning, family consistency, softened interiors, modifiers, cutouts and outline/solid relationships.
- [Creating icons](../../site/docs/foundations/assets/creating-icons.mdx): design, native-size review and contribution workflow.

The site guidance is the visual source of truth. Salt icons use a 16 × 16 canvas and must remain recognizable at 12px. Review related icons together, including both variants, supported weights and light/dark backgrounds.

## Contribute artwork

Make durable artwork changes in the owning recipe under `scripts/artwork`. Generated SVGs, components and CSS masks are outputs; direct edits to them are overwritten by generation.

From the repository root:

```sh
yarn workspace @salt-ds/icons generate:icons
yarn workspace @salt-ds/icons validate:icons
yarn node packages/icons/skills/salt-icons/scripts/check-integration.mjs --repo . new-name
```

See [Maintaining Salt icons](MAINTAINING.md) for recipe ownership, export fitting, shared constructions, search metadata, generation and review records. Its automated checks support visual review; they do not certify recognition or every corner in the catalogue.

The [Salt Icons skill](skills/salt-icons/SKILL.md) is an entry point to that workflow. [Brand source notes](scripts/artwork/brands/README.md) preserve artwork provenance and export choices.
