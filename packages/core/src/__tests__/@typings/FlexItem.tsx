import { FlexItem } from "@salt-ds/core";

/*
 * Important: These tests are meant for testing TypeScript type errors only
 */

/*
 * Should allow relevant html attributes
 */
<FlexItem as="a" href="www.example.com">
  Flex item content
</FlexItem>;

<FlexItem as="link" href="www.example.com">
  Flex item content
</FlexItem>;

<FlexItem as="input" checked>
  Flex item content
</FlexItem>;

<FlexItem as="option" label="example label">
  Flex item content
</FlexItem>;

<FlexItem as="button" name="example name">
  Flex item content
</FlexItem>;

/*
 * Should not allow unrelated html attributes
 */

// Property 'href' does not exist on element type 'div'
// @ts-expect-error
<FlexItem as="div" href="www.example.com">
  Flex item content
</FlexItem>;

// Property 'href' does not exist on element type 'main'
// @ts-expect-error
<FlexItem as="main" href="www.example.com">
  Flex item content
</FlexItem>;

// Property 'checked' does not exist on element type 'img'
// @ts-expect-error
<FlexItem as="img" checked>
  Flex item content
</FlexItem>;

// Property 'label' does not exist on element type 'div'
// @ts-expect-error
<FlexItem as="div" label="example label">
  Flex item content
</FlexItem>;

// Property 'name' does not exist on element type 'nav'
// @ts-expect-error
<FlexItem as="nav" name="example name">
  Flex item content
</FlexItem>;
