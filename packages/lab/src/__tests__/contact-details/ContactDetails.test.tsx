import React from "react";
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
} from "../../contact-details";
import { fireEvent, render, screen } from "@testing-library/react";

const actionSpy = jest.fn();

const variants: ContactDetailsVariant[] = ["default", "compact", "mini"];

const primaryText = "Persona A";
const secondaryText = "Persona A Limited";
const actionLabels = ["phone", "message", "chat"];
const metadata = [
  ["Role", "Role A"],
  ["Location", "Location A"],
  ["Office", "+00 1234 567890"],
  ["Bloomberg", "personaa@bloomberg.net"],
  ["Email", "personaa@example.com"],
] as [string, string][];

variants.forEach((variant) => {
  describe(`Given a ${variant} ContactDetails with favorite toggle`, () => {
    const onFavoriteChangeSpy = jest.fn();
    beforeEach(() => {
      jest.resetAllMocks();

      render(
        <ContactDetails variant={variant}>
          <ContactAvatar />
          <ContactFavoriteToggle onChange={onFavoriteChangeSpy} />
          <ContactPrimaryInfo text={primaryText} />
          <ContactSecondaryInfo
            text={secondaryText}
            ValueComponent={MailLinkComponent}
          />
          <ContactTertiaryInfo text="SPN 1234567" />
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
      test("Avatar is shown", () => {
        expect(screen.getByText("PA")).toBeInTheDocument();
      });

    test("Primary information is rendered", () => {
      expect(screen.getByText(primaryText)).toBeInTheDocument();
    });

    test("Favorite toggle is rendered", () => {
      expect(screen.getByLabelText("Favorite")).toBeInTheDocument();
    });

    test("onFavoriteChange is called when toggle is clicked", () => {
      fireEvent.click(screen.getByLabelText("Favorite"));
      expect(onFavoriteChangeSpy).toHaveBeenCalledTimes(1);
    });

    test("Secondary information is rendered", () => {
      expect(screen.getByText(secondaryText)).toBeInTheDocument();
    });

    variant !== "mini" &&
      test("Tertiary information is rendered", () => {
        expect(screen.getByText(secondaryText)).toBeInTheDocument();
      });

    variant !== "mini" &&
      test("Fast actions are rendered", () => {
        for (const label of actionLabels) {
          expect(screen.getByText(label)).toBeInTheDocument();
        }
      });

    variant !== "mini" &&
      test("Fast actions callback are fired when clicked", () => {
        for (const label of actionLabels) {
          fireEvent.click(screen.getByText(label));
        }
        expect(actionSpy).toHaveBeenCalledTimes(3);
      });

    variant === "default" &&
      test("Metadata are rendered", () => {
        for (const meta of metadata) {
          expect(screen.getByText(meta[1])).toBeInTheDocument();
        }
      });
  });
});

variants.forEach((variant) => {
  test(`Given a ${variant} ContactDetails with controlled favorite toggle would render correctly after prop change`, () => {
    const { container, rerender } = render(
      <ContactDetails variant={variant}>
        <ContactFavoriteToggle isFavorite={false} />
        <ContactPrimaryInfo text={primaryText} />
      </ContactDetails>
    );

    expect(container.querySelector("svg")).toHaveClass(
      "uitkContactFavoriteToggle-deselected"
    );

    rerender(
      <ContactDetails variant={variant}>
        <ContactFavoriteToggle isFavorite={true} />
        <ContactPrimaryInfo text={primaryText} />
      </ContactDetails>
    );

    expect(container.querySelector("svg")).toHaveClass(
      "uitkContactFavoriteToggle-selected"
    );
  });
});

variants.forEach((variant) => {
  test(`Given a ${variant} ContactDetails with defaultIsFavorite`, () => {
    const { container } = render(
      <ContactDetails variant={variant}>
        <ContactFavoriteToggle defaultIsFavorite={false} />
        <ContactPrimaryInfo text={primaryText} />
      </ContactDetails>
    );

    expect(container.querySelector("svg")).toHaveClass(
      "uitkContactFavoriteToggle-deselected"
    );

    fireEvent.click(container.querySelector("svg")!);

    expect(container.querySelector("svg")).toHaveClass(
      "uitkContactFavoriteToggle-selected"
    );
  });
});
