import { GridItem } from "@jpmorganchase/uitk-core";

/*
 * Important: These tests are meant for testing TypeScript type errors only
 */

/*
 * Should allow relevant html attributes
 */
<GridItem as="a" href="www.example.com">
  Grid item content
</GridItem>;

<GridItem as="link" href="www.example.com">
  Grid item content
</GridItem>;

<GridItem as="input" checked>
  Grid item content
</GridItem>;

<GridItem as="option" label="example label">
  Grid item content
</GridItem>;

<GridItem as="button" name="example name">
  Grid item content
</GridItem>;

/*
 * Should not allow unrelated html attributes
 */

// Property 'href' does not exist on element type 'div'
// @ts-expect-error
<GridItem as="div" href="www.example.com">
  Grid item content
</GridItem>;

// Property 'href' does not exist on element type 'main'
// @ts-expect-error
<GridItem as="main" href="www.example.com">
  Grid item content
</GridItem>;

// Property 'checked' does not exist on element type 'img'
// @ts-expect-error
<GridItem as="img" checked>
  Grid item content
</GridItem>;

// Property 'label' does not exist on element type 'div'
// @ts-expect-error
<GridItem as="div" label="example label">
  Grid item content
</GridItem>;

// Property 'name' does not exist on element type 'nav'
// @ts-expect-error
<GridItem as="nav" name="example name">
  Grid item content
</GridItem>;
