import {
  ContactDetails,
  ContactDetailsVariant,
  MailLinkComponent,
  ContactPrimaryInfo,
  ContactSecondaryInfo,
  ContactTertiaryInfo,
  ContactActions,
  ContactAction,
  ContactMetadata,
  ContactMetadataItem,
  ContactFavoriteToggle,
  ContactAvatar,
} from "@jpmorganchase/uitk-lab";

const variants: ContactDetailsVariant[] = ["default", "compact", "mini"];

const primaryText = "Persona A";
const secondaryText = "Persona A Limited";
const tertiaryText = "Role A";
const actionLabels = ["phone", "message", "chat"];
const metadata = [
  ["Location", "Location A"],
  ["Office", "+00 1234 567890"],
  ["Bloomberg", "personaa@bloomberg.net"],
  ["Email", "personaa@example.com"],
] as [string, string][];

variants.forEach((variant) => {
  describe(`Given a ${variant} ContactDetails with favorite toggle`, () => {
    beforeEach(() => {
      const onFavoriteChangeSpy = cy.spy().as("onFavoriteChange");
      const actionSpy = cy.spy().as("action");
      cy.mount(
        <ContactDetails variant={variant}>
          <ContactAvatar />
          <ContactFavoriteToggle onChange={onFavoriteChangeSpy} />
          <ContactPrimaryInfo text={primaryText} />
          <ContactSecondaryInfo
            text={secondaryText}
            ValueComponent={MailLinkComponent}
          />
          <ContactTertiaryInfo text={tertiaryText} />
          <ContactActions>
            {actionLabels.map((label) => (
              <ContactAction label={label} onClick={actionSpy} />
            ))}
          </ContactActions>
          <ContactMetadata>
            {metadata.map(([label, value]) => (
              <ContactMetadataItem value={value} label={label} />
            ))}
          </ContactMetadata>
        </ContactDetails>
      );
    });
    variant !== "mini" &&
      it("Avatar is shown", () => {
        cy.findByText("PA").should("exist");
      });

    it("Primary information is rendered", () => {
      cy.findByText(primaryText).should("exist");
    });

    it("Favorite toggle is rendered", () => {
      cy.findByLabelText("Favorite").should("exist");
    });

    it("onFavoriteChange is called when toggle is clicked", () => {
      cy.findByLabelText("Favorite").click();
      cy.get("@onFavoriteChange").should("be.calledOnce");
    });

    it("Secondary information is rendered", () => {
      cy.findByText(secondaryText).should("exist");
    });

    variant !== "mini" &&
      it("Tertiary information is rendered", () => {
        cy.findByText(tertiaryText).should("exist");
      });

    variant !== "mini" &&
      it("Fast actions are rendered", () => {
        for (const label of actionLabels) {
          cy.findByText(label).should("exist");
        }
      });

    variant !== "mini" &&
      it("Fast actions callback are fired when clicked", () => {
        for (const label of actionLabels) {
          cy.findByText(label).click();
        }
        cy.get("@action").should("be.called", 3);
      });

    variant === "default" &&
      it("Metadata are rendered", () => {
        for (const meta of metadata) {
          cy.findByText(meta[1]).should("exist");
        }
      });
  });
});

variants.forEach((variant) => {
  describe(`Given a ${variant} ContactDetails with controlled favorite toggle`, () => {
    it("would render correctly after prop change", () => {
      cy.mount(
        <ContactDetails variant={variant}>
          <ContactFavoriteToggle isFavorite={false} />
          <ContactPrimaryInfo text={primaryText} />
        </ContactDetails>
      );

      cy.get("svg").should(
        "have.class",
        "uitkContactFavoriteToggle-deselected"
      );

      cy.mount(
        <ContactDetails variant={variant}>
          <ContactFavoriteToggle isFavorite={true} />
          <ContactPrimaryInfo text={primaryText} />
        </ContactDetails>
      );

      cy.get("svg").should("have.class", "uitkContactFavoriteToggle-selected");
    });

    it("should toggle favorite on click", () => {
      cy.mount(
        <ContactDetails variant={variant}>
          <ContactFavoriteToggle defaultIsFavorite={false} />
          <ContactPrimaryInfo text={primaryText} />
        </ContactDetails>
      );

      cy.get("svg").should(
        "have.class",
        "uitkContactFavoriteToggle-deselected"
      );

      cy.findByLabelText("Favorite").click();
      cy.get("svg").should(
        "have.class",
        "uitkContactFavoriteToggle-deselecting"
      );
    });

    it("should toggle favorite on keypress", () => {
      cy.mount(
        <ContactDetails variant={variant}>
          <ContactFavoriteToggle defaultIsFavorite={false} />
          <ContactPrimaryInfo text={primaryText} />
        </ContactDetails>
      );

      cy.get("svg").should(
        "have.class",
        "uitkContactFavoriteToggle-deselected"
      );

      cy.realPress("Tab");
      cy.realPress("Enter");

      cy.get("svg").should("have.class", "uitkContactFavoriteToggle-selected");
    });
  });
});
