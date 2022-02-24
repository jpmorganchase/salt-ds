import {
  fireEvent,
  render,
  RenderResult,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { FC } from "react";
import {
  ContactAction,
  ContactActions,
  ContactAvatar,
  ContactDetails,
  ContactDetailsProps,
  ContactDetailsVariant,
  ContactFavoriteToggle,
  ContactMetadata,
  ContactMetadataItem,
  ContactMetadataProps,
  ContactPrimaryInfo,
  ContactSecondaryInfo,
  ContactTertiaryInfo,
} from "../../contact-details";
import { act } from "react-dom/test-utils";

const variants: ContactDetailsVariant[] = ["default", "compact", "mini"];

const personaA = {
  name: "Persona A",
  company: "Persona A Limited",
  spn: "SPN 1234567",
  role: "Role A",
  location: "Location A",
  phone: "+00 1234 567890",
  bloomberg: "personaa@bloomberg.net",
  email: "personaa@example.com",
};

const testActions = [
  ["phone", "Call PersonaA"],
  ["message", "Message PersonaA"],
  ["chat", "Chat with PersonaA"],
] as [string, string][];

const testMetadata = [
  ["Role", personaA.role],
  ["Location", personaA.location],
  ["Office", personaA.phone],
  ["Bloomberg", personaA.bloomberg],
  ["Email", personaA.email],
] as [string, string][];

const focusedMetadata = testMetadata.slice(3);

type PersonaAContactDetailsProps = Pick<ContactDetailsProps, "variant"> &
  Pick<ContactMetadataProps, "collapsible"> & {
    headingAriaLevel?: number;
  };

const PersonaAContactDetails: FC<PersonaAContactDetailsProps> = (props) => {
  return (
    <ContactDetails variant={props.variant}>
      <ContactAvatar />
      <ContactFavoriteToggle />
      <ContactPrimaryInfo
        text={personaA.name}
        aria-level={props.headingAriaLevel}
      />
      <ContactSecondaryInfo text={personaA.company} />
      <ContactTertiaryInfo text={personaA.spn} />
      <ContactActions>
        {testActions.map(([label, text]) => (
          <ContactAction label={label} accessibleText={text} key={label} />
        ))}
      </ContactActions>
      <ContactMetadata collapsible={props.collapsible}>
        {testMetadata.map(([label, value]) => (
          <ContactMetadataItem value={value} label={label} key={label} />
        ))}
      </ContactMetadata>
    </ContactDetails>
  );
};

variants.forEach((variant) => {
  describe(`Given a ${variant} ContactDetails`, () => {
    let contactDetailsRender: RenderResult;

    beforeEach(() => {
      contactDetailsRender = render(
        <PersonaAContactDetails variant={variant} />
      );
    });

    describe("ARIA attributes", () => {
      test('container has role "article" and role description "Contact Card"', () => {
        const rootElement = screen.getByRole("article");
        expect(rootElement).toBeInTheDocument();
        expect(rootElement).toHaveAttribute(
          "aria-roledescription",
          "Contact Card"
        );
      });

      describe("title element container", () => {
        test('has role "heading" and aria level', () => {
          const titleElement = screen.getByRole("heading");
          expect(titleElement).toBeInTheDocument();
          expect(titleElement).toHaveAttribute("aria-level", "2");
        });

        test("can configure aria level", () => {
          const customHeadinglevel = 4;
          contactDetailsRender.rerender(
            <PersonaAContactDetails
              headingAriaLevel={customHeadinglevel}
              variant={variant}
            />
          );
          const titleElement = screen.getByRole("heading");
          expect(titleElement).toHaveAttribute(
            "aria-level",
            customHeadinglevel.toString()
          );
        });

        test("contains aria labelled by attribute", () => {
          const titleElement = screen.getByRole("heading");
          const titleLabelledBy = titleElement.getAttribute("aria-labelledby");
          const secondaryElement = screen.getByTestId("secondary");

          expect(titleElement.id).toContain("uitk-");
          expect(secondaryElement.id).toContain("uitk-");

          expect(titleLabelledBy).toContain(titleElement.id);
          expect(titleLabelledBy).toContain(secondaryElement.id);

          if (variant === "default") {
            const tertiaryElement = screen.getByTestId("tertiary");
            expect(tertiaryElement.id).toContain("uitk-");
            expect(titleLabelledBy).toContain(tertiaryElement.id);
          }
        });
      });

      test('favorite toggle has aria label "Favorite"', () => {
        expect(screen.getByLabelText("Favorite")).toBeInTheDocument();
      });

      variant !== "mini" &&
        test("avatar has aria hidden true", () => {
          expect(screen.getByText("PA")).toHaveAttribute("aria-hidden", "true");
        });
    });

    test(`tab sequence follows favorite toggle${
      variant !== "mini"
        ? `, actions${variant === "default" ? " to metadata" : ""}`
        : ""
    }`, async () => {
      userEvent.tab();
      expect(screen.getByLabelText("Favorite")).toHaveFocus();

      if (variant !== "mini") {
        for (const [label, text] of testActions) {
          userEvent.tab();
          expect(
            // parentElement is <button>
            (await screen.findByText(label)).parentElement
          ).toHaveFocus();
          expect(await screen.findByText(text)).toBeInTheDocument();
        }
      }

      if (variant === "default") {
        for (const [label, value] of focusedMetadata) {
          userEvent.tab();
          expect(await screen.findByText(value)).toHaveFocus();
        }
      }
    });
  });
});

describe("Given a default collapsible ContactDetails", () => {
  beforeEach(() => {
    render(<PersonaAContactDetails collapsible={true} variant="default" />);
  });

  describe("Disclosure button", () => {
    test("has aria labelled by button id and primary element id", () => {
      const button = screen.getByRole("button", { name: /Expand/ });
      const primaryElement = screen.getByText(personaA.name);

      const buttonLabelledby = button.getAttribute("aria-labelledby");
      expect(buttonLabelledby).toContain(button.id);
      expect(buttonLabelledby).toContain(primaryElement.id);
    });

    test("label changes from Expand to Collapse after clicking", () => {
      const button = screen.getByRole("button", { name: /Expand/ });
      act(() => {
        fireEvent.click(button);
      });
      expect(button).toHaveAttribute("aria-label", "Collapse");
    });

    test("aria expanded becomes true after clicking", () => {
      const button = screen.getByRole("button", { name: /Expand/ });
      expect(button).toHaveAttribute("aria-expanded", "false");
      act(() => {
        fireEvent.click(button);
      });
      expect(button).toHaveAttribute("aria-expanded", "true");
    });
  });

  test("tab sequence follows favorite, actions, collapse button to metadata", async () => {
    const expandButton = screen.getByRole("button", { name: /Expand/ });
    act(() => {
      fireEvent.click(expandButton);
    });

    screen.getByLabelText("Favorite").focus();

    for (const [label, text] of testActions) {
      userEvent.tab();
      expect(
        // parentElement is <button>
        (await screen.findByText(label)).parentElement
      ).toHaveFocus();
      expect(await screen.findByText(text)).toBeInTheDocument();
    }

    userEvent.tab();
    expect(expandButton).toHaveFocus();

    for (const [label, value] of focusedMetadata) {
      userEvent.tab();
      expect(await screen.findByText(value)).toHaveFocus();
    }
  });
});
