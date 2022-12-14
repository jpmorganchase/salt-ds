import { FlexLayout } from "@salt-ds/core";

/*
 * Important: These tests are meant for testing TypeScript type errors only
 */

/*
 * Should allow relevant html attributes
 */
<FlexLayout as="div">Flex layout content</FlexLayout>;

<FlexLayout as="main">Flex layout content</FlexLayout>;

<FlexLayout as="section">Flex layout content</FlexLayout>;

<FlexLayout as="article">Flex layout content</FlexLayout>;

/*
 * Should not allow unrelated html attributes
 */
// Property 'href' does not exist on element type 'div'
// @ts-expect-error
<FlexLayout as="div" href="www.example.com">
  Flex layout content
</FlexLayout>;

// Property 'href' does not exist on element type 'main'
// @ts-expect-error
<FlexLayout as="main" href="www.example.com">
  Flex layout content
</FlexLayout>;

// Property 'checked' does not exist on element type 'img'
// @ts-expect-error
<FlexLayout as="img" checked>
  Flex layout content
</FlexLayout>;

// Property 'label' does not exist on element type 'div'
// @ts-expect-error
<FlexLayout as="div" label="example label">
  Flex layout content
</FlexLayout>;

// Property 'name' does not exist on element type 'nav'
// @ts-expect-error
<FlexLayout as="nav" name="example name">
  Flex layout content
</FlexLayout>;
