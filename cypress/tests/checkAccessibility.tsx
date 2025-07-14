import type { ReactRenderer, StoryFn } from "@storybook/react-vite";
import type { Options } from "cypress-axe";
import type { StoriesWithPartialProps } from "storybook/internal/types";

export function checkAccessibility(
  stories: StoriesWithPartialProps<ReactRenderer, unknown>,
) {
  describe("Axe Testing", () => {
    for (const [name, StoryComponent] of Object.entries(stories)) {
      const Component = StoryComponent as StoryFn<unknown>;

      const disabledRules: string[] =
        Component.parameters?.axe?.disabledRules ?? [];
      const shouldSkip: boolean = Component.parameters?.axe?.skip;

      const testFunction = shouldSkip ? it.skip : it;

      testFunction(`Story "${name}", should not have an axe violations`, () => {
        cy.mount(<Component />);

        const rules = disabledRules.reduce(
          (acc, rule) => {
            acc[rule] = { enabled: false };
            return acc;
          },
          {} as Required<Options>["rules"],
        );

        cy.checkAxeComponent({ rules }, true);
      });
    }
  });
}
