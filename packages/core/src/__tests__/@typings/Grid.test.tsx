/* eslint-disable jest/expect-expect */
import { GridLayout } from "@jpmorganchase/uitk-core";

/*
 * Important: These tests are meant for testing TypeScript type errors only
 */

describe("GIVEN a GridLayout", () => {
  test("THEN it should allow relevant html attributes", () => {
    <GridLayout as="a" href="www.example.com">
      Grid layout content
    </GridLayout>;

    <GridLayout as="link" href="www.example.com">
      Grid layout content
    </GridLayout>;

    <GridLayout as="input" checked>
      Grid layout content
    </GridLayout>;

    <GridLayout as="option" label="example label">
      Grid layout content
    </GridLayout>;

    <GridLayout as="button" name="example name">
      Grid layout content
    </GridLayout>;
  });

  test("THEN it should not allow relevant html attributes", () => {
    // @ts-expect-error
    <GridLayout as="div" href="www.example.com">
      Grid layout content
    </GridLayout>;

    // @ts-expect-error
    <GridLayout as="main" href="www.example.com">
      Grid layout content
    </GridLayout>;

    // @ts-expect-error
    <GridLayout as="img" checked>
      Grid layout content
    </GridLayout>;

    // @ts-expect-error
    <GridLayout as="div" label="example label">
      Grid layout content
    </GridLayout>;

    // @ts-expect-error
    <GridLayout as="nav" name="example name">
      Grid layout content
    </GridLayout>;
  });
});
