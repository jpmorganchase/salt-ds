import { SemanticIconProvider, useIcon } from "@salt-ds/core";
import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DoubleChevronDownIcon,
  DoubleChevronUpIcon,
  SuccessTickIcon,
  UserSolidIcon,
} from "@salt-ds/icons";

const TestComponent = () => {
  const icons = useIcon();
  return (
    <div>
      <icons.ExpandIcon data-testid="ChevronDownIcon" />
      <icons.CollapseIcon data-testid="ChevronUpIcon" />
      <icons.SuccessIcon data-testid="SuccessTickIcon" />
      <icons.CalendarIcon data-testid="CalendarIcon" />
      <icons.UserIcon data-testid="UserSolidIcon" />
    </div>
  );
};

describe("SemanticIconProvider", () => {
  it("should use default icons when provider is not wrapped", () => {
    cy.mount(<TestComponent />);
    cy.get('[data-testid="ChevronDownIcon"]').should("exist");
    cy.get('[data-testid="SuccessTickIcon"]').should("exist");
    cy.get('[data-testid="CalendarIcon"]').should("exist");
    cy.get('[data-testid="UserSolidIcon"]').should("exist");
  });

  it("should support overriding only specific icons", () => {
    cy.mount(
      <SemanticIconProvider
        iconMap={{
          CollapseIcon: DoubleChevronUpIcon,
          ExpandIcon: DoubleChevronDownIcon,
        }}
      >
        <TestComponent />
      </SemanticIconProvider>,
    );

    cy.get('[data-testid="ChevronDownIcon"]').should(
      "have.attr",
      "aria-label",
      "double chevron down",
    );
    cy.get('[data-testid="ChevronUpIcon"]').should(
      "have.attr",
      "aria-label",
      "double chevron up",
    );

    cy.get('[data-testid="SuccessTickIcon"]').should("exist");
    cy.get('[data-testid="CalendarIcon"]').should("exist");
    cy.get('[data-testid="UserSolidIcon"]').should("exist");
  });

  it("should support overriding all icons", () => {
    cy.mount(
      <SemanticIconProvider
        iconMap={{
          CollapseIcon: ChevronDownIcon,
          ExpandIcon: ChevronUpIcon,
          SuccessIcon: UserSolidIcon,
          CalendarIcon: SuccessTickIcon,
          UserIcon: CalendarIcon,
        }}
      >
        <TestComponent />
      </SemanticIconProvider>,
    );
    cy.get('[data-testid="ChevronDownIcon"]').should(
      "have.attr",
      "aria-label",
      "chevron up",
    );
    cy.get('[data-testid="ChevronUpIcon"]').should(
      "have.attr",
      "aria-label",
      "chevron down",
    );
    cy.get('[data-testid="SuccessTickIcon"]').should(
      "have.attr",
      "aria-label",
      "user solid",
    );
    cy.get('[data-testid="CalendarIcon"]').should(
      "have.attr",
      "aria-label",
      "success tick",
    );
    cy.get('[data-testid="UserSolidIcon"]').should(
      "have.attr",
      "aria-label",
      "calendar",
    );
  });
});
