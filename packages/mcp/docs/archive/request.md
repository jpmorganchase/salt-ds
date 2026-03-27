Objective
Ensure Salt UI requests cannot complete with generic React/CSS output when canonical Salt options exist, across all repos and all users.

Scope

In scope:

MCP/runtime enforcement for Salt UI tasks
Required tool-call sequence and compliance contract
Hard-fail behavior when Salt workflow is skipped
Deterministic fallback behavior when MCP is unavailable
Out of scope:
Repo-specific conventions
Team-specific wrappers/policies
New Runtime Modes
advisory (default legacy):
Emits warnings if Salt workflow is incomplete.
strict:
Blocks response unless Salt workflow contract is satisfied.
enforce_salt_only:
strict plus prohibition of non-Salt UI composition when Salt equivalent exists.
Required Workflow Contract
A Salt UI task is valid only if all are true:

Intent classified as Salt UI or potential Salt UI.

Structure decision made via canonical Salt selection step.

Entity/details resolved for selected building blocks.

Generated output includes compliance payload.

Post-generation validation executed.

Fallback path marked and justified if MCP unavailable.

Required Tool Provenance
Runtime must verify at least one call in each stage:

Discovery/selection:

discover_salt or choose_salt_solution
Entity grounding:
get_salt_entity or get_salt_examples
Validation:
analyze_salt_code (or canonical lint endpoint if added)
If any stage is missing in strict or enforce_salt_only mode, block completion.
Proposed MCP Additions

Method: salt.policy.set_mode
Purpose: Set enforcement mode for session/request.

Request shape:

mode: advisory | strict | enforce_salt_only
fail_open_on_mcp_unavailable: boolean
require_provenance: boolean (default true)
require_compliance_payload: boolean (default true)
Response shape:

applied_mode: string
effective_flags: object
warnings: string[]
Method: salt.ui.guardrail_preflight
Purpose: Determine whether request must follow Salt workflow.
Request shape:

task_text: string
code_context_present: boolean
ui_task_hint: boolean optional
Response shape:

classified_as_salt_ui_task: boolean
confidence: number 0..1
required_stages: string[]
enforcement_required: boolean
reason_codes: string[]
Method: salt.ui.compliance_check
Purpose: Machine-check generated output before final response.
Request shape:

generated_code: string
selected_entities: object[]
provenance: object
mode: advisory | strict | enforce_salt_only
Response shape:

pass: boolean
severity: info | warning | error
violations: object[]
missing_stages: string[]
suggested_repairs: string[]
report_id: string
Violation object:

code: string
message: string
location_hint: string optional
blocking: boolean
Method: salt.ui.finalize
Purpose: Final gate to approve/reject response.
Request shape:

compliance_report_id: string
provenance: object
fallback_state: none | mcp_unavailable
mode: advisory | strict | enforce_salt_only
Response shape:

approved: boolean
blocking_reasons: string[]
required_next_actions: string[]
fallback_label_required: boolean
Mandatory Compliance Payload in Model Output
Runtime should require these fields in strict and enforce_salt_only:
chosen_building_blocks:
component/pattern names and reason
canonical_guidance_source:
mcp or cli_fallback
validation_surface:
analyze_salt_code or lint endpoint
provenance_summary:
stage-by-stage tool evidence
fallback_status:
none or mcp_unavailable with justification
If any required field is missing, response is rejected before user delivery.

Hard Fail Conditions (Blocking)

Salt UI classified true but no selection stage call found.

No entity grounding call found.

No validation call found.

Generated UI uses non-Salt composition where a Salt equivalent is known in enforce_salt_only mode.

Output lacks required compliance payload in strict/enforce_salt_only.

MCP available but runtime attempted generic fallback without explicit policy exception.

Fallback Policy (When MCP Is Down)

If fail_open_on_mcp_unavailable is false:

block completion, return actionable error with retry guidance.
If true:
allow hidden CLI workflow fallback only.
require explicit label: fallback_used = mcp_unavailable.
lower confidence state included in final metadata.
Generic React/CSS path still blocked in enforce_salt_only unless explicit temporary override flag is set by admin policy.

Runtime Decision Algorithm

Run preflight classification.

If Salt UI and mode is strict/enforce_salt_only:

enforce stage requirements.
Execute generation path.
Run compliance_check.
If pass false and blocking violations exist:
force auto-repair loop (max N attempts).
If still failing:
reject finalize with clear remediation guidance.
Telemetry and Audit
Capture for each Salt UI task:

mode used

preflight classification confidence

provenance completeness by stage

compliance result and violation codes

fallback reason and rate

user-visible rejection count
This enables measuring guardrail effectiveness and false-positive rates.

Acceptance Criteria

In strict mode, zero Salt UI responses ship without full provenance stages.

In enforce_salt_only mode, zero non-Salt outputs ship when a canonical Salt equivalent exists.

Fallbacks are explicitly labeled 100% of the time.

False block rate remains below agreed threshold after calibration.

Regression suite covers:

normal Salt UI requests
ambiguous UI requests
MCP unavailable cases
partial-code refinement
adversarial prompt attempts to bypass Salt workflow
Rollout Plan
Phase 1:
advisory mode with telemetry only
Phase 2:
strict mode for internal users
Phase 3:
enforce_salt_only for selected tenants
Phase 4:
broad rollout with override policy for emergency exceptions
Minimal First Implementation
If the Salt team wants a fast MVP:
Add preflight classifier
Add provenance stage checks
Add compliance payload requirement
Add blocking finalize gate in strict mode
Add explicit MCP-unavailable fallback labeling
If you want, I can next provide a one-page engineering ticket version with:

API contracts trimmed to MVP
exact error codes
test cases in Given/When/Then format for implementation handoff.
