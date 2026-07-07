# Salt MCP Workflow: Session Notes & Improvements

Notes from a Cursor session where an agent used the **salt-ds** skill and **Salt MCP** (`user-Salt (local)`) to create a financial dashboard mockup, then reviewed it— exposing gaps between create and review.

**MCP catalog:** offline Salt catalog v0.1.0 (`@salt-ds/mcp`), generated 2026-07-02.

---

## 1. Skill & MCP setup used

**Skill:** `.agents/skills/salt-ds/SKILL.md`

| Workflow | Reference | Tools |
|----------|-----------|-------|
| Create | `references/create.md` | `get_salt_project_context` → `create_salt_ui` → `get_salt_reference` → rerun create → implement → `review_salt_ui` |
| Review | `references/review.md` | `get_salt_project_context` → `review_salt_ui` → `get_salt_reference` |
| Core gate | `references/core.md` | Block implement unless `status: success`, `action.kind: implement`, `safety.exact_request_safe: true`, `evidence.status: complete` |

**Public MCP tools:** `get_salt_project_context`, `get_salt_reference`, `create_salt_ui`, `review_salt_ui`, `migrate_to_salt`

**Repo context (`get_salt_project_context`):**

- Framework: `vite-react`
- `context_id`: `L1VzZXJzL3R5bW9uL0RvY3VtZW50cy9jb2RlL3BlcnNvbmFsL3JlYWN0LXBsYXlncm91bmQ`
- No `.salt/team.json` or `.salt/stack.json` declared
- Salt install health: pass

---

## 2. Create workflow (financial dashboard)

**User request:** Create a sample Salt UI mockup of a financial website.

**Intended pattern:** Salt **Analytical dashboard** (`create_salt_ui` broadened the query to this pattern).

**Deliverables:** `FinancialDashboard.tsx`, mock data, `@salt-ds/icons` — dashboard shell with header, sidebar nav, KPI cards, tabs, transactions table.

### 2.1 What the agent did right

1. Loaded `references/core.md` and `references/create.md`
2. Called `get_salt_project_context` with explicit `root_dir`
3. Called `create_salt_ui` — respected `status: partial` and follow-through retrieval
4. Called `get_salt_reference` for required entities
5. Reran `create_salt_ui` with `resolved_entities` until hard gate passed
6. Implemented only after `action.kind: implement`

### 2.2 What the agent did wrong

1. **Listed `VerticalNavigation` in `resolved_entities` after reference lookup had returned `not_found`** — gate treated pattern evidence as sufficient
2. **Implemented `VerticalNavigation` from types/memory** — skipped `VerticalNavigationItemContent` (canonical composition)
3. **Skipped successful post-create `review_salt_ui` on full source** — skill step 7; first review used truncated code and returned `blocked`; agent still marked create done
4. **Violated "No Salt Invention"** in `references/core.md` for the nav subtree

### 2.3 Composition bug the MCP did not catch

Agent shipped:

```tsx
<VerticalNavigationItem active={...}>
  <VerticalNavigationItemTrigger href="#">...</VerticalNavigationItemTrigger>
</VerticalNavigationItem>
```

Canonical structure (from `@salt-ds/core` CHANGELOG / docs):

```tsx
<VerticalNavigation aria-label="..." appearance="indicator">
  <VerticalNavigationItem active>
    <VerticalNavigationItemContent>
      <VerticalNavigationItemTrigger>
        <VerticalNavigationItemLabel>...</VerticalNavigationItemLabel>
      </VerticalNavigationItemTrigger>
    </VerticalNavigationItemContent>
  </VerticalNavigationItem>
</VerticalNavigation>
```

`VerticalNavigationItemContent` owns active/hover/focus styling; trigger alone is insufficient.

---

## 3. Review workflow

**User request:** Review this Salt UI.

**Agent actions:**

1. `get_salt_project_context`
2. `review_salt_ui` — **truncated code**, not full `FinancialDashboard.tsx`
3. `get_salt_reference` for Table, Tabs, SaltProviderNext, etc.
4. Manual review when MCP review returned `blocked` / high `unsupported_claim_count`

**Outcome:** Review contradicted create output (especially `VerticalNavigation`). That contradiction is a **workflow failure**, not a user surprise—the same agent invented JSX the MCP never grounded.

**Review findings (Salt-relevant):**

