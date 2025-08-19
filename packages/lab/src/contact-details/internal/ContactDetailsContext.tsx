import { createContext, useContext } from "react";
import type { ContactDetailsVariant } from "../ContactDetails";

export interface ContactDetailsContext {
  variant: ContactDetailsVariant;

  primary?: string;
  setPrimary: (primary?: string) => void;
  primaryId?: string;
  setPrimaryId: (primaryId?: string) => void;

  secondary?: string;
  setSecondary: (secondary?: string) => void;
  secondaryId?: string;
  setSecondaryId: (secondaryId?: string) => void;

  tertiary?: string;
  setTertiary: (tertiary?: string) => void;
  tertiaryId?: string;
  setTertiaryId: (tertiaryId?: string) => void;

  hasAvatar?: boolean;
  setHasAvatar: (hasAvatar: boolean) => void;

  isStacked?: boolean;
}

export const ContactDetailsContext = createContext<
  ContactDetailsContext | undefined
>(undefined);

export const useContactDetailsContext = (): ContactDetailsContext => {
  const context = useContext(ContactDetailsContext);
  if (!context) {
    throw new Error(
      "useContactDetailsContext should be used inside of ContactDetails",
    );
  }
  return context;
};
