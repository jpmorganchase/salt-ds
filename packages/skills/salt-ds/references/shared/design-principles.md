# Design Principles

Use this file when the task needs design-system judgment instead of only API lookup.

These principles should guide both `create` and `review`.

## Task-First Composition

- make the main user job obvious before secondary information
- choose the structure that best supports the task, not the most decorative composition
- if two valid directions exist, prefer the one that makes the primary action easier to find and understand

## Quiet Hierarchy

- use emphasis sparingly
- let one region own the page or panel purpose
- do not make metrics, actions, alerts, and supporting copy all compete at the same visual weight

## Shallow Structure

- keep hierarchy shallow and responsibilities obvious
- add a wrapper only when it owns semantics, state, layout, or reuse that is real in the repo
- treat extra wrappers as suspicious until they improve clarity or behavior

## Layout Ownership

- identify which region owns the shell, which region owns the main task, and which regions are supporting
- avoid splitting layout responsibility across multiple adjacent helpers without a clear boundary
- prefer the most constrained Salt layout or pattern that can carry the interaction

## Appropriate Density

- match density to the amount of information and frequency of interaction
- dense surfaces should stay structured and scannable, not compressed into noise
- sparse surfaces should not be padded into emptiness just to fill space

## Foundation Discipline

- prefer Salt patterns, primitives, foundations, and tokens before raw values
- verify named tokens, props, and APIs against canonical Salt guidance before using them
- treat direct raw styling as an exception, not the default path

## Bounded Customization

- customize only after ruling out a canonical Salt direction
- keep custom composition narrow and easy to explain
- if customization is necessary, make clear why standard Salt options were not sufficient

## Pattern Before Local Cleverness

- do not preserve foreign component-library structure when the Salt pattern should replace it
- do not confuse repo-local wrappers with canonical Salt guidance
- preserve user-task familiarity during migration, not the exact foreign visual system

## Ask Instead Of Guess

- ask when the choice changes workflow structure, major layout ownership, or migration familiarity
- do not invent a Salt answer just because the host expects momentum
- use runtime evidence only when the source pass still leaves an important gap
