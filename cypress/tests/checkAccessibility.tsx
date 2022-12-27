import { StoriesWithPartialProps } from "@storybook/testing-react/dist/types";
import { StoryFn } from "@storybook/react";
import { Options } from "cypress-axe";

export function checkAccessibility(stories: StoriesWithPartialProps<unknown>) {
  describe("Axe Testing", () => {
    Object.entries(stories).forEach(([name, StoryComponent]) => {
      const Component = StoryComponent as StoryFn<unknown>;

      const disabledRules: string[] =
        Component.parameters?.axe?.disabledRules ?? [];
      const shouldSkip: boolean = Component.parameters?.axe?.skip;

      const testFunction = shouldSkip ? it.skip : it;

      testFunction(`Story "${name}", should not have an axe violations`, () => {
        cy.mount(<Component />);

        const rules = disabledRules.reduce((acc, rule) => {
          acc[rule] = { enabled: false };
          return acc;
        }, {} as Required<Options>["rules"]);

        cy.checkAxeComponent({ rules }, true);
      });
    });
  });
}
