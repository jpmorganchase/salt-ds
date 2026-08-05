# Salt Troubleshooting

Load this reference only after a tool, catalog, project-root, or submitted-text
failure.

## Recovery

- Project-root failure: verify the caller-authorized root, correct it once, and
  retry the bounded inspection. Do not treat the root as a sandbox guarantee.
- Schema rejection: refresh the configured Salt server's live surface, correct
  caller arguments once, and report a contract defect if valid arguments still
  fail.
- Catalog disagreement: read the catalog manifest and the exact entity resource.
  Missing source, a digest mismatch, or an explicit version mismatch is a
  freshness failure; age alone is not.
- Submitted-text failure: submit the intended artifact within the advertised
  input limit. Never silently replace it with a diff or truncated excerpt.
- Repeated failure: stop with the exact operation, root, schema, artifact, or
  evidence gap and state what remains unverified.

## Public surface

Tools:

- `search_salt`
- `inspect_salt_project`
- `review_salt_code`

Resources:

- `salt://catalog/v2/sha256-<digest>/manifest`
- `salt://catalog/v2/sha256-<digest>/{family}/{id}`

Creation and migration remain host-agent procedures. No private continuation or
workflow protocol is part of this surface.
