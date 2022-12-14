import { GridLayout } from "@salt-ds/core";

/*
 * Important: These tests are meant for testing TypeScript type errors only
 */

/*
 * Should allow relevant html attributes
 */
<GridLayout as="div">Grid layout content</GridLayout>;

<GridLayout as="main">Grid layout content</GridLayout>;

<GridLayout as="section">Grid layout content</GridLayout>;

<GridLayout as="article">Grid layout content</GridLayout>;

/*
 * Should not allow unrelated html attributes
 */
// Property 'href' does not exist on element type 'div'
// @ts-expect-error
<GridLayout as="div" href="www.example.com">
  Grid layout content
</GridLayout>;

// Property 'href' does not exist on element type 'main'
// @ts-expect-error
<GridLayout as="main" href="www.example.com">
  Grid layout content
</GridLayout>;

// Property 'checked' does not exist on element type 'img'
// @ts-expect-error
<GridLayout as="img" checked>
  Grid layout content
</GridLayout>;

// Property 'label' does not exist on element type 'div'
// @ts-expect-error
<GridLayout as="div" label="example label">
  Grid layout content
</GridLayout>;

// Property 'name' does not exist on element type 'nav'
// @ts-expect-error
<GridLayout as="nav" name="example name">
  Grid layout content
</GridLayout>;