| Issue | Salt rule / pattern |
|-------|---------------------|
| Missing `VerticalNavigationItemContent` | Compound component composition |
| `href="#"` on nav triggers | Use button triggers when no real navigation |
| Custom sr-only class | Prefer `.salt-visuallyHidden` from theme |
| Simplified app header | Canonical App header pattern includes responsive behavior |
| `Text variant=` | Deprecated; use `color=` (Theme Next) |

---

## 4. MCP tool call log

Server: **`user-Salt (local)`** (descriptors under `mcps/user-Salt_local/`).

### 4.1 `get_salt_project_context`

```json
{ "root_dir": "/Users/tymon/Documents/code/personal/react-playground" }
```

Called at start of create and review. Returned `context_id`, `vite-react`, no declared Salt policy.

---

### 4.2 `create_salt_ui` — call 1

```json
{
  "query": "Create a sample financial website dashboard mockup...",
  "context_id": "...",
  "root_dir": "...",
  "solution_type": "pattern",
  "status": "stable",
  "prefer_stable": true,
  "a11y_required": true,
  "include_starter_code": true
}
```

| Field | Value |
|-------|-------|
| `status` | `partial` |
| `resolved_entity` | `Analytical dashboard` |
| `action.kind` | `retrieve_entity` → `get_salt_reference` |
| Missing evidence | Table, Card, App header, Header block |

---

### 4.3 `get_salt_reference` — create follow-through

```json
{
  "kind": "entity",
  "names": ["Table", "Card", "App header", "Header block", "VerticalNavigation", "BorderLayout", "StackLayout", "GridLayout", "Tabs", "Badge", "Text", "H1", "Button"],
  "include": ["examples", "props", "accessibility"],
  "include_starter_code": true
}
```

| Result | Detail |
|--------|--------|
| Resolved | 8 / 13 |
| **not_found** | `VerticalNavigation`, `BorderLayout`, `StackLayout`, `GridLayout`, `H1` |
| Starter snippets | Table, Card, Tabs, Badge, Text, Button, App header (often full Storybook stories, not minimal snippets) |

**Should have blocked:** Agent planned to use `VerticalNavigation` but reference returned `not_found`.

---

### 4.4 `create_salt_ui` — call 2

```json
{
  "query": "(same)",
  "resolved_entities": ["Table", "Card", "App header", "Header block", "VerticalNavigation", "BorderLayout", "StackLayout", "GridLayout", "Tabs", "Badge", "Text", "H1", "Button"],
  "...": "..."
}
```

| Field | Value |
|-------|-------|
| `status` | `success` |
| `action.kind` | `implement` |
| `safety.exact_request_safe` | `true` |
| `evidence.status` | `complete` |
| `post_action` | `review_salt_ui` |

**Gap:** `resolved_entities` included names that reference lookup had not actually resolved. No composition verification for `VerticalNavigation`.

---

### 4.5 `review_salt_ui` — during / after create

**Input:** Truncated code snippet (not full files).

| Field | Value |
|-------|-------|
| `status` | `blocked` |
| Reason | Snippet missing imports; pattern region rules unsupported |

Agent treated create as complete anyway.

---

### 4.6 `review_salt_ui` — user-requested review

**Input:** Partial/truncated in one attempt; full payload prepared separately in another.

| Field | Value |
|-------|-------|
| `status` | `blocked` |
| `evidence.status` | `complete` (doc URLs only) |
| `unsupported_claim_count` | 3–4 |
| Action | No code remediation for snippet; conventions note |

Agent supplemented with manual source review.

---

### 4.7 `get_salt_reference` — review support

```json
{
  "kind": "entity",
  "names": ["NavigationItem", "Table", "Tabs", "VerticalNavigation", "SaltProviderNext", "BorderLayout"],
  "include": ["accessibility", "props", "deprecations"]
}
```

| Entity | Lookup |
|--------|--------|
| Table, Tabs, SaltProviderNext | found |
| NavigationItem, VerticalNavigation, BorderLayout | **not_found** |

Entity name normalization in catalog is inconsistent with `@salt-ds/core` export names.

---

## 5. Root cause: why create and review contradicted

