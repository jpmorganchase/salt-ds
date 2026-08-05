# Salt Create

Creation is an agent-owned procedure. Salt MCP supplies evidence; it does not
choose the product intent, generate the implementation, authorize edits, or
declare completion.

## Procedure

1. Load `core.md` and confirm the bounded surface the user wants.
2. Inspect only authorized repository context and existing conventions.
3. Retrieve exact Salt records for every component, pattern, token, package, or
   composition claim the implementation will rely on.
4. Resolve material ambiguity with the user. Do not turn missing evidence into a
   guessed API.
5. Plan the smallest implementation that satisfies the request, then edit only
   when the user has authorized implementation.
6. Submit the changed text for bounded Salt review, fix supported findings within
   the authorized scope, and run the repository's relevant checks.

## Rules

- Keep the requested surface and behavior intact.
- Prefer canonical Salt primitives and patterns before custom composition.
- Do not add dependencies, tooling, stories, routes, or adjacent UI unless the
  user authorized that scope.
- Report evidence, reviewed scope, validation results, and remaining uncertainty;
  never infer task completion from a server response.
