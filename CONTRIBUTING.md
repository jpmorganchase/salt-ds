# Contributing to Salt

Follow below instructions to contribute to Salt.

1. Run `yarn` to install dependencies. If this step is stuck, check your proxy setting.
1. Run `yarn build` to build all packages across the repo. This is required to run Storybook or the site.
1. Run `yarn storybook` to run a local instance of [storybook](https://storybook.js.org/docs/get-started/install#start-storybook) for development
1. Run `cd site && yarn serve` to run a local instance of the [documentation](https://www.saltdesignsystem.com/) site.

## Packages

The repo contains below packages under `/packages`

- ag-grid-theme: Custom theme for [AG Grid](https://ag-grid.com/)
- core: Stable components for production use
- countries: [Country symbol](https://www.saltdesignsystem.com/salt/components/country-symbol/) components following ISO 3166
- data-grid: Experimental data grid implementation
- icons: [Icon](https://www.saltdesignsystem.com/salt/components/icon/) components
- lab: Experimental components may or may not land in core
- styles: [Style injection](https://storybook.saltdesignsystem.com/?path=/docs/documentation-style-injection--docs) implementation
- theme: Implementation of Salt theme and design tokens, using CSS variables
- window: [Desktop support](https://storybook.saltdesignsystem.com/?path=/docs/documentation-desktop-support--docs) implementation to support platforms like [OpenFin](https://www.openfin.co/)

## How to's

### How to add a new icon

1. Add the icon to the `packages/icons/src/SVG` folder. The icon should be named using kebab casing e.g. `icon-name.svg`.
2. Navigate to `packages/icons` e.g. `cd packages/icons`.
3. Run `yarn build` to build the icons.
4. Write a changeset using `yarn changeset`, this should have the format:

```md
Added:

- IconName
```

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

If tokens are for some reason removed from the theme, this is a breaking change and you must add them to the `deprecated` folder.

1. Move the token and its value to the respective `theme/css/deprecated/<characteristics | fade | foundations | palette>` file.
2. Remove the token from its original file.
3. [Optional]: If you have renamed the token but kept the value the same, point the token to the renamed.
4. [Optional]: If you want to fully remove the token, but there is a token with a different value that should be used as a replacement, note this in the deprecation comments.

i.e. In `characteristics/text.css`, 3 tokens are to be fully removed:

```css
.salt-theme {
  --salt-text-token-1: red;
  --salt-text-token-2: blue;
  --salt-text-token-6: green;

  /* Deprecate all below */
  --salt-text-token-3: var(--salt-text-token-2);
  --salt-text-token-4: purple;
  --salt-text-token-5: pink;
}
```

In `theme/css/deprecated/characteristics.css`, add these 3 tokens:

```css
.salt-theme {
  --salt-text-token-3: var(--salt-text-token-2); /* Use --salt-text-token-1 */
  --salt-text-token-4: purple;
  --salt-text-token-5: pink; /* Use --salt-text-token-1 */
}
```

5. In the appropriate `.mdx` documentation file, add the `withNotes` prop to a new `DocGrid` titled with `### **Deprecated:** These tokens have been deprecated`. In the documentation component of the relevant token, add the `replacementToken` prop with the token to replace with as in [3] or [4], or otherwise make the value of the `replacementToken` "N/A":

```jsx
<DocGrid withNotes>
  <ColorBlock
    colorVar="--salt-text-token-3"
    replacementToken="--salt-text-token-1"
  />
  <ColorBlock colorVar="--salt-text-token-4" replacementToken="N/A" />
  <ColorBlock
    colorVar="--salt-text-token-5"
    replacementToken="--salt-text-token-1"
  />
</DocGrid>
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
