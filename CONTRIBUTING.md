# Contributing to Salt

To do: intro.

## How to's

### Prop deprecation

To do.

### Theming

Additions and updates to the theme come from our designers. Any changes to the theme should have solid reasoning, be well-documented and follow clear steps for any necessary deprecation. All Salt theme tokens are prefixed with `--salt-`, followed by `-<characteristic | foundation>-`, and then the intent of the token: for example `--salt-actionable-cta-background`. For more information on tokens, see our [Theme docs](https://storybook.saltdesignsystem.com/?path=/docs/theme-about-the-salt-theme--docs). Tokens should align 100% with Figma to ensure ease of communication between designers and developers.

#### How to add new tokens

1. Add the token to the appropriate `.css` file in `packages/theme/css`
2. Document the token in the appropriate file within `packages/theme/stories`
3. Add a changeset listing the new tokens.
4. The tokens can then be used within components as desired.

#### How to remove/deprecate tokens

If tokens are for some reason removed from the theme, this is a breaking change and they must first be deprecated.

1. Move the token to the bottom of its scope in the tokens `.css` file. See below code for example.
2. Comment above the token in its `.css` file with `**Deprecated:** <Reason for deprecation>`.
3. [Optional]: If the token has just been renamed with the value the same, point the token to the renamed
4. [Optional]: If the token is to be fully removed but there is a token with a different value that should be used as a replacement, note this in deprecation comment.

```css
.salt-theme {
  --salt-token-1: red;
  --salt-token-2: blue;
  --salt-token-6: green;

  /* **Deprecated:** Use replacement token as defined */
  --salt-token-3: var(--salt-token-2);
  /* **Deprecated:** --salt-token-6 should be used instead */
  --salt-token-4: purple;
  /* **Deprecated:** This token has been deprecated */
  --salt-token-5: pink;
}
```

5. In the appropriate `.mdx` documentation file, add the `withNotes` prop to a new `DocGrid` titled with `### **Deprecated:** These tokens have been deprecated`. In the documentation component of the relevant token, add the `replacementToken` prop with the token to replace with as in [3] or [4], or otherwise make the value of the `replacementToken` "N/A":

```jsx
<DocGrid withNotes>
  <ColorBlock colorVar="--salt-token-3" replacementToken="--salt-token-2" />
  <ColorBlock colorVar="--salt-token-4" replacementToken="--salt-token-6" />
  <ColorBlock colorVar="--salt-token-5" replacementToken="N/A" />
</DocGrid>
```

Or, if it is a palette token being removed, add the comment as follows:

```jsx
<ColorItem
  title="Background"
  subtitle="--salt-palette-neutral-tertiary-background"
  colors={{
    "**Deprecated:** --salt-palette-neutral-tertiary-background-readonly":
      "var(--salt-palette-neutral-tertiary-background-readonly)",
  }}
/>
```

6. Add a changeset with the appropriate information.
7. Any components using the deprecated tokens where the replacement token has the same value can use the replacement token instead immediately. If the value of the replacement token differs, this should be noted in the changeset.
8. On the next breaking change release, the deprecated tokens can be carefully removed and it should be ensured that the removed token is no longer used anywhere in the codebase.

#### How to manage component CSS API and local tokens

Local tokens begin with `--componentName`, whereas tokens belonging to our CSS API are prefixed with `--saltComponentName`. Local tokens should not be changed by consumers and so don't need to follow strict deprecation rules if renamed or removed. However, changes to CSS API tokens are considered as breaking changes and should be treated as such.

It is rare that a CSS API token should need to change, but in the case it does, follow the necessary steps:

1. Clearly document the token that is changing within the components docs in `packages/<core | lab>/stories`.
2. If the token is being deleted, keep it in the component CSS file until the breaking change release.
3. If the token is being renamed, use the rename as the second fallback - for example `align-items: var(--saltButton-someToken, center);` changes to `align-items: var(--saltButton-someToken, var(--saltButton-tokenRenamed, center))`. Then, on breaking change, remove the deprecated token: resulting in `align-items: var(--saltButton-tokenRenamed, center)`.

#### How to remove component class names

Any component class names that are no longer necessary must first be deprecated. Simply add a comment above the class name, and then remove upon breaking change. Example:

```css
/* **Deprecated:** Tertiary variant no longer supported */
.saltFormField-tertiary {
  background: var(--salt-editable-tertiary-background);
}
```
