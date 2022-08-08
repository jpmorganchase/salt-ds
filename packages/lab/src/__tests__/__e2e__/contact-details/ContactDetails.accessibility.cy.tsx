import { FC } from "react";
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
} from "@jpmorganchase/uitk-lab";

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
    beforeEach(() => {
      cy.mount(<PersonaAContactDetails variant={variant} />);
    });

    describe("ARIA attributes", () => {
      it('container has role "article" and role description "Contact Card"', () => {
        cy.findByRole("article")
          .should("exist")
          .and("have.attr", "aria-roledescription", "Contact Card");
      });

      describe("title element container", () => {
        it('has role "heading" and aria level', () => {
          cy.findByRole("heading")
            .should("exist")
            .and("have.attr", "aria-level", "2");
        });

        it("can configure aria level", () => {
          cy.mount(
            <PersonaAContactDetails headingAriaLevel={4} variant={variant} />
          );
          cy.findByRole("heading").should("have.attr", "aria-level", "4");
        });

        it("contains aria labelled by attribute", () => {
          cy.findByRole("heading")
            .invoke("attr", "aria-labelledby")
            .then((headingLabelledBy) => {
              cy.findByRole("heading")
                .invoke("attr", "id")
                .then((headingId) => {
                  cy.findByTestId("secondary")
                    .invoke("attr", "id")
                    .then((secondaryId) => {
                      expect(headingLabelledBy).contain(
                        `${headingId} ${secondaryId}`
                      );

                      if (variant === "default") {
                        cy.findByTestId("tertiary")
                          .invoke("attr", "id")
                          .then((tertiaryId) => {
                            expect(headingLabelledBy).contain(
                              `${headingId} ${secondaryId} ${tertiaryId}`
                            );
                          });
                      }
                    });
                });
            });
        });
      });

      it('favorite toggle has aria label "Favorite"', () => {
        cy.findByLabelText("Favorite").should("exist");
      });

      variant !== "mini" &&
        it("avatar has aria hidden true", () => {
          cy.findByText("PA").should("have.attr", "aria-hidden", "true");
        });
    });

    it(`tab sequence follows favorite toggle${
      variant !== "mini" ? ", actions" : ""
    }`, () => {
      cy.realPress("Tab");
      cy.findByLabelText("Favorite").should("have.focus");

      if (variant !== "mini") {
        for (const [label, text] of testActions) {
          cy.realPress("Tab");
          cy.findByText(label).parent().should("have.focus");
          cy.findByText(text).should("exist");
        }
      }
    });
  });
});

describe("Given a default collapsible ContactDetails", () => {
  beforeEach(() => {
    cy.mount(<PersonaAContactDetails collapsible={true} variant="default" />);
  });

  describe("Disclosure button", () => {
    it("has aria labelled by button id and primary element id", () => {
      cy.findByLabelText("Expand")
        .invoke("attr", "id")
        .then((buttonId) => {
          cy.findByText(personaA.name)
            .invoke("attr", "id")
            .then((primaryId) => {
              cy.findByLabelText("Expand").should(
                "have.attr",
                "aria-labelledby",
                `${buttonId} ${primaryId}`
              );
            });
        });
    });

    it("label changes from Expand to Collapse after clicking and aria expanded becomes true after clicking", () => {
      cy.findByLabelText("Collapse").should("not.exist");
      cy.findByLabelText("Expand")
        .should("have.attr", "aria-expanded", "false")
        .click();
      cy.findByLabelText("Collapse")
        .should("exist")
        .and("have.attr", "aria-expanded", "true");
    });
  });

  it("tab sequence follows favorite, actions, collapse button", () => {
    cy.findByLabelText("Expand").click();
    cy.findByLabelText("Favorite").focus();

    for (const [label, text] of testActions) {
      cy.realPress("Tab");
      cy.findByText(label).parent().should("have.focus");
      cy.findByText(text).should("exist");
    }

    cy.realPress("Tab");
    cy.findByLabelText("Collapse").should("have.focus");
  });
});
