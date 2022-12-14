import { BorderItem } from "@salt-ds/core";

/*
 * Important: These tests are meant for testing TypeScript type errors only
 */

/*
 * Should allow relevant html attributes
 */
<BorderItem position="center" as="div">
  Border item content
</BorderItem>;

<BorderItem position="center" as="main">
  Border item content
</BorderItem>;

<BorderItem position="center" as="section">
  Border item content
</BorderItem>;

<BorderItem position="center" as="article">
  Border item content
</BorderItem>;

/*
 * Should not allow unrelated html attributes
 */

// Property 'href' does not exist on element type 'div'
// @ts-expect-error
<BorderItem position="center" as="div" href="www.example.com">
  Border item content
</BorderItem>;

// Property 'href' does not exist on element type 'main'
// @ts-expect-error
<BorderItem position="center" as="main" href="www.example.com">
  Border item content
</BorderItem>;

// Property 'checked' does not exist on element type 'div'
// @ts-expect-error
<BorderItem position="center" as="div" checked>
  Border item content
</BorderItem>;

// Property 'label' does not exist on element type 'div'
// @ts-expect-error
<BorderItem position="center" as="div" label="example label">
  Border item content
</BorderItem>;

// Property 'name' does not exist on element type 'nav'
// @ts-expect-error
<BorderItem position="center" as="nav" name="example name">
  Border item content
</BorderItem>;
