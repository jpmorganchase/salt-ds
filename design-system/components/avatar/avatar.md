# Avatar

## Source of truth

- Core source: https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/avatar
- Usage docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/avatar/usage.mdx
- Examples docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/avatar/examples.mdx
- Accessibility docs: https://github.com/jpmorganchase/salt-ds/blob/main/site/docs/components/avatar/accessibility.mdx
- Storybook: https://storybook.saltdesignsystem.com/?path=/story/core-avatar--default

## When to use

- To visually represent a person, group, entity, or communication channel.
- To keep identity representation consistent for the same object across the experience.

## When not to use

- When a large, full-size image is necessary.

## Decision trees

### When to use this component vs alternatives
- Need a compact identity marker next to text or within dense UI?
	- Yes -> Use `Avatar`.
	- No, you need a large visual profile image -> Use an image-focused layout/pattern instead of `Avatar`.

### When to use each variant/state
- Is a valid `src` image available?
	- Yes -> Provide `src` for image avatar.
	- No -> Provide `name` for initials fallback.
	- Neither image nor profile text available -> Use default or custom `fallbackIcon`.

### How to choose color and size
- Need categorical differentiation across many avatars?
	- Yes -> Use `color="category-1"` ... `color="category-20"`.
	- No -> Keep default `color="accent"`.
- Need larger/smaller avatar within density-aware sizing?
	- Yes -> Adjust `size` multiplier.
	- No -> Keep default `size={2}`.

## Validation checklist

- [ ] Selection matches "When to use"
- [ ] Not used where a large full-size image is required
- [ ] `src`, `name`, and `fallbackIcon` choices follow fallback order intent
- [ ] `color` and `size` choices are intentional and match visual intent
- [ ] Decorative avatars that duplicate nearby text are `aria-hidden`
- [ ] Alternative fallback icons use context-appropriate `aria-label`

## Accessibility intent

- Exclude decorative avatars that repeat nearby text from screen reader output by using `aria-hidden`.
- If you use an alternative icon inside an avatar, provide an `aria-label` that describes avatar context (for example, "Company profile").
- When `name` is provided, Avatar applies `role="img"` and `aria-label` with that name.

## AI generation rules (required)

### Select this component when
- The intent is to represent identity in compact UI using image, initials, or fallback icon.
- You need consistent representation of the same entity across the product.

### Auto-configure

| Rule | Logic |
|---|---|
| **Import** | Use the exact `import` statement from `./avatar.json` |
| **Props** | Prefer `src` for photos; use `name` for initials fallback; use `fallbackIcon` when neither image nor profile text is available |
| **Sizing** | Keep `size={2}` unless layout needs a different multiplier |
| **Color** | Keep `color="accent"` unless categorical differentiation is required |
| **Accessibility** | For decorative usage add `aria-hidden`; for alternative icons set context-specific `aria-label` |

### Validation
- [ ] Generated usage matches "When to use" and avoids full-size-image scenarios
- [ ] Prop values and defaults align with `./avatar.json`
- [ ] Fallback path (`src` -> initials from `name` -> icon) is represented correctly
- [ ] Accessibility rules from this file and `./avatar.json` are satisfied

## Primary references

- https://github.com/jpmorganchase/salt-ds/tree/main/packages/core/src/avatar
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/avatar/Avatar.tsx
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/src/avatar/useAvatarImage.ts
- https://github.com/jpmorganchase/salt-ds/blob/main/packages/core/stories/avatar/avatar.stories.tsx
- https://storybook.saltdesignsystem.com/?path=/story/core-avatar--default
- https://storybook.saltdesignsystem.com/?path=/story/core-avatar--sizes
- https://storybook.saltdesignsystem.com/?path=/story/core-avatar--fallback
- https://storybook.saltdesignsystem.com/?path=/story/core-avatar--alternative-icon
- https://storybook.saltdesignsystem.com/?path=/story/core-avatar--with-custom-svg
- https://storybook.saltdesignsystem.com/?path=/story/core-avatar--with-custom-img