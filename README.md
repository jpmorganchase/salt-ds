UITK provides you with a suite of UI components and a flexible theming system. With no customisation, the default theme offers an attractive and modern look-and-feel, with both light and dark variants and support for a range of UI densities.
We have included a theming system which allows you to easily create theme variations, or in fact substitute alternate themes.

The UITK has been developed with the following design goals:

- Providing a comprehensive set of commonly-used UI controls
- Complying with WCAG 2.1 accessibility guidelines
- To be lightweight and performant
- Offering flexible styling and theming support
- Minimizing dependencies on third-party libraries

# Installation

There are four packages you can install:

- @jpmorganchase/uitk-core is required, this contains stable components and receives
  new features and patch updates when needed.
- @jpmorganchase/uitk-lab is where we introduce new components which are under initial development until they are stable and moved over to uitk-core. This is typically an unstable environment and may have major breaking changes.
- @jpmorganchase/uitk-theme is required, this contains the uitk css files required
  for any application you develop with uitk.
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

You will then need to import the css files into your application, along with any components that you plan to use.

Here’s a quick example of a Call-to-Action (CTA) button for your reference:

```JSX
import { Button } from "@jpmorganchase/uitk-core";

import "@jpmorganchase/uitk-theme/index.css";

function App() {
  return <Button variant="cta">CTA Button</Button>;
}
```

# Accessibility

The UI toolkit is a high-quality, WCAG 2.1 compliant solution for building great, accessible experiences for your users.

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