| # | Cause |
|---|--------|
| 1 | **Pattern-level `evidence.status: complete` ≠ safe to implement every component** in the dashboard |
| 2 | **`resolved_entities` accepted names without verified reference payloads** (e.g. VerticalNavigation) |
| 3 | **No composition contracts** — MCP cannot require `VerticalNavigationItemContent` |
| 4 | **`get_salt_reference` not_found not treated as hard stop** by agent or MCP |
| 5 | **Post-create review not enforced** on full written artifacts |
| 6 | **Review with partial code** returns `blocked` without actionable `fix_candidates` |
| 7 | **Starter examples too large** (Storybook) — agents trim incorrectly and drop required wrappers |

---

## 6. Recommendations for MCP developers

### 6.1 Split evidence by scope

```json
{
  "pattern_evidence": "complete",
  "component_evidence": "partial",
  "components_missing_evidence": ["VerticalNavigation"],
  "composition_missing": ["VerticalNavigationItemContent"]
}
```

Block `implement` until every emitted component has reference + composition evidence.

### 6.2 Composition contracts in catalog

Machine-checkable required trees for compound components; expose via `get_salt_reference` with `include: ["composition"]`.

### 6.3 No unverified imports

Block create if planned JSX uses a `@salt-ds/core` symbol not backed by a successful reference payload.

### 6.4 Entity alias resolution

Normalize `VerticalNavigation`, `BorderLayout`, `NavigationItem`, etc. Catalog lookups should not return `not_found` for stable export names.

### 6.5 Blocking post-create review

```json
{
  "post_action": {
    "kind": "review",
    "tool": "review_salt_ui",
    "blocking": true,
    "args": { "paths": ["src/components/FinancialDashboard.tsx"], "require_status": "success" }
  }
}
```

### 6.6 Structural review rules

| Rule | Detect |
|------|--------|
| `vertical-nav-composition` | Trigger not under `VerticalNavigationItemContent` |
| `fake-link-nav` | `href="#"` on nav triggers |
| `deprecated-text-variant` | `Text variant=` |
| `legacy-theme` | `SaltProvider` without `theme-next.css` when Theme Next expected |

Return `fix_candidates` with diffs, not narrative only.

### 6.7 Implementation checklist on `implement`

Binding checklist items (e.g. vn-content-wrapper, no-fake-hrefs) returned with `action.kind: implement`.

### 6.8 Minimal starter snippets

Per entity: one canonical example (< ~30 lines), not full Storybook files.

### 6.9 Project policy (`.salt/stack.json`)

```json
{
  "required_composition_evidence": ["VerticalNavigation", "Tabs", "Table"],
  "theme": {
    "provider": "SaltProviderNext",
    "stylesheets": ["@salt-ds/theme/index.css", "@salt-ds/theme/css/theme-next.css"]
  }
}
```

---

## 7. Recommendations for agent skill (no MCP release required)

Add to `.agents/skills/salt-ds/references/create.md`:

```markdown
## Before editing

- Call get_salt_reference with include=["examples","props","composition"] for EVERY compound component in the planned UI—not only create_salt_ui follow-through names.
- If get_salt_reference returns not_found for a component you intend to render, stop and retry aliases. Do not implement from types or memory.

## Before marking create complete

- Run review_salt_ui on the full written source (all new/changed files).
- Do not report success if review status is blocked or partial unless you fix and rerun, or explicitly list blockers for the user.
```

---

## 8. MCP eval cases (from this session)

| Case | Input | Assert |
|------|-------|--------|
| Dashboard create | `create_salt_ui` financial query | No `implement` until VerticalNavigation composition retrieved |
| Vertical nav lookup | `get_salt_reference("VerticalNavigation")` | Entity + composition tree + minimal example |
| Post-create review | Full `FinancialDashboard.tsx` | Flags missing `VerticalNavigationItemContent` |
| Fake href | `review_salt_ui` with `href="#"` nav | Returns `fix_candidate` |
| Resolved entities honesty | `resolved_entities` includes not_found name | `create_salt_ui` stays `blocked` |

---

## 9. Summary

The agent followed the **create** workflow shape correctly (context → create → reference → rerun → implement) but the MCP **hard gate was too coarse**: pattern evidence completed while `VerticalNavigation` was never canonically grounded. The agent then invented JSX, skipped a full **review** loop, and only caught the error when the user asked a targeted composition question— at which point review contradicted create.

**Fix priority for MCP:** composition contracts, per-component evidence gating, entity alias resolution, structural review rules, and blocking create completion until full-source review passes.
