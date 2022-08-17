The UITK provides you with a suite of UI components and a flexible theming system. With no customisation, the default theme offers an attractive and modern look-and-feel, with both light and dark variants and support for a range of UI densities.
We have included a theming system which allows you to easily create theme variations, or in fact substitute alternate themes.

The UITK has been developed with the following design goals:

- Providing a comprehensive set of commonly-used UI controls.
- Complying with WCAG 2.1 accessibility guidelines.
- To be lightweight and performant.
- Offering flexible styling and theming support.
- Minimizing dependencies on third-party libraries.

# Installation

There are four packages you can install:

- @jpmorganchase/uitk-core is required, this contains stable components and receives
  new features and patch updates when needed.
- @jpmorganchase/uitk-lab is where we introduce new components which are under initial development until they are stable and moved over to uitk-core. This is typically an unstable environment and may have major breaking changes.
- @jpmorganchase/uitk-theme is required, this contains the UITK .css files required
  for any application you develop with UITK.
- @jpmorganchase/uitk-icons contains SVG-based icons you can use in your
  application.

Depending on the package manager you use, edit and run one of the following commands to install the packages you need:

```sh
npm install @jpmorganchase/uitk-core @jpmorganchase/uitk-theme @jpmorganchase/uitk-lab @jpmorganchase/uitk-icons
```

Or

```sh
yarn add @jpmorganchase/uitk-core @jpmorganchase/uitk-theme @jpmorganchase/uitk-lab @jpmorganchase/uitk-icons
```

You will then need to import the .css files into your application, along with any components that you plan to use.

Here’s a quick example of a Call-to-Action (CTA) button for your reference:

```JSX
import { Button, ToolkitProvider } from "@jpmorganchase/uitk-core";

import "@jpmorganchase/uitk-theme/index.css";

function App() {
  return (
    <ToolkitProvider>
      <Button variant="cta">CTA Button</Button>
    </ToolkitProvider>
  );
}
```

# Accessibility

The UITK is a high-quality, WCAG 2.1 compliant solution for building great, accessible experiences for your users.

## Screen reader support & compatibility

We support specific combinations of assistive technologies (ATs) and
browsers, outlined in the table below.

| Operating System | Web browser | Screen reader |
| ---------------- | ----------- | ------------- |
| Windows          | Firefox     | NVDA          |
|                  | Chrome      | JAWS          |
| macOS            | Safari      | VoiceOver     |

# Browser compatibility

| Web Browser  | Version         |
| ------------ | --------------- |
| Firefox      | 38+             |
| Chrome, Edge | last 2 versions |

# Thanks

<a href="https://www.chromatic.com/">
  <picture>
    <source srcset="https://user-images.githubusercontent.com/1671563/170278933-da4e813f-0e8f-4029-b6db-79890d9314d1.png" media="(prefers-color-scheme: dark)">
    <img src="https://user-images.githubusercontent.com/321738/84662277-e3db4f80-af1b-11ea-88f5-91d67a5e59f6.png" width="153" height="30" alt="Chromatic" />
  </picture>
</a>

Thanks to [Chromatic](https://www.chromatic.com/) for providing the visual testing platform that helps us review UI changes and catch visual regressions.
