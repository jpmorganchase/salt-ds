# Common Product Surfaces

Use this file when the task is not only "which component" but "what kind of Salt surface is this?"

Keep the user task visible first.

Do not reduce a page-level ask into a smaller local component before the top-level direction is grounded.

## Dashboard Or Overview Page

Use when the screen must summarize a workflow before the user drills into detail.

- main task:
  - orient the user, surface the most important signals, and lead into deeper detail
- primary interaction should feel like:
  - scan first, act second, drill into the main body without losing context
- usual Salt direction:
  - page-level dashboard pattern
  - metric pattern for summary signals
  - a clear shell and a separate main analytical body
- common mistakes:
  - turning the page into disconnected cards
  - treating every metric as equally loud
  - collapsing the page into one widget before the top-level structure is chosen

## Table Plus Filters

Use when data review, filtering, selection, and follow-up actions are the main job.

- main task:
  - narrow the dataset, inspect the right rows, then act
- primary interaction should feel like:
  - filter and orient quickly without losing the main table as the detail owner
- usual Salt direction:
  - filters clearly subordinate to the data region
  - actions grouped by row, selection, or page ownership instead of scattered across the shell
- common mistakes:
  - oversized summary regions that demote the table
  - filters and actions competing for the same emphasis
  - ad hoc spacing wrappers instead of clear layout ownership

## Form Page

Use when data entry, editing, validation, and status feedback are the core workflow.

- main task:
  - move the user through input, validation, and completion with low ambiguity
- primary interaction should feel like:
  - predictable, calm, and structured around the next decision
- usual Salt direction:
  - form pattern first
  - supporting text and status close to the fields they affect
  - action area aligned with completion and recovery paths
- common mistakes:
  - treating the form as a loose stack of controls
  - burying validation or status feedback away from the fields
  - introducing custom wrappers before the canonical form structure is clear

## Dialog Workflow

Use when the task is confirmation, announcement, preferences, or a bounded decision.

- main task:
  - focus the user on one decision or one short configuration step
- primary interaction should feel like:
  - constrained, obvious, and hard to misread
- usual Salt direction:
  - dialog or related bounded overlay pattern
  - action ordering that makes the safest path obvious
  - minimal supporting structure around the primary decision
- common mistakes:
  - overloading the dialog with page-level content
  - making secondary actions visually equal to the main decision
  - carrying page-shell layout rules into a bounded overlay

## Navigation Shell

Use when the user needs stable landmarks, orientation, and movement between major tasks.

- main task:
  - preserve orientation while the user switches between features or views
- primary interaction should feel like:
  - navigable, legible, and stable under frequent reuse
- usual Salt direction:
  - app header and navigation patterns first
  - shell regions separated from content regions
  - navigation structure that matches task grouping instead of implementation grouping
- common mistakes:
  - mixing shell actions with content actions
  - recreating a custom rail before checking canonical navigation patterns
  - treating wrappers as canonical when they are only repo-local conventions

## Loading, Empty, Error, And Success States

Use when the supporting states materially affect trust and usability.

- main task:
  - keep the workflow understandable when primary data or actions are not yet available
- primary interaction should feel like:
  - clear about status, clear about next step, and still recognisably the same workflow
- usual Salt direction:
  - state content subordinate to the owning workflow surface
  - actions tied to recovery, retry, or onward progression
- common mistakes:
  - replacing workflow structure with generic placeholder blocks
  - using decorative messaging without a clear action path
  - making transient states louder than the normal working state
