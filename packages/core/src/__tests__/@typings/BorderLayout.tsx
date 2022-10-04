import { BorderLayout } from "@jpmorganchase/uitk-core";

/*
 * Important: These tests are meant for testing TypeScript type errors only
 */

/*
 * Should allow relevant html attributes
 */
<BorderLayout as="a" href="www.example.com">
  <p>Border layout content</p>
  <p>Border layout content</p>
</BorderLayout>;

<BorderLayout as="link" href="www.example.com">
  <p>Border layout content</p>
  <p>Border layout content</p>
</BorderLayout>;

<BorderLayout as="input" checked>
  <p>Border layout content</p>
  <p>Border layout content</p>
</BorderLayout>;

<BorderLayout as="option" label="example label">
  <p>Border layout content</p>
  <p>Border layout content</p>
</BorderLayout>;

<BorderLayout as="button" name="example name">
  <p>Border layout content</p>
  <p>Border layout content</p>
</BorderLayout>;

/*
 * Should not allow unrelated html attributes
 */
// Property 'href' does not exist on element type 'div'
// @ts-expect-error
<BorderLayout as="div" href="www.example.com">
  <p>Border layout content</p>
  <p>Border layout content</p>
</BorderLayout>;

// Property 'href' does not exist on element type 'main'
// @ts-expect-error
<BorderLayout as="main" href="www.example.com">
  <p>Border layout content</p>
  <p>Border layout content</p>
</BorderLayout>;

// Property 'checked' does not exist on element type 'img'
// @ts-expect-error
<BorderLayout as="img" checked>
  <p>Border layout content</p>
  <p>Border layout content</p>
</BorderLayout>;

// Property 'label' does not exist on element type 'div'
// @ts-expect-error
<BorderLayout as="div" label="example label">
  <p>Border layout content</p>
  <p>Border layout content</p>
</BorderLayout>;

// Property 'name' does not exist on element type 'nav'
// @ts-expect-error
<BorderLayout as="nav" name="example name">
  <p>Border layout content</p>
  <p>Border layout content</p>
</BorderLayout>;
