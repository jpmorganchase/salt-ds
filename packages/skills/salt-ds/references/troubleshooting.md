# Salt Troubleshooting

Load this reference only after a context, schema, registry, or complete-source failure.

## Recovery

- Context or policy failure: use `get_salt_project_context` with the disputed root, correct or obtain the explicit root or policy decision, then rerun the original workflow fresh. Diagnostic context is not reusable workflow state.
- Schema rejection: refresh the live tool surface and originating workflow once. If server-returned action arguments still fail their target schema, report a contract defect and stop; replaying invalid arguments cannot repair it.
- Registry disagreement: inspect `salt://capabilities/manifest` and, when catalog identity matters, `salt://catalog/manifest`. Use `salt://catalog/entity/{name}` only for optional discovery. Missing source, an explicit version mismatch, or unavailable registry data is a real freshness gap; do not infer staleness from age alone.
- Complete-source failure: `review_salt_ui` accepts at most 524,288 characters in one file. Never substitute a diff or excerpt. Report larger files and cross-file target contracts as unsupported by v1 rather than claiming deterministic completion.
- Repeated failure: stop with the exact failing action, schema, root, or evidence gap and state what remains unverified.

## Public surface

Tools:

- `get_salt_project_context`
- `get_salt_reference`
- `review_salt_ui`
- `create_salt_ui`
- `migrate_to_salt`

Resources:

- `salt://capabilities/manifest`
- `salt://catalog/manifest`
- `salt://catalog/entity/{name}`
