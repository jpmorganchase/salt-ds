import {
  ContactAction,
  ContactActions,
  ContactAvatar,
  ContactDetails,
  type ContactDetailsProps,
  type ContactDetailsVariant,
  ContactFavoriteToggle,
  ContactMetadata,
  ContactMetadataItem,
  type ContactMetadataProps,
  ContactPrimaryInfo,
  ContactSecondaryInfo,
  ContactTertiaryInfo,
} from "@salt-ds/lab";
import { beforeEach, describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";

const variants: ContactDetailsVariant[] = ["default", "compact", "mini"];
const persona = {
  name: "Persona A",
  company: "Persona A Limited",
  spn: "SPN 1234567",
  role: "Role A",
  location: "Location A",
  phone: "+00 1234 567890",
  bloomberg: "personaa@bloomberg.net",
  email: "personaa@example.com",
};
const actions = [
  ["phone", "Call PersonaA"],
  ["message", "Message PersonaA"],
  ["chat", "Chat with PersonaA"],
] as const;
const metadata = [
  ["Role", persona.role],
  ["Location", persona.location],
  ["Office", persona.phone],
  ["Bloomberg", persona.bloomberg],
  ["Email", persona.email],
] as const;

type PersonaContactProps = Pick<ContactDetailsProps, "variant"> &
  Pick<ContactMetadataProps, "collapsible"> & { headingAriaLevel?: number };

function PersonaContact({
  variant,
  collapsible,
  headingAriaLevel,
}: PersonaContactProps) {
  return (
    <ContactDetails variant={variant}>
      <ContactAvatar />
      <ContactFavoriteToggle />
      <ContactPrimaryInfo text={persona.name} aria-level={headingAriaLevel} />
      <ContactSecondaryInfo text={persona.company} />
      <ContactTertiaryInfo text={persona.spn} />
      <ContactActions>
        {actions.map(([label, accessibleText]) => (
          <ContactAction
            label={label}
            accessibleText={accessibleText}
            key={label}
          />
        ))}
      </ContactActions>
      <ContactMetadata collapsible={collapsible}>
        {metadata.map(([label, value]) => (
          <ContactMetadataItem value={value} label={label} key={label} />
        ))}
      </ContactMetadata>
    </ContactDetails>
  );
}

function disclosure() {
  return page.getByRole("button").filter({
    has: page.getByTestId(/Chevron(Down|Up)Icon/),
  });
}

for (const variant of variants) {
  describe(`GIVEN an accessible ${variant} ContactDetails`, () => {
    beforeEach(async () => {
      await renderWithSalt(<PersonaContact variant={variant} />);
    });

    it("uses article semantics", async () => {
      await expect
        .element(page.getByRole("article"))
        .toHaveAttribute("aria-roledescription", "Contact Card");
    });

    it("uses a level-two heading", async () => {
      await expect
        .element(page.getByRole("heading"))
        .toHaveAttribute("aria-level", "2");
    });

    it("supports a custom heading level", async () => {
      await renderWithSalt(
        <PersonaContact headingAriaLevel={4} variant={variant} />,
      );
      await expect
        .element(page.getByRole("heading"))
        .toHaveAttribute("aria-level", "4");
    });

    it("labels the heading with its visible information", async () => {
      const heading = page.getByRole("heading").element();
      const secondary = page.getByTestId("secondary").element();
      const ids = [heading.id, secondary.id];
      if (variant === "default")
        ids.push(page.getByTestId("tertiary").element().id);
      await expect
        .element(page.getByRole("heading"))
        .toHaveAttribute(
          "aria-labelledby",
          expect.stringContaining(ids.join(" ")),
        );
    });

    it("labels the favorite toggle", async () => {
      await expect.element(page.getByLabelText("Favorite")).toBeInTheDocument();
    });

    if (variant !== "mini") {
      it("hides the avatar from assistive technology", async () => {
        await expect
          .element(page.getByText("PA"))
          .toHaveAttribute("aria-hidden", "true");
      });
    }

    it("uses the expected tab sequence", async () => {
      await userEvent.tab();
      await expect.element(page.getByLabelText("Favorite")).toHaveFocus();
      if (variant !== "mini") {
        for (const [label, accessibleText] of actions) {
          await userEvent.tab();
          await expect
            .element(page.getByText(label, { exact: true }))
            .toHaveFocus();
          await expect
            .element(page.getByText(accessibleText))
            .toBeInTheDocument();
        }
      }
    });
  });
}

describe("GIVEN a default collapsible ContactDetails", () => {
  beforeEach(async () => {
    await renderWithSalt(<PersonaContact collapsible variant="default" />);
  });

  it("labels its disclosure button with the primary element", async () => {
    const expand = disclosure();
    const expandElement = expand.element();
    const primary = page.getByText(persona.name, { exact: true }).element();
    await expect
      .element(expand)
      .toHaveAttribute("aria-labelledby", `${expandElement.id} ${primary.id}`);
  });

  it("updates the disclosure label and expanded state", async () => {
    const expand = disclosure();
    await expect.element(expand).toHaveAttribute("aria-label", "Expand");
    await expect.element(expand).toHaveAttribute("aria-expanded", "false");
    await expand.click();
    await expect.element(disclosure()).toHaveAttribute("aria-expanded", "true");
  });

  it("places the disclosure after favorite and actions in tab order", async () => {
    await disclosure().click();
    page.getByLabelText("Favorite").element().focus();
    for (const [label, accessibleText] of actions) {
      await userEvent.tab();
      await expect
        .element(page.getByText(label, { exact: true }))
        .toHaveFocus();
      await expect.element(page.getByText(accessibleText)).toBeInTheDocument();
    }
    await userEvent.tab();
    await expect.element(disclosure()).toHaveFocus();
  });
});
