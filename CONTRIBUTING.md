# Contributing to Salt

Follow below instructions to contribute to Salt.

1. Run `yarn` to install dependencies. If this step is stuck, check your proxy setting.
2. Run `yarn build` to build all packages across the repo. This is required to run Storybook or the site.
3. Run `yarn storybook` to run a local instance of [storybook](https://storybook.js.org/docs/get-started/install#start-storybook) for development
4. Run `cd site && yarn serve` to run a local instance of the [documentation](https://www.saltdesignsystem.com/) site.

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
3. Run `yarn build:icons` to build the icons.
4. Write a changeset using `yarn changeset`, this should have the format:

```md
Added:

- IconName
```

### Prop deprecation

To deprecate a prop, you should:

1. Add a comment above the prop in the component's `.tsx` file, indicating that it is deprecated and providing information on what to use instead. This should use the @deprecated JSDoc tag.
2. Update the component's documentation to reflect the deprecation, including the reason for deprecation and the recommended alternative.
3. Add a changeset with the deprecation information, including the prop name, the reason for deprecation, and the recommended alternative. The changeset should show contain a diff code block.

### Theming

Additions and updates to the theme come from our designers. Any changes to the theme should have solid reasoning, be well-documented and follow clear steps for any necessary deprecation. All Salt theme tokens are prefixed with `--salt-`, followed by `-<characteristic | foundation>-`, and then the intent of the token: for example `--salt-actionable-cta-background`. For more information on tokens, see our [Theme docs](https://storybook.saltdesignsystem.com/?path=/docs/theme-about-the-salt-theme--docs). Tokens should align 100% with Figma to ensure ease of communication between designers and developers.

#### How to add new tokens

1. Add the token to the appropriate `.css` file in `packages/theme/css`
2. Document the token if appropriate in the foundations section on the site.
3. Add a changeset listing the new tokens.

#### How to remove/deprecate tokens

If tokens are for some reason removed from the theme, this is a breaking change, and you must add them to the `deprecated` folder.

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

5. Add a changeset with the appropriate information.
6. Any components using the deprecated tokens where the replacement token has the same value can use the replacement token instead immediately. If the value of the replacement token differs, this should be noted in the changeset.

### Pull requests

- Most pull requests should have a related issue. This helps us track the changes, agree scope and ensures that the pull request is addressing a specific problem or feature.
- Small pull requests are preferred, as they are easier to review and test. If you have a large change, consider breaking it down into smaller pull requests.
- Pull requests should include tests for any new functionality or changes to existing functionality. These can either be behavioural tests using Cypress component tests or visual tests using Chromatic.
- Pull request titles and commits should be written in the present tense, e.g. "Add new icon" or "Fix bug in component".
- Each user-facing change should be documented in a changeset. The changeset should be written in past tense, e.g. "Added new icon" or "Fixed bug in component".
- To help efficiency, please self-review your pull request before submitting it.
- If your pull request is not ready for review, please mark it as a draft. This will help us avoid reviewing pull requests that are not ready.

#### Chromatic

##### Pull requests

To run visual regression tests using Chromatic, you will need to add the `chromatic` label to your pull request. This should only been done when the pull request is ready for review and has been tested locally. Once the label is added.
By default, Chromatic will use Turbosnap to only snapshot the changed stories. If you want to disable this you can use the label: `no turbosnap`.

##### QA stories

- QA stories should be inside a QA stories file e.g. `button.qa.stories.tsx`.
- The title in the metadata should include the component name e.g. "Button QA".
- Since there is a cost associated with running Chromatic, QA stories should be limited to the minimum number of stories required to test the component. You can use the `QAContainer` to show multiple variants of a component.

To enable Chromatic to run these stories, you will need to add extra parameters to the stories e.g.:

```ts
Story.parameters = {
  chromatic: {
    disableSnapshot: false,
    modes: {
      theme: {
        themeNext: "disable",
      },
      themeNext: {
        themeNext: "enable",
        corner: "rounded",
        accent: "teal",
        // Ignore headingFont given font is not loaded
      },
    },
  },
};
```
