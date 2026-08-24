import {
  ContactAction,
  ContactActions,
  ContactAvatar,
  ContactDetails,
  type ContactDetailsVariant,
  ContactFavoriteToggle,
  ContactMetadata,
  ContactMetadataItem,
  ContactPrimaryInfo,
  ContactSecondaryInfo,
  ContactTertiaryInfo,
  MailLinkComponent,
} from "@salt-ds/lab";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";

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
] as const;

async function renderContact(
  variant: ContactDetailsVariant,
  onFavoriteChange = vi.fn(),
  onAction = vi.fn(),
) {
  return renderWithSalt(
    <ContactDetails variant={variant}>
      <ContactAvatar />
      <ContactFavoriteToggle onChange={onFavoriteChange} />
      <ContactPrimaryInfo text={primaryText} />
      <ContactSecondaryInfo
        text={secondaryText}
        ValueComponent={MailLinkComponent}
      />
      <ContactTertiaryInfo text={tertiaryText} />
      <ContactActions>
        {actionLabels.map((label) => (
          <ContactAction label={label} onClick={onAction} key={label} />
        ))}
      </ContactActions>
      <ContactMetadata>
        {metadata.map(([label, value]) => (
          <ContactMetadataItem value={value} label={label} key={label} />
        ))}
      </ContactMetadata>
    </ContactDetails>,
  );
}

for (const variant of variants) {
  describe(`GIVEN a ${variant} ContactDetails with favorite toggle`, () => {
    let onFavoriteChange = vi.fn<(isFavorite: boolean) => void>();
    let onAction = vi.fn<React.MouseEventHandler<HTMLButtonElement>>();

    beforeEach(async () => {
      onFavoriteChange = vi.fn();
      onAction = vi.fn();
      await renderContact(variant, onFavoriteChange, onAction);
    });

    if (variant !== "mini") {
      it("shows the avatar", async () => {
        await expect.element(page.getByText("PA")).toBeInTheDocument();
      });
    }

    it("renders primary information", async () => {
      await expect
        .element(page.getByText(primaryText, { exact: true }))
        .toBeInTheDocument();
    });

    it("renders the favorite toggle", async () => {
      await expect.element(page.getByLabelText("Favorite")).toBeInTheDocument();
    });

    it("calls onFavoriteChange", async () => {
      await page.getByLabelText("Favorite").click();
      expect(onFavoriteChange).toHaveBeenCalledOnce();
    });

    it("renders secondary information", async () => {
      await expect.element(page.getByText(secondaryText)).toBeInTheDocument();
    });

    if (variant !== "mini") {
      it("renders tertiary information", async () => {
        await expect.element(page.getByText(tertiaryText)).toBeInTheDocument();
      });

      it("renders fast actions", async () => {
        for (const label of actionLabels) {
          await expect
            .element(page.getByRole("button", { name: label }))
            .toBeInTheDocument();
        }
      });

      it.each(actionLabels)("invokes the %s action", async (label) => {
        await page.getByRole("button", { name: label }).click();
        expect(onAction).toHaveBeenCalledOnce();
      });
    }

    if (variant === "default") {
      it("renders metadata", async () => {
        for (const [, value] of metadata) {
          await expect.element(page.getByText(value)).toBeInTheDocument();
        }
      });
    }
  });
}

function favoriteIconClass() {
  return (
    page
      .getByLabelText("Favorite")
      .element()
      .querySelector("svg")
      ?.getAttribute("class") ?? ""
  );
}

for (const variant of variants) {
  describe(`GIVEN a ${variant} controlled favorite toggle`, () => {
    it("updates after a prop change", async () => {
      const { rerender } = await renderWithSalt(
        <ContactDetails variant={variant}>
          <ContactFavoriteToggle isFavorite={false} />
          <ContactPrimaryInfo text={primaryText} />
        </ContactDetails>,
      );
      expect(favoriteIconClass()).toContain(
        "saltContactFavoriteToggle-deselected",
      );

      await rerender(
        <ContactDetails variant={variant}>
          <ContactFavoriteToggle isFavorite />
          <ContactPrimaryInfo text={primaryText} />
        </ContactDetails>,
      );
      expect(favoriteIconClass()).toContain(
        "saltContactFavoriteToggle-selected",
      );
    });

    it("toggles favorite on click", async () => {
      await renderWithSalt(
        <ContactDetails variant={variant}>
          <ContactFavoriteToggle defaultIsFavorite={false} />
          <ContactPrimaryInfo text={primaryText} />
        </ContactDetails>,
      );
      expect(favoriteIconClass()).toContain(
        "saltContactFavoriteToggle-deselected",
      );
      await page.getByLabelText("Favorite").click();
      await expect
        .poll(favoriteIconClass)
        .toContain("saltContactFavoriteToggle-deselecting");
    });

    it("toggles favorite from the keyboard", async () => {
      await renderWithSalt(
        <ContactDetails variant={variant}>
          <ContactFavoriteToggle defaultIsFavorite={false} />
          <ContactPrimaryInfo text={primaryText} />
        </ContactDetails>,
      );
      await userEvent.tab();
      await userEvent.keyboard("{Enter}");
      await expect
        .poll(favoriteIconClass)
        .toContain("saltContactFavoriteToggle-selected");
    });
  });
}
