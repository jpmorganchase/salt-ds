import { BorderItem } from "@jpmorganchase/uitk-core";

/*
 * Important: These tests are meant for testing TypeScript type errors only
 */

/*
 * Should allow relevant html attributes
 */
<BorderItem position="main" as="div">
  Border item content
</BorderItem>;

<BorderItem position="main" as="main">
  Border item content
</BorderItem>;

<BorderItem position="main" as="section">
  Border item content
</BorderItem>;

<BorderItem position="main" as="article">
  Border item content
</BorderItem>;

/*
 * Should not allow unrelated html attributes
 */

// Property 'href' does not exist on element type 'div'
// @ts-expect-error
<BorderItem position="main" as="div" href="www.example.com">
  Border item content
</BorderItem>;

// Property 'href' does not exist on element type 'main'
// @ts-expect-error
<BorderItem position="main" as="main" href="www.example.com">
  Border item content
</BorderItem>;

// Property 'checked' does not exist on element type 'div'
// @ts-expect-error
<BorderItem position="main" as="div" checked>
  Border item content
</BorderItem>;

// Property 'label' does not exist on element type 'div'
// @ts-expect-error
<BorderItem position="main" as="div" label="example label">
  Border item content
</BorderItem>;

// Property 'name' does not exist on element type 'nav'
// @ts-expect-error
<BorderItem position="main" as="nav" name="example name">
  Border item content
</BorderItem>;
